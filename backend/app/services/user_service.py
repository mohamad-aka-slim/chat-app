from app.core.exceptions import ResourceNotFoundError
from app.db.repositories import users as users_repository
from app.models.schemas import CreateUserRequest, User


async def create_user(payload: CreateUserRequest) -> User:
    existing = await users_repository.get_user_by_username(payload.username)
    if existing:
        return existing

    await users_repository.create_user(payload.username)
    return await get_user(payload.username)


async def get_user(username: str) -> User:
    user = await users_repository.get_user_by_username(username)
    if user is None:
        raise ResourceNotFoundError("User not found")
    return user