from app.db.database import get_db
from app.models.schemas import User


async def create_user(username: str) -> int:
    async with get_db() as db:
        cursor = await db.execute(
            "INSERT INTO users (username) VALUES (?)",
            (username,),
        )
        await db.commit()
        return cursor.lastrowid


async def get_user_by_username(username: str) -> User | None:
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, username, created_at FROM users WHERE username = ?",
            (username,),
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return User(id=row[0], username=row[1], created_at=row[2])