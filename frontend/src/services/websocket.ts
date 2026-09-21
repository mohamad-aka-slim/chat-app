import { config } from "@/lib/config";
import type { SendMessagePayload, WsIncoming } from "@/types/Message";

const WS_BASE = config.wsBase;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export type ConnStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

class ChatWebSocket {
    private ws: WebSocket | null = null;
    private session = 0;
    private closed = true;
    private reconnectAttempts = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private onMessage: ((msg: WsIncoming) => void) | null = null;
    private onStatus: ((status: ConnStatus) => void) | null = null;

    connect(
        roomId: number,
        onMessage: (msg: WsIncoming) => void,
        onStatus: (status: ConnStatus) => void,
    ) {
        this.disconnect();
        this.closed = false;
        this.onMessage = onMessage;
        this.onStatus = onStatus;
        this.onStatus("connecting");
        this.openSocket(roomId, this.session);
    }

    private openSocket(roomId: number, session: number) {
        const ws = new WebSocket(`${WS_BASE}/rooms/${roomId}/ws`);
        this.ws = ws;

        ws.onopen = () => {
            if (session !== this.session) return;
            this.reconnectAttempts = 0;
            this.onStatus?.("connected");
        };

        ws.onmessage = (event) => {
            if (session !== this.session) return;
            this.onMessage?.(JSON.parse(event.data) as WsIncoming);
        };

        ws.onclose = (event) => {
            if (session !== this.session) return;
            if (this.isRetryableClose(event.code)) {
                this.reconnect(roomId);
            } else {
                this.onStatus?.("disconnected");
            }
        };
    }

    /** Intentional server/client closes we never recover from. Everything else (drops, restarts) we retry. */
    private isRetryableClose(code: number) {
        return ![1000, 1001, 1008, 1009, 1010].includes(code);
    }

    private reconnect(roomId: number) {
        if (this.closed) return;
        if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            this.onStatus?.("disconnected");
            return;
        }
        this.onStatus?.("reconnecting");
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
        if (this.onStatus) {
            this.onStatus("disconnected");
            this.onStatus = null;
        }
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