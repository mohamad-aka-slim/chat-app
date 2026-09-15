from app.db.database import get_db
from app.models.schemas import MessageResponse


async def save_message(
    room_id: int, user_id: int, username: str, content: str
) -> None:
    async with get_db() as db:
        await db.execute(
            "INSERT INTO messages (room_id, user_id, username, content) "
            "VALUES (?, ?, ?, ?)",
            (room_id, user_id, username, content),
        )
        await db.commit()


async def get_messages(room_id: int, limit: int = 50) -> list[MessageResponse]:
    limit = max(1, min(limit, 200))
    async with get_db() as db:
        cursor = await db.execute(
            """
            SELECT id, room_id, username, content, timestamp
            FROM messages
            WHERE room_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (room_id, limit),
        )
        rows = await cursor.fetchall()
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