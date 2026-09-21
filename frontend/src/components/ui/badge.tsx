import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: "default" | "outline" | "accent" }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        variant === "default" && "bg-primary/15 text-primary",
        variant === "accent" && "bg-accent text-accent-foreground",
        variant === "outline" && "border bg-transparent text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}