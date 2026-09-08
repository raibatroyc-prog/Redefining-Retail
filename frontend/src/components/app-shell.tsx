
import type { PropsWithChildren } from "react";
import { AppNavigation } from "@/components/app-navigation";
import { OrganizationSelector } from "@/components/organization-selector";
import { SessionStatus } from "@/components/session-status";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main>
      <header>
        <h1>Smart Stock Savvy</h1>
        <AppNavigation />
        <OrganizationSelector />
        <SessionStatus />
      </header>
      {children}
    </main>
  );
}
