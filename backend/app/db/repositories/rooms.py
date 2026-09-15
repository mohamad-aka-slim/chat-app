from app.db.database import get_db
from app.models.schemas import RoomResponse


async def create_room(name: str, description: str | None, created_by: int) -> int:
    async with get_db() as db:
        cursor = await db.execute(
            "INSERT INTO rooms (name, description, created_by) VALUES (?, ?, ?)",
            (name, description, created_by),
        )
        await db.commit()
        return cursor.lastrowid


async def get_all_rooms() -> list[RoomResponse]:
    async with get_db() as db:
        cursor = await db.execute(
            """
            SELECT r.id, r.name, r.description, COUNT(m.id) AS message_count
            FROM rooms r
            LEFT JOIN messages m ON r.id = m.room_id
            GROUP BY r.id
            ORDER BY r.id
            """
        )
        rows = await cursor.fetchall()
        return [
            RoomResponse(
                id=row[0],
                name=row[1],
                description=row[2],
                message_count=row[3],
            )
            for row in rows
        ]


async def get_room(room_id: int) -> RoomResponse | None:
    async with get_db() as db:
        cursor = await db.execute(
            """
            SELECT r.id, r.name, r.description, COUNT(m.id) AS message_count
            FROM rooms r
            LEFT JOIN messages m ON r.id = m.room_id
            WHERE r.id = ?
            GROUP BY r.id
            """,
            (room_id,),
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return RoomResponse(
            id=row[0],
            name=row[1],
            description=row[2],
            message_count=row[3],
        )