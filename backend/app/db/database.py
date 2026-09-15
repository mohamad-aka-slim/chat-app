from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import aiosqlite

from app.core.config import settings

DATABASE_URL: str = settings.database_url


@asynccontextmanager
async def get_db() -> AsyncIterator[aiosqlite.Connection]:
    async with aiosqlite.connect(DATABASE_URL) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        yield db


async def init_db() -> None:
    async with get_db() as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_by INTEGER NOT NULL REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL REFERENCES rooms(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                username TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp "
            "ON messages(room_id, timestamp)"
        )
        await db.commit()