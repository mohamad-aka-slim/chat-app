from sqlalchemy import func, select

from app.db.database import get_db
from app.models import Message, Room as RoomModel
from app.schemas import RoomResponse


async def create_room(name: str, description: str | None, created_by: int) -> int:
    async with get_db() as session:
        room = RoomModel(name=name, description=description, created_by=created_by)
        session.add(room)
        await session.commit()
        return room.id


async def get_all_rooms() -> list[RoomResponse]:
    async with get_db() as session:
        result = await session.execute(
            select(RoomModel, func.count(Message.id))
            .outerjoin(Message, Message.room_id == RoomModel.id)
            .group_by(RoomModel.id)
            .order_by(RoomModel.id)
        )
        return [
            RoomResponse(
                id=room.id,
                name=room.name,
                description=room.description,
                message_count=message_count,
            )
            for room, message_count in result.all()
        ]


async def get_room(room_id: int) -> RoomResponse | None:
    async with get_db() as session:
        room = await session.get(RoomModel, room_id)
        if room is None:
            return None
        message_count = await session.scalar(
            select(func.count(Message.id)).where(Message.room_id == room_id)
        )
        return RoomResponse(
            id=room.id,
            name=room.name,
            description=room.description,
            message_count=message_count or 0,
        )