class ChatWebSocket {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(roomId: number, onMessage: (msg: any) => void) {
        this.ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

        this.ws.onopen = () => {
            console.log('Connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        this.ws.onclose = () => {
            this.handleReconnect(roomId, onMessage);
        };
    }

    send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    disconnect() {
        this.ws?.close();
        this.ws = null;
    }

    private handleReconnect(roomId: number, onMessage: (msg: any) => void) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                this.connect(roomId, onMessage);
            }, 3000 * this.reconnectAttempts);
        }
    }
}

export const chatWS = new ChatWebSocket();
