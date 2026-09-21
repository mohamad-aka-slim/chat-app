import { useEffect, useState } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { ChatPage } from "./pages/ChatPage";
import { LoginPage } from "./pages/LoginPage";
import { RoomsPage } from "./pages/RoomsPage";
import { api } from "./services/api";
import "./index.css";
import type { Room } from "./types/Room";
import type { User } from "./types/User";



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
    <MainLayout>
      {user === null ? (
        <LoginPage onLogin={setUser} />
      ) : room === null ? (
        <RoomsPage
          username={user.username}
          rooms={rooms}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={setRoom}
          onLogout={handleLogout}
        />
      ) : (
        <ChatPage username={user.username} userId={user.id} roomId={room.id} roomName={room.name} onLeave={() => setRoom(null)} />
      )}
    </MainLayout>
  );
}

export default App;
