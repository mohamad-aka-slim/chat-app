from fastapi import WebSocket
from loguru import logger


class ConnectionManager:
    def __init__(self) -> None:
        self._active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int) -> None:
        await websocket.accept()
        self._active_connections.setdefault(room_id, []).append(websocket)
        logger.info(f"Client connected to room {room_id}")

    def disconnect(self, websocket: WebSocket, room_id: int) -> None:
        connections = self._active_connections.get(room_id)
        if connections and websocket in connections:
            connections.remove(websocket)
            if not connections:
                del self._active_connections[room_id]
            logger.info(f"Client disconnected from room {room_id}")

    async def broadcast(self, message: dict, room_id: int) -> None:
        connections = self._active_connections.get(room_id, [])
        for connection in list(connections):
            try:
                await connection.send_json(message)
            except Exception:
                logger.exception(f"Error sending to client in room {room_id}")
                self.disconnect(connection, room_id)


connection_manager = ConnectionManager()