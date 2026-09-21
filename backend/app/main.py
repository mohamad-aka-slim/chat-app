import time
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# Allow `python app/main.py` (as documented) in addition to `python -m app.main`.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from uvicorn import run

from app.api.routes import health, rooms, users, ws
from app.core.config import settings
from app.core.exceptions import ResourceNotFoundError
from app.core.logging import setup_logging
from app.db import database

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.init_db()
    logger.info("Database initialized successfully")
    yield
    logger.info("Application shutting down")


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        logger.info(f"Request: {request.method} {request.url.path}")

        response = await call_next(request)

        duration = time.time() - start_time
        logger.info(
            f"Response: {response.status_code} | "
            f"Duration: {duration:.2f}s | "
            f"Path: {request.url.path}"
        )
        return response

    @app.exception_handler(ResourceNotFoundError)
    async def resource_not_found_handler(
        request: Request, exc: ResourceNotFoundError
    ):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    app.include_router(health.router)
    app.include_router(users.router)
    app.include_router(rooms.router)
    app.include_router(ws.router)

    return app


app = create_app()


if __name__ == "__main__":
    run("app.main:app", host=settings.host, port=settings.port, reload=True)