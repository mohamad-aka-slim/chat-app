import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";

export function LoginScreen({ onLogin }: { onLogin: (user: { id: number; username: string }) => void }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      const user = await api.createUser(username.trim())
      onLogin(user);
    } catch (error: any) {
      console.log(error);

      setError('Failed to create user. Try a different username.');
    } finally {
      setLoading(false);

    }

  };

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className=" w-sm ">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" disabled={loading || !username.trim()}>
              {loading ? 'Joining...' : 'Join'}
            </Button>
          </form>
        </CardContent>
      </Card>
      {error && <p className="error">{error}</p>}

    </div>
  );
}
