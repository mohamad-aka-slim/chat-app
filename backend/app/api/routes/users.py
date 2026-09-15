from fastapi import APIRouter

from app.models.schemas import CreateUserRequest, User
from app.services import user_service

router = APIRouter(prefix="/api/user", tags=["users"])


@router.post("", status_code=201, response_model=User)
async def create_user(payload: CreateUserRequest) -> User:
    return await user_service.create_user(payload)


@router.get("/{username}", response_model=User)
async def get_user(username: str) -> User:
    return await user_service.get_user(username)