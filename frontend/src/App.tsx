import { useEffect, useState } from "react";
import { ChatScreen } from "./components/ChatScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RoomScreen, type Room } from "./components/RoomScreen";
import { api } from "./services/api";
import "./index.css";

type User = { id: number; username: string };

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api.getRooms().then((data) => {
      if (!cancelled) setRooms(data);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreateRoom = async (name: string,description?:string) => {
    if (!user) return;
    const created = await api.createRoom(name, user.id,description);
    setRooms((prev) => [...prev, created]);
    setRoom(created);
  };

  const handleLogout = () => {
    setUser(null);
    setRoom(null);
    setRooms([]);
  };

  return (
    <main className="flex h-dvh">
      {user === null ? (
        <LoginScreen onLogin={setUser} />
      ) : room === null ? (
        <RoomScreen
          username={user.username}
          rooms={rooms}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={setRoom}
          onLogout={handleLogout}
        />
      ) : (
        <ChatScreen username={user.username} roomName={room.name} onLeave={() => setRoom(null)} />
      )}
    </main>
  );
}

export default App;
