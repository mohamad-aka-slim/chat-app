from app.db.repositories import rooms as rooms_repository
from app.models.schemas import CreateRoomRequest, RoomResponse


async def create_room(payload: CreateRoomRequest) -> RoomResponse:
    room_id = await rooms_repository.create_room(
        name=payload.name,
        description=payload.description,
        created_by=payload.created_by,
    )
    room = await rooms_repository.get_room(room_id)
    if room is None:
        raise RuntimeError("Room creation failed")
    return room


async def get_room(room_id: int) -> RoomResponse | None:
    return await rooms_repository.get_room(room_id)


async def list_rooms() -> list[RoomResponse]:
    return await rooms_repository.get_all_rooms()