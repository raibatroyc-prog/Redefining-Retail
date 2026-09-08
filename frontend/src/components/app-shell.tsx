
import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main>
      <header>
        <h1>Smart Stock Savvy</h1>
      </header>
      {children}
    </main>
  );
}
