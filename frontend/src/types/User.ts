// Matches backend app/models/user.py + app/schemas/schemas.py User/CreateUserRequest
export type User = {
    id: number;
    username: string;
    created_at: string;
};

export type CreateUserPayload = {
    username: string;
};