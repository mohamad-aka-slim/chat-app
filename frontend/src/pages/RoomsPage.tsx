import { type FormEvent, useState } from "react";
import { Hash, Loader2, LogOut, MessageCircle, MessageSquareText, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { StoredTheme } from "@/lib/session";
import { LIMITS } from "@/types/limits";
import type { Room } from "@/types/Room";

export function RoomsPage({
  username,
  rooms,
  onCreateRoom,
  onJoinRoom,
  onLogout,
  theme,
  onToggleTheme,
}: {
  username: string;
  rooms: Room[];
  onCreateRoom: (name: string, description?: string) => Promise<Room>;
  onJoinRoom: (room: Room) => void;
  onLogout: () => void;
  theme: StoredTheme;
  onToggleTheme: () => void;
}) {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = roomName.trim();
    const description = roomDescription.trim();
    if (name.length < LIMITS.roomName.min || creating) return;

    setCreating(true);
    setError("");
    try {
      await onCreateRoom(name, description || undefined);
      setRoomName("");
      setRoomDescription("");
    } catch {
      setError("Couldn't create the room. Is the server reachable?");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessageCircle className="size-5" strokeWidth={2.2} />
          </div>
          <span className="truncate text-lg font-bold tracking-tight">Chatterbox</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 sm:flex">
            <Avatar name={username} self className="size-6 text-xs" />
            <span className="text-sm font-medium">{username}</span>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <Button variant="outline" size="icon-sm" onClick={onLogout} aria-label="Log out" title="Log out">
            <LogOut className="size-4" />
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
                onChange={(e) => {
                  setRoomName(e.target.value);
                  if (error) setError("");
                }}
                maxLength={LIMITS.roomName.max}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="room-description">Description (optional)</Label>
              <Input
                id="room-description"
                placeholder="e.g. A general chat room"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                maxLength={LIMITS.roomDescription.max}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={creating || roomName.trim().length < LIMITS.roomName.min}>
              {creating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus />
                  Create room
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rooms</h2>
          <Badge variant="outline">
            {rooms.length} room{rooms.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {rooms.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Hash className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              No rooms yet — create the first one to get things going.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 motion-safe:animate-in motion-safe:fade-in-0">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => onJoinRoom(room)}
                className="group flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition hover:border-ring/60 hover:shadow-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Hash className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{room.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {room.description || "No description"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <Badge variant={room.message_count > 0 ? "default" : "outline"}>
                    <MessageSquareText className="size-3" />
                    {room.message_count}
                  </Badge>
                  <span className="font-medium text-primary transition-transform group-hover:translate-x-0.5">
                    Join →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}