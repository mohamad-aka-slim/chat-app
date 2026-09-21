import { type FormEvent, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoredTheme } from "@/lib/session";
import { api } from "@/services/api";
import { LIMITS } from "@/types/limits";
import type { User } from "@/types/User";

export function LoginPage({
  onLogin,
  theme,
  onToggleTheme,
}: {
  onLogin: (user: User) => void;
  theme: StoredTheme;
  onToggleTheme: () => void;
}) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = username.trim();
    if (name.length < LIMITS.username.min || loading) return;

    setLoading(true);
    setError("");
    try {
      const user = await api.createUser(name);
      onLogin(user);
    } catch {
      setError("Couldn't reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="relative w-full max-w-sm animate-in fade-in-0 zoom-in-95">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <MessageCircle className="size-7" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chatterbox</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">A friendly place to talk.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              maxLength={LIMITS.username.max}
              autoFocus
              autoCapitalize="off"
              autoComplete="username"
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="mt-5 w-full"
            size="lg"
            disabled={loading || username.trim().length < LIMITS.username.min}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Joining…
              </>
            ) : (
              "Join the chat"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          No sign-up needed — pick a name and jump in.
        </p>
      </div>
    </div>
  );
}