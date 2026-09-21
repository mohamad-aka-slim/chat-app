import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Hash, Loader2, SendHorizontal } from "lucide-react";
import { Avatar, avatarColors } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { StoredTheme } from "@/lib/session";
import { api } from "@/services/api";
import { chatWS, type ConnStatus } from "@/services/websocket";
import { LIMITS } from "@/types/limits";
import type { Message, WsIncoming } from "@/types/Message";

const GROUP_GAP_MS = 5 * 60 * 1000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function withinGroup(previous: Message, current: Message): boolean {
  if (previous.username !== current.username) return false;
  const gap = new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime();
  return gap >= 0 && gap < GROUP_GAP_MS;
}

type MessageRow =
  | { type: "separator"; key: string; label: string }
  | { type: "message"; key: number; message: Message; first: boolean; last: boolean };

const STATUS_LABEL: Record<ConnStatus, string> = {
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
};

const STATUS_CLASS: Record<ConnStatus, string> = {
  connecting: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  connected: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  reconnecting: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  disconnected: "bg-destructive/15 text-destructive",
};

export function ChatPage({
  username,
  userId,
  roomId,
  roomName,
  onLeave,
  theme,
  onToggleTheme,
}: {
  username: string;
  userId: number;
  roomId: number;
  roomName: string;
  onLeave: () => void;
  theme: StoredTheme;
  onToggleTheme: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<ConnStatus>("disconnected");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    const onMessage = (msg: WsIncoming) => {
      if (msg.type !== "message") return;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    };

    setLoadingHistory(true);
    setHistoryError("");
    api
      .getMessages(roomId)
      .then((history) => {
        if (!cancelled) setMessages(history);
      })
      .catch(() => {
        if (!cancelled) setHistoryError("Couldn't load the conversation history.");
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    chatWS.connect(roomId, onMessage, setStatus);

    return () => {
      cancelled = true;
      chatWS.disconnect();
    };
  }, [roomId]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loadingHistory]);

  const rows = useMemo<MessageRow[]>(() => {
    const output: MessageRow[] = [];
    let lastDateKey = "";
    let previous: Message | null = null;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (!message) continue;
      const date = new Date(message.timestamp);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (dateKey !== lastDateKey) {
        lastDateKey = dateKey;
        output.push({ type: "separator", key: dateKey, label: formatDay(date) });
      }

      const next = messages[i + 1] ?? null;
      output.push({
        type: "message",
        key: message.id,
        message,
        first: previous === null || !withinGroup(previous, message),
        last: next === null || !withinGroup(message, next),
      });
      previous = message;
    }
    return output;
  }, [messages]);

  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft.trim();
    if (status !== "connected" || text.length < LIMITS.message.min) return;
    chatWS.send({ room_id: roomId, user_id: userId, username, content: text });
    setDraft("");
  };

  const isConnected = status === "connected";
  const canSend = isConnected && draft.trim().length >= LIMITS.message.min;

  return (
    <div className="flex w-full justify-center">
      <div className="flex h-full w-full max-w-3xl flex-col gap-3 p-3 sm:p-5">
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onLeave}
              className="-ml-1 shrink-0"
              aria-label="Back to rooms"
              title="Back to rooms"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Hash className="size-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base leading-tight font-bold">{roomName}</h1>
              <p className="truncate text-xs leading-tight text-muted-foreground">
                Signed in as {username}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {STATUS_LABEL[status]}
            </span>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </header>

        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 space-y-1.5 overflow-y-auto rounded-2xl border bg-card/60 p-3 sm:p-4"
        >
          {loadingHistory && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Loading conversation…</span>
            </div>
          ) : historyError && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <p className="text-sm text-destructive">{historyError}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
            </div>
          ) : (
            rows.map((row) => {
              if (row.type === "separator") {
                return (
                  <div key={row.key} className="my-3 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      {row.label}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                );
              }

              const { message, first, last } = row;
              const isOwn = message.user_id === userId;

              return (
                <div
                  key={row.key}
                  className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {first ? (
                    <Avatar name={message.username} self={isOwn} className={last ? "" : "mb-0.5"} />
                  ) : (
                    <span className="w-8 shrink-0" aria-hidden="true" />
                  )}

                  <div className={`flex max-w-[80%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
                    {!isOwn && first && (
                      <span
                        className="mb-1 px-1 text-xs font-semibold"
                        style={{ color: avatarColors(message.username)[1] }}
                      >
                        {message.username}
                      </span>
                    )}
                    <div
                      className={`animate-in fade-in-0 zoom-in-95 px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isOwn
                          ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground shadow-sm"
                          : "rounded-2xl rounded-bl-md border bg-background"
                      }`}
                    >
                      {message.content}
                    </div>
                    {last && (
                      <time
                        className={`mt-1 px-1 text-[11px] text-muted-foreground ${isOwn ? "mr-1 text-right" : "ml-1 text-left"}`}
                      >
                        {formatTime(message.timestamp)}
                      </time>
                    )}
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
            placeholder={isConnected ? "Type a message…" : "Reconnecting…"}
            maxLength={LIMITS.message.max}
            autoComplete="off"
            aria-label="Message"
          />
          <Button
            type="submit"
            size="icon-lg"
            className="shrink-0 rounded-xl"
            disabled={!canSend}
            aria-label="Send message"
            title="Send message"
          >
            <SendHorizontal className="size-5" />
          </Button>
        </form>

        <div className="min-h-4 px-1 text-xs text-muted-foreground" aria-live="polite">
          {!isConnected && status !== "disconnected" ? (
            <span className="text-amber-600 dark:text-amber-400">
              You're offline — sending will resume when the connection returns.
            </span>
          ) : status === "disconnected" ? (
            <span className="text-destructive">Connection lost. Go back to rooms to try again.</span>
          ) : (
            "\u00A0"
          )}
        </div>
      </div>
    </div>
  );
}