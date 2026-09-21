import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredTheme } from "@/lib/session";

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: StoredTheme;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}