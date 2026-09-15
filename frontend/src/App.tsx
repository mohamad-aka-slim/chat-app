import { useState } from "react";
import { ChatScreen } from "./components/ChatScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RoomScreen, type Room } from "./components/RoomScreen";
import "./index.css";

export function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<Room | null>(null);

  const createRoom = (name: string) => {
    const newRoom: Room = { id: String(Date.now()), name, createdBy: username ?? "unknown" };
    setRooms((prev) => [...prev, newRoom]);
    setRoom(newRoom);
  };

  return (
    <main className="flex h-dvh w-full">
      {username === null ? (
        <LoginScreen onLogin={setUsername} />
      ) : room === null ? (
        <RoomScreen
          username={username}
          rooms={rooms}
          onCreateRoom={createRoom}
          onJoinRoom={setRoom}
          onLogout={() => setUsername(null)}
        />
      ) : (
        <ChatScreen username={username} roomName={room.name} onLeave={() => setRoom(null)} />
      )}
    </main>
  );
}

export default App;