from fastapi import APIRouter, Response

from app.schemas.schemas import CreateUserRequest, User
from app.services import user_service

router = APIRouter(prefix="/api/user", tags=["users"])


@router.post("", response_model=User)
async def create_user(payload: CreateUserRequest, response: Response) -> User:
    user, created = await user_service.create_user(payload)
    response.status_code = 201 if created else 200
    return user


@router.get("/{username}", response_model=User)
async def get_user(username: str) -> User:
    return await user_service.get_user(username)
