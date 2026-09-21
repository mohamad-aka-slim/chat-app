// Matches backend app/schemas/schemas.py MessageResponse (REST) and WS broadcast shape.
export type Message = {
    id: number;
    room_id: number;
    user_id: number;
    username: string;
    content: string;
    timestamp: string;
};

// Matches backend WebSocketIncomingMessage (what the client sends over WS).
export type SendMessagePayload = {
    room_id: number;
    user_id: number;
    username: string;
    content: string;
};

// Matches backend WS broadcast / error frames.
export type WsMessage = {
    type: "message";
    id: number;
    room_id: number;
    user_id: number;
    username: string;
    content: string;
    timestamp: string;
};

export type WsError = {
    type: "error";
    detail: string;
};

export type WsIncoming = WsMessage | WsError;