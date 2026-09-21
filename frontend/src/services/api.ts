import { config } from "@/lib/config";
import type { CreateRoomPayload, Room } from "@/types/Room";
import type { CreateUserPayload, User } from "@/types/User";
import type { Message } from "@/types/Message";

const API_BASE = config.apiBase;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
    });
    if (!response.ok) {
        throw new Error(`Request failed: HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export const api = {
    // User endpoints
    createUser: (username: string): Promise<User> => {
        const payload: CreateUserPayload = { username };
        return request<User>("/user", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    // Room endpoints
    getRooms: (): Promise<Room[]> => request<Room[]>("/rooms"),

    createRoom: (name: string, createdBy: number, description?: string): Promise<Room> => {
        const payload: CreateRoomPayload = { name, description: description ?? null, created_by: createdBy };
        return request<Room>("/rooms", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    // Message endpoints
    getMessages: (roomId: number): Promise<Message[]> => request<Message[]>(`/rooms/${roomId}/messages`),
};