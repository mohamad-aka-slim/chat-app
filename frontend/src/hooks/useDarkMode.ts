import { useCallback, useEffect, useState } from "react";
import { loadTheme, saveTheme, type StoredTheme } from "@/lib/session";

function initialTheme(): StoredTheme {
  const stored = loadTheme();
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useDarkMode() {
  const [theme, setTheme] = useState<StoredTheme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}