from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ========== Table Schema Models ==========


class User(BaseModel):
    id: int
    username: str
    created_at: datetime


class Room(BaseModel):
    id: int
    name: str
    description: str | None = None
    created_at: datetime
    created_by: int


class Message(BaseModel):
    id: int
    room_id: int
    user_id: int
    username: str
    content: str
    timestamp: datetime


# ========== Request Schemas ==========


class CreateUserRequest(BaseModel):
    username: str = Field(min_length=2, max_length=50)


class CreateRoomRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    created_by: int


class WebSocketIncomingMessage(BaseModel):
    room_id: int
    user_id: int
    username: str = Field(min_length=1, max_length=50)
    content: str = Field(min_length=1, max_length=2000)


# ========== Response Schemas ==========


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    room_id: int
    username: str
    content: str
    timestamp: datetime


class RoomResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    message_count: int = 0