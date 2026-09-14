import sys
from datetime import datetime
from pathlib import Path

import aiosqlite
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import database
from models import User


@pytest.fixture
async def db(tmp_path):
    database.DATABASE_URL = str(tmp_path / "test.db")
    await database.init_db()
    yield database
    database.DATABASE_URL = "database.db"


@pytest.mark.anyio
async def test_init_db_creates_tables(db):
    async with aiosqlite.connect(db.DATABASE_URL) as conn:
        cursor = await conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )
        tables = {row[0] for row in await cursor.fetchall()}
    assert {"users", "rooms", "messages"} <= tables


@pytest.mark.anyio
async def test_create_user_returns_id(db):
    user_id = await db.create_user(User(id=0, username="alice", created_at=datetime.now()))
    assert isinstance(user_id, int)
    assert user_id > 0


@pytest.mark.anyio
async def test_get_user_by_username(db):
    user_id = await db.create_user(User(id=0, username="bob", created_at=datetime.now()))
    user = await db.get_user_by_username("bob")
    assert user is not None
    assert user.id == user_id
    assert user.username == "bob"


@pytest.mark.anyio
async def test_create_user_duplicate_username_raises(db):
    await db.create_user(User(id=0, username="carol", created_at=datetime.now()))
    with pytest.raises(aiosqlite.IntegrityError):
        await db.create_user(User(id=0, username="carol", created_at=datetime.now()))


@pytest.mark.anyio
async def test_get_user_by_username_missing_returns_none(db):
    assert await db.get_user_by_username("ghost") is None


@pytest.mark.anyio
async def test_create_room_and_get_it(db):
    user_id = await db.create_user(User(id=0, username="dave", created_at=datetime.now()))
    room_id = await db.create_room("General", "A room", user_id)
    assert room_id > 0

    saved = await db.get_room(room_id)
    assert saved is not None
    assert saved.name == "General"
    assert saved.message_count == 0


@pytest.mark.anyio
async def test_save_and_get_messages(db):
    user_id = await db.create_user(User(id=0, username="erin", created_at=datetime.now()))
    room_id = await db.create_room("Chat", None, user_id)

    await db.save_message(room_id, user_id, "erin", "hello docker")
    await db.save_message(room_id, user_id, "erin", "hello sql")

    messages = await db.get_messages(room_id)
    assert [m.content for m in messages] == ["hello docker", "hello sql"]
    assert messages[0].timestamp is not None


@pytest.mark.anyio
async def test_get_messages_unknown_room_is_empty(db):
    assert await db.get_messages(9999) == []