from fastapi import APIRouter

from app.models.schemas import CreateRoomRequest, MessageResponse, RoomResponse
from app.services import message_service, room_service

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.post("", status_code=201, response_model=RoomResponse)
async def create_room(payload: CreateRoomRequest) -> RoomResponse:
    return await room_service.create_room(payload)


@router.get("", response_model=list[RoomResponse])
async def list_rooms() -> list[RoomResponse]:
    return await room_service.list_rooms()


@router.get("/{room_id}/messages", response_model=list[MessageResponse])
async def list_messages(room_id: int, limit: int = 50) -> list[MessageResponse]:
    return await message_service.list_messages(room_id, limit)