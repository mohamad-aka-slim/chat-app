from sqlalchemy import select

from app.core.datetime import ensure_utc
from app.db.database import get_db
from app.models import Message
from app.schemas import MessageResponse


async def save_message(
    room_id: int, user_id: int, username: str, content: str
) -> int:
    async with get_db() as session:
        message = Message(
            room_id=room_id,
            user_id=user_id,
            username=username,
            content=content,
        )
        session.add(message)
        await session.commit()
        await session.refresh(message)
        return message.id


async def get_messages(room_id: int, limit: int = 50) -> list[MessageResponse]:
    limit = max(1, min(limit, 200))
    async with get_db() as session:
        result = await session.execute(
            select(Message)
            .where(Message.room_id == room_id)
            .order_by(Message.timestamp.desc())
            .limit(limit)
        )
        messages = result.scalars().all()
        return [
            MessageResponse(
                id=message.id,
                room_id=message.room_id,
                user_id=message.user_id,
                username=message.username,
                content=message.content,
                timestamp=ensure_utc(message.timestamp),
            )
            for message in reversed(messages)
        ]