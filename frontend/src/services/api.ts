import type { CreateRoomPayload, Room } from "@/types/Room";
import type { CreateUserPayload, User } from "@/types/User";
import type { Message } from "@/types/Message";

const API_BASE = 'http://localhost:8000/api';

export const api = {
    // User endpoints
    createUser: async (username: string): Promise<User> => {
        const payload: CreateUserPayload = { username };
        const response = await fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Failed to create user: HTTP ${response.status}`);
        return response.json();
    },

    // Room endpoints
    getRooms: async (): Promise<Room[]> => {
        const response = await fetch(`${API_BASE}/rooms`);
        if (!response.ok) throw new Error(`Failed to list rooms: HTTP ${response.status}`);
        return response.json();
    },

    createRoom: async (name: string, createdBy: number, description?: string): Promise<Room> => {
        const payload: CreateRoomPayload = { name, description: description ?? null, created_by: createdBy };
        const response = await fetch(`${API_BASE}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Failed to create room: HTTP ${response.status}`);
        return response.json();
    },

    // Message endpoints
    getMessages: async (roomId: number): Promise<Message[]> => {
        const response = await fetch(`${API_BASE}/rooms/${roomId}/messages`);
        if (!response.ok) throw new Error(`Failed to load messages: HTTP ${response.status}`);
        return response.json();
    },
}