import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Message = {
  id: number;
  user: string;
  text: string;
  at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatScreen({
  username,
  roomName,
  onLeave,
}: {
  username: string;
  roomName: string;
  onLeave: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), user: username, text, at: new Date().toISOString() },
    ]);
    setDraft("");
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold"># {roomName}</h1>
          <p className="truncate text-sm text-muted-foreground">Signed in as {username}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onLeave}>
          Leave
        </Button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto rounded-md border bg-muted/40 p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user === username;
            return (
              <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                <span className="mb-1 text-xs text-muted-foreground">
                  {msg.user} · {formatTime(msg.at)}
                </span>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    isOwn
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border bg-background"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="h-10"
        />
        <Button type="submit" className="h-10">
          Send
        </Button>
      </form>
    </div>
  );
}