import type { User } from "@/types/User";

const USER_KEY = "chatterbox:user";
const THEME_KEY = "chatterbox:theme";

export type StoredTheme = "light" | "dark";

export function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null): void {
  if (user === null) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function loadTheme(): StoredTheme | null {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme: StoredTheme): void {
  localStorage.setItem(THEME_KEY, theme);
}