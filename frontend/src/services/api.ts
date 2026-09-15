const API_BASE = 'http://localhost:8000/api';

export const api = {
    // User endpoints
    createUser: async (username:string) => {
        const response = await fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:  JSON.stringify({ username }),
        });
        return response.json();
    },


    // getUser: async (username: string) => {
    //     const res = await fetch(`${API_BASE}/users/${username}`);
    //     if (!res.ok) throw
    // },


    // Room endpoints
    getRooms: () =>
        fetch(`${API_BASE}/rooms`).then(res => res.json()),

    createRoom: (name: string, createdBy: number, description?: string) =>
        fetch(`${API_BASE}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, created_by: createdBy })
        }).then(res => res.json()),
}
