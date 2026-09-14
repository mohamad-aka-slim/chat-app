from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

import aiosqlite

from config import settings
from models import MessageResponse, RoomResponse, User

DATABASE_URL: str = settings.database_url


@asynccontextmanager
async def _db() -> AsyncIterator[aiosqlite.Connection]:
    async with aiosqlite.connect(DATABASE_URL) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        yield db


async def init_db() -> None:
    async with _db() as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_by INTEGER NOT NULL REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL REFERENCES rooms(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                username TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp ON messages(room_id, timestamp)"
        )
        await db.commit()


async def create_user(user: User) -> int:
    async with _db() as db:
        cursor = await db.execute(
            "INSERT INTO users (username) VALUES (?)",
            (user.username,),
        )
        await db.commit()
        return cursor.lastrowid


async def get_user_by_username(username: str) -> User | None:
    async with _db() as db:
        cursor = await db.execute(
            "SELECT id, username, created_at FROM users WHERE username = ?",
            (username,),
        )
        user = await cursor.fetchone()
        if not user:
            return None
        return User(
            id=user[0],
            username=user[1],
            created_at=user[2],
        )


async def create_room(name: str, description: str | None, created_by: int) -> int:
    async with _db() as db:
        cursor = await db.execute(
            "INSERT INTO rooms (name, description, created_by) VALUES (?, ?, ?)",
            (name, description, created_by),
        )
        await db.commit()
        return cursor.lastrowid


async def get_all_rooms() -> list[RoomResponse]:
    async with _db() as db:
        cursor = await db.execute(
            """SELECT r.id, r.name, r.description, COUNT(m.id) as message_count
               FROM rooms r
               LEFT JOIN messages m ON r.id = m.room_id
               GROUP BY r.id
               ORDER BY r.id"""
        )
        rooms = await cursor.fetchall()
        return [
            RoomResponse(
                id=row[0],
                name=row[1],
                description=row[2],
                message_count=row[3],
            )
            for row in rooms
        ]


async def get_room(room_id: int) -> RoomResponse | None:
    async with _db() as db:
        cursor = await db.execute(
            """SELECT r.id, r.name, r.description, COUNT(m.id) as message_count
               FROM rooms r
               LEFT JOIN messages m ON r.id = m.room_id
               WHERE r.id = ?
               GROUP BY r.id""",
            (room_id,),
        )
        row = await cursor.fetchone()
        if not row:
            return None
        return RoomResponse(
            id=row[0],
            name=row[1],
            description=row[2],
            message_count=row[3],
        )


async def save_message(room_id: int, user_id: int, username: str, content: str) -> None:
    async with _db() as db:
        await db.execute(
            "INSERT INTO messages (room_id, user_id, username, content) VALUES (?, ?, ?, ?)",
            (room_id, user_id, username, content),
        )
        await db.commit()


async def get_messages(room_id: int, limit: int = 50) -> list[MessageResponse]:
    limit = max(1, min(limit, 200))
    async with _db() as db:
        cursor = await db.execute(
            """SELECT id, room_id, username, content, timestamp
               FROM messages
               WHERE room_id = ?
               ORDER BY timestamp DESC
               LIMIT ?""",
            (room_id, limit),
        )
        rows = await cursor.fetchall()
        # Reverse to return messages in chronological order.
        return [
            MessageResponse(
                id=row[0],
                room_id=row[1],
                username=row[2],
                content=row[3],
                timestamp=row[4],
            )
            for row in reversed(rows)
        ]