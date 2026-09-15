import { useState } from "react";
import { ChatScreen } from "./components/ChatScreen";
import { LoginScreen } from "./components/LoginScreen";
import "./index.css";

export function App() {
  const [username, setUsername] = useState<string | null>(null);

  return (
    <main className="flex h-dvh w-5xl ">
      {username ? (
        <ChatScreen username={username} onLogout={() => setUsername(null)} />
      ) : (
        <LoginScreen onLogin={setUsername} />
      )}
    </main>
  );
}

export default App;
