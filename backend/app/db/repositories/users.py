from sqlalchemy import select

from app.core.datetime import ensure_utc
from app.db.database import get_db
from app.models import User as UserModel
from app.schemas import User


async def create_user(username: str) -> int:
    async with get_db() as session:
        user = UserModel(username=username)
        session.add(user)
        await session.commit()
        return user.id


async def get_user_by_username(username: str) -> User | None:
    async with get_db() as session:
        result = await session.execute(
            select(UserModel).where(UserModel.username == username)
        )
        user = result.scalar_one_or_none()
        if user is None:
            return None
        return User(id=user.id, username=user.username, created_at=ensure_utc(user.created_at))


async def get_user_by_id(user_id: int) -> User | None:
    async with get_db() as session:
        user = await session.get(UserModel, user_id)
        if user is None:
            return None
        return User(id=user.id, username=user.username, created_at=ensure_utc(user.created_at))