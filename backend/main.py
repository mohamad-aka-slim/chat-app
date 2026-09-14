import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import uvicorn
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

import database
from config import settings
from ConnectionManager import ConnectionManager
from models import (
    CreateRoomRequest,
    CreateUserRequest,
    MessageResponse,
    RoomResponse,
    User,
    WebSocketIncomingMessage,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.init_db()
    logger.info("Database initialized successfully")
    yield
    logger.info("Application shutting down")


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.remove()
logger.add(
    "logs/app.log",
    rotation="500 MB",
    retention="10 days",
    level=settings.log_level,
)

manager = ConnectionManager()


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


# ========== REST API Endpoints ==========


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/api/user", status_code=201, response_model=User)
async def create_user(user: CreateUserRequest):
    existing = await database.get_user_by_username(user.username)
    if existing:
        return existing

    await database.create_user(user)
    return await database.get_user_by_username(user.username)


@app.get("/api/user/{username}", response_model=User)
async def get_user(username: str):
    user = await database.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/rooms", status_code=201, response_model=RoomResponse)
async def create_room(room: CreateRoomRequest):
    room_id = await database.create_room(room.name, room.description, room.created_by)
    room = await database.get_room(room_id)
    if not room:
        raise HTTPException(status_code=500, detail="Room creation failed")
    return room


@app.get("/api/rooms", response_model=list[RoomResponse])
async def list_rooms():
    return await database.get_all_rooms()


@app.get("/api/rooms/{room_id}/messages", response_model=list[MessageResponse])
async def list_messages(room_id: int, limit: int = 50):
    if not await database.get_room(room_id):
        raise HTTPException(status_code=404, detail="Room not found")
    return await database.get_messages(room_id, limit)


# ========== WebSocket ==========


@app.websocket("/rooms/{room_id}/ws")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    await manager.connect(websocket, room_id)

    if not await database.get_room(room_id):
        await websocket.send_json({"type": "error", "detail": "Room not found"})
        manager.disconnect(websocket, room_id)
        await websocket.close(code=1008)
        return

    try:
        while True:
            raw = await websocket.receive_json()
            try:
                msg = WebSocketIncomingMessage.model_validate(raw)
            except Exception:  # noqa: BLE001
                await websocket.send_json(
                    {"type": "error", "detail": "Invalid message format"}
                )
                continue

            if msg.room_id != room_id:
                await websocket.send_json(
                    {"type": "error", "detail": "room_id does not match connection"}
                )
                continue

            await database.save_message(room_id, msg.user_id, msg.username, msg.content)

            message = {
                "type": "message",
                "id": raw.get("id"),
                "room_id": room_id,
                "username": msg.username,
                "content": msg.content,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

            await manager.broadcast(message, room_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
    except Exception as e:  # noqa: BLE001
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, room_id)


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)