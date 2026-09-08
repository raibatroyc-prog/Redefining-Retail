import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { inventoryRoute } from "./routes/_authenticated/inventory";
import { indexRoute } from "./routes";

// Route files in src/routes are the source of truth for app structure.
// This checked-in tree is intentionally kept in sync with the route definitions
// so the router cannot silently drift from the actual route files.

export interface RouterContext {
  queryClient: QueryClient;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()();

export const routeTree = rootRoute.addChildren([indexRoute, inventoryRoute]);
