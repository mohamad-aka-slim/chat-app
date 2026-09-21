from app.core.exceptions import ResourceNotFoundError
from app.db.repositories import messages as messages_repository
from app.db.repositories import rooms as rooms_repository
from app.schemas import MessageResponse, WebSocketIncomingMessage


async def list_messages(room_id: int, limit: int = 50) -> list[MessageResponse]:
    if await rooms_repository.get_room(room_id) is None:
        raise ResourceNotFoundError("Room not found")
    return await messages_repository.get_messages(room_id, limit)


async def save_message(payload: WebSocketIncomingMessage) -> int:
    return await messages_repository.save_message(
        room_id=payload.room_id,
        user_id=payload.user_id,
        username=payload.username,
        content=payload.content,
    )
