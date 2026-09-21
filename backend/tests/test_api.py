def create_user(client, username="alice"):
    return client.post("/api/user", json={"username": username})


def create_room(client, name="General", created_by=1, description=None):
    body = {"name": name, "description": description, "created_by": created_by}
    return client.post("/api/rooms", json=body)


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_get_user(client):
    created = create_user(client)
    assert created.status_code == 201
    assert created.json()["username"] == "alice"

    fetched = client.get("/api/user/alice")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == created.json()["id"]


def test_get_user_not_found(client):
    response = client.get("/api/user/ghost")
    assert response.status_code == 404


def test_create_user_rejects_short_username(client):
    response = client.post("/api/user", json={"username": "a"})
    assert response.status_code == 422


def test_create_duplicate_user_returns_200(client):
    created = create_user(client)
    duplicate = create_user(client)
    assert duplicate.status_code == 200
    assert duplicate.json()["id"] == created.json()["id"]


def test_user_created_at_is_utc(client):
    created = create_user(client).json()
    assert created["created_at"].endswith("+00:00") or created["created_at"].endswith("Z")


def test_create_and_list_rooms(client):
    create_user(client)
    created = create_room(client)
    assert created.status_code == 201
    assert created.json()["name"] == "General"
    assert created.json()["message_count"] == 0

    rooms = client.get("/api/rooms")
    assert rooms.status_code == 200
    assert any(r["id"] == created.json()["id"] for r in rooms.json())


def test_get_messages_empty(client):
    create_user(client)
    room = create_room(client).json()
    response = client.get(f"/api/rooms/{room['id']}/messages")
    assert response.status_code == 200
    assert response.json() == []


def test_get_messages_unknown_room_404(client):
    response = client.get("/api/rooms/99999/messages")
    assert response.status_code == 404


def test_websocket_chat_flow(client):
    user = create_user(client).json()
    room = create_room(client, created_by=user["id"]).json()

    with client.websocket_connect(f"/rooms/{room['id']}/ws") as ws:
        ws.send_json(
            {
                "room_id": room["id"],
                "user_id": user["id"],
                "username": user["username"],
                "content": "hello world",
            }
        )
        echoed = ws.receive_json()
        assert echoed["type"] == "message"
        assert echoed["content"] == "hello world"
        assert echoed["username"] == user["username"]
        assert echoed["user_id"] == user["id"]
        assert echoed["id"] is not None
        assert echoed["timestamp"].endswith("+00:00") or echoed["timestamp"].endswith("Z")

    messages = client.get(f"/api/rooms/{room['id']}/messages").json()
    assert [m["content"] for m in messages] == ["hello world"]
    assert messages[0]["user_id"] == user["id"]
    assert messages[0]["timestamp"].endswith("+00:00") or messages[0]["timestamp"].endswith("Z")


def test_websocket_rejects_invalid_message(client):
    user = create_user(client).json()
    room = create_room(client, created_by=user["id"]).json()

    with client.websocket_connect(f"/rooms/{room['id']}/ws") as ws:
        ws.send_json({"room_id": room["id"]})
        error = ws.receive_json()
        assert error["type"] == "error"


def test_websocket_room_not_found(client):
    with client.websocket_connect("/rooms/99999/ws") as ws:
        error = ws.receive_json()
        assert error["type"] == "error"
        assert error["detail"] == "Room not found"


def test_websocket_rejects_unknown_user(client):
    user = create_user(client).json()
    room = create_room(client, created_by=user["id"]).json()

    with client.websocket_connect(f"/rooms/{room['id']}/ws") as ws:
        ws.send_json(
            {
                "room_id": room["id"],
                "user_id": 99999,
                "username": "ghost",
                "content": "hello",
            }
        )
        error = ws.receive_json()
        assert error["type"] == "error"
        assert error["detail"] == "User not found"