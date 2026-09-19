// Matches backend app/models/room.py + app/schemas/schemas.py RoomResponse/CreateRoomRequest
export type Room = {
    id: number;
    name: string;
    description: string | null;
    message_count: number;
};

export type CreateRoomPayload = {
    name: string;
    description: string | null;
    created_by: number;
};