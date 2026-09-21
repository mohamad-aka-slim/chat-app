import { cn } from "@/lib/utils";

const AVATAR_COLORS: ReadonlyArray<[string, string]> = [
  ["#fbbf24", "#451a03"],
  ["#34d399", "#064e3b"],
  ["#818cf8", "#1e1b4b"],
  ["#f472b6", "#831843"],
  ["#22d3ee", "#164e63"],
  ["#a78bfa", "#3b0764"],
  ["#f87171", "#7f1d1d"],
  ["#2dd4bf", "#134e4a"],
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic [background, foreground] pair for a name, shared by avatars and name labels. */
export function avatarColors(name: string): [string, string] {
  return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length]!;
}

export function Avatar({
  name,
  self = false,
  className,
}: {
  name: string;
  self?: boolean;
  className?: string;
}) {
  const [background, foreground] = avatarColors(name);
  return (
    <span
      data-slot="avatar"
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold select-none",
        self && "bg-primary text-primary-foreground",
        className,
      )}
      style={self ? undefined : { backgroundColor: background, color: foreground }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}