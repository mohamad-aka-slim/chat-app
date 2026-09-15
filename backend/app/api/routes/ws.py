from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger
from pydantic import ValidationError

from app.models.schemas import WebSocketIncomingMessage
from app.services import message_service, room_service
from app.ws.manager import connection_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/rooms/{room_id}/ws")
async def websocket_endpoint(websocket: WebSocket, room_id: int) -> None:
    await connection_manager.connect(websocket, room_id)

    if await room_service.get_room(room_id) is None:
        await websocket.send_json({"type": "error", "detail": "Room not found"})
        connection_manager.disconnect(websocket, room_id)
        await websocket.close(code=1008)
        return

    try:
        while True:
            raw = await websocket.receive_json()
            try:
                payload = WebSocketIncomingMessage.model_validate(raw)
            except ValidationError:
                await websocket.send_json(
                    {"type": "error", "detail": "Invalid message format"}
                )
                continue

            if payload.room_id != room_id:
                await websocket.send_json(
                    {"type": "error", "detail": "room_id does not match connection"}
                )
                continue

            await message_service.save_message(payload)

            message = {
                "type": "message",
                "id": raw.get("id"),
                "room_id": room_id,
                "username": payload.username,
                "content": payload.content,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

            await connection_manager.broadcast(message, room_id)

    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, room_id)
    except Exception:
        logger.exception("WebSocket error")
        connection_manager.disconnect(websocket, room_id)