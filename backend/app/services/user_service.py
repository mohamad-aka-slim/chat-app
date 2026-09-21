from app.core.exceptions import ResourceNotFoundError
from app.db.repositories import users as users_repository
from app.schemas import CreateUserRequest, User


async def create_user(payload: CreateUserRequest) -> tuple[User, bool]:
    existing = await users_repository.get_user_by_username(payload.username)
    if existing:
        return existing, False

    await users_repository.create_user(payload.username)
    return await get_user(payload.username), True


async def get_user(username: str) -> User:
    user = await users_repository.get_user_by_username(username)
    if user is None:
        raise ResourceNotFoundError("User not found")
    return user


async def user_exists(user_id: int) -> bool:
    return await users_repository.get_user_by_id(user_id) is not None
