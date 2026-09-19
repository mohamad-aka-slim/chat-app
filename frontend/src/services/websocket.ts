import type { SendMessagePayload, WsIncoming } from "@/types/Message";

const WS_BASE = 'ws://localhost:8000';

class ChatWebSocket {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(roomId: number, onMessage: (msg: WsIncoming) => void) {
        this.ws = new WebSocket(`${WS_BASE}/rooms/${roomId}/ws`);

        this.ws.onopen = () => {
            console.log('Connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data) as WsIncoming;
            onMessage(data);
        };

        this.ws.onclose = () => {
            this.handleReconnect(roomId, onMessage);
        };
    }

    send(payload: SendMessagePayload) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        }
    }

    disconnect() {
        this.ws?.close();
        this.ws = null;
    }

    private handleReconnect(roomId: number, onMessage: (msg: WsIncoming) => void) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                this.connect(roomId, onMessage);
            }, 3000 * this.reconnectAttempts);
        }
    }
}

export const chatWS = new ChatWebSocket();