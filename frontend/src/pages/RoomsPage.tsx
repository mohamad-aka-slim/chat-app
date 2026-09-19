import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LIMITS } from "@/types/limits";
import type { Room } from "@/types/Room";


export function RoomsPage({
  username,
  rooms,
  onCreateRoom,
  onJoinRoom,
  onLogout,
}: {
  username: string;
  rooms: Room[];
  onCreateRoom: (name: string, description: string) => void;
  onJoinRoom: (room: Room) => void;
  onLogout: () => void;
}) {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = roomName.trim();
    const description = roomDescription.trim()
    if (!name) return;
    onCreateRoom(name, description);
    setRoomName("");
    setRoomDescription("");
  };

  return (
    <div className="mx-auto flex  w-2xl flex-col justify-between   gap-4 p-4">
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
                maxLength={LIMITS.roomName.max}
              />
              <Label htmlFor="room-description">Description</Label>
              <Input
                id="room-description"
                placeholder="e.g. A general chat room"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                maxLength={LIMITS.roomDescription.max}
              />
            </div>
            <Button type="submit" disabled={roomName.trim().length < LIMITS.roomName.min}>
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
                <p className="truncate text-xs text-muted-foreground">
                  {room.description ?? `${room.message_count} message${room.message_count === 1 ? "" : "s"}`}
                </p>
              </div>
              <Button onClick={() => onJoinRoom(room)}>Join</Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
