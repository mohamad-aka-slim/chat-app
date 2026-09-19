from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.models import Base

DATABASE_URL: str = settings.database_url

_engine: AsyncEngine | None = None
_engine_url: str | None = None

async_session = async_sessionmaker(expire_on_commit=False)


def _async_url(url: str) -> str:
    if url.startswith("sqlite+aiosqlite"):
        return url
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    return f"sqlite+aiosqlite:///{url}"


def _enable_foreign_keys(dbapi_conn, _records) -> None:
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")
    cursor.close()


def get_engine() -> AsyncEngine:
    global _engine, _engine_url

    url = _async_url(DATABASE_URL)
    if _engine is None or _engine_url != url:
        if _engine is not None:
            _engine.sync_engine.dispose()
        _engine = create_async_engine(url)
        event.listen(_engine.sync_engine, "connect", _enable_foreign_keys)
        _engine_url = url
    return _engine


@asynccontextmanager
async def get_db() -> AsyncIterator[AsyncSession]:
    async with async_session(bind=get_engine()) as session:
        yield session


async def init_db() -> None:
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)