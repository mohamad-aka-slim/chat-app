import { useCallback, useEffect, useState } from "react";
import { MainLayout } from "./layouts/MainLayout";
import { ChatPage } from "./pages/ChatPage";
import { LoginPage } from "./pages/LoginPage";
import { RoomsPage } from "./pages/RoomsPage";
import { useDarkMode } from "./hooks/useDarkMode";
import { loadUser, saveUser } from "./lib/session";
import { api } from "./services/api";
import "./index.css";
import type { Room } from "./types/Room";
import type { User } from "./types/User";

export function App() {
  const [user, setUser] = useState<User | null>(() => loadUser());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const { theme, toggle } = useDarkMode();

  useEffect(() => {
    saveUser(user);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRooms([]);
      return;
    }
    let cancelled = false;
    api
      .getRooms()
      .then((data) => {
        if (!cancelled) setRooms(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreateRoom = useCallback(
    async (name: string, description?: string): Promise<Room> => {
      if (!user) throw new Error("Not signed in");
      const created = await api.createRoom(name, user.id, description);
      setRooms((prev) => [...prev, created]);
      setRoom(created);
      return created;
    },
    [user],
  );

  const handleLogout = () => {
    setUser(null);
    setRoom(null);
  };

  return (
    <MainLayout>
      {user === null ? (
        <LoginPage onLogin={setUser} theme={theme} onToggleTheme={toggle} />
      ) : room === null ? (
        <RoomsPage
          username={user.username}
          rooms={rooms}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={setRoom}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggle}
        />
      ) : (
        <ChatPage
          username={user.username}
          userId={user.id}
          roomId={room.id}
          roomName={room.name}
          onLeave={() => setRoom(null)}
          theme={theme}
          onToggleTheme={toggle}
        />
      )}
    </MainLayout>
  );
}

export default App;