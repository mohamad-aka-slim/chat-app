import type { ReactNode } from "react";

export function MainLayout({ children }: { children: ReactNode }) {
  return <main className="flex h-dvh">{children}</main>;
}