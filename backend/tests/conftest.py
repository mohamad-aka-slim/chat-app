import pytest
from fastapi.testclient import TestClient

from app.db import database
from app.main import app


@pytest.fixture(autouse=True)
def test_database(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DATABASE_URL", str(tmp_path / "test.db"))


@pytest.fixture
def client(test_database):
    with TestClient(app) as test_client:
        yield test_client