import type { SendMessagePayload, WsIncoming } from "@/types/Message";

const WS_BASE = "ws://localhost:8000";
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

class ChatWebSocket {
    private ws: WebSocket | null = null;
    private session = 0;
    private closed = true;
    private reconnectAttempts = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private onMessage: ((msg: WsIncoming) => void) | null = null;

    connect(roomId: number, onMessage: (msg: WsIncoming) => void) {
        this.disconnect();
        this.closed = false;
        this.onMessage = onMessage;
        this.openSocket(roomId, this.session);
    }

    private openSocket(roomId: number, session: number) {
        const ws = new WebSocket(`${WS_BASE}/rooms/${roomId}/ws`);
        this.ws = ws;

        ws.onopen = () => {
            if (session !== this.session) return;
            console.log("Connected");
            this.reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
            if (session !== this.session) return;
            this.onMessage?.(JSON.parse(event.data) as WsIncoming);
        };

        ws.onclose = () => {
            if (session !== this.session) return;
            this.reconnect(roomId);
        };
    }

    private reconnect(roomId: number) {
        if (this.closed) return;
        if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
        this.reconnectAttempts++;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.openSocket(roomId, this.session);
        }, RECONNECT_DELAY * this.reconnectAttempts);
    }

    send(payload: SendMessagePayload) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        }
    }

    disconnect() {
        this.closed = true;
        this.session++;
        this.onMessage = null;
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }
    }
}

export const chatWS = new ChatWebSocket();