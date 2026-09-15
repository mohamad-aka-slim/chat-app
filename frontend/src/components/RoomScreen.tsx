import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Room = {
  id: string;
  name: string;
  createdBy: string;
};

export function RoomScreen({
  username,
  rooms,
  onCreateRoom,
  onJoinRoom,
  onLogout,
}: {
  username: string;
  rooms: Room[];
  onCreateRoom: (name: string) => void;
  onJoinRoom: (room: Room) => void;
  onLogout: () => void;
}) {
  const [roomName, setRoomName] = useState("");

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = roomName.trim();
    if (!name) return;
    onCreateRoom(name);
    setRoomName("");
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="truncate text-xl font-bold">Rooms</h1>
        <div className="flex items-center gap-3">
          <span className="truncate text-sm text-muted-foreground">{username}</span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create a room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                placeholder="e.g. General"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={!roomName.trim()}>
              Create room
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Available rooms</h2>
        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rooms yet. Create one to get started!</p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between gap-4 rounded-md border bg-card p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{room.name}</p>
                <p className="truncate text-xs text-muted-foreground">Created by {room.createdBy}</p>
              </div>
              <Button onClick={() => onJoinRoom(room)}>Join</Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}