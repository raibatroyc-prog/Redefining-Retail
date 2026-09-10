import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { inventoryRoute } from "./routes/_authenticated/inventory";
import { productDetailRoute } from "./routes/_authenticated/inventory.$productId";
import { indexRoute } from "./routes";
import { authenticatedRoute } from "./routes/_authenticated";
import { dashboardRoute } from "./routes/_authenticated/dashboard";
import { loginRoute } from "./routes/login";
import { suppliersRoute } from "./routes/_authenticated/suppliers";
import { supplierDetailRoute } from "./routes/_authenticated/suppliers.$supplierId";
import { purchaseOrdersRoute } from "./routes/_authenticated/purchase-orders";
import { purchaseOrderDetailRoute } from "./routes/_authenticated/purchase-orders.$purchaseOrderId";

// Route files in src/routes are the source of truth for app structure.
// This checked-in tree is intentionally kept in sync with the route definitions
// so the router cannot silently drift from the actual route files.

export interface RouterContext {
  queryClient: QueryClient;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()();

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    inventoryRoute,
    productDetailRoute,
    suppliersRoute,
    supplierDetailRoute,
    purchaseOrdersRoute,
    purchaseOrderDetailRoute,
  ]),
]);
