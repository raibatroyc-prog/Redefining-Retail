import { createRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel, StockBar, StatusPill } from "@/components/ui-parts";
import { statusOf, hoursUntil } from "@/lib/inventory-data";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";
import { rootRoute } from "@/routeTree.gen";

export const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/_authenticated/inventory",
  component: InventoryPage,
});

function InventoryPage() {
  const { organizationId } = useCurrentOrg();
  const productsQuery = useProducts(organizationId);
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  return (
    <AppShell>
      <Panel>
        <h2>Inventory</h2>
        {productsQuery.isLoading && <Loader2 aria-label="Loading inventory" />}
        {!productsQuery.isLoading && products.length === 0 && <p>No inventory loaded.</p>}
        {products.map((product) => (
          <article key={product.id}>
            <strong>{product.name}</strong>
            <StatusPill status={statusOf(product)} />
            <StockBar stock={product.stock} capacity={product.capacity} />
            <span>{hoursUntil(product.expires_at) ?? "—"} hours to expiry</span>
          </article>
        ))}
      </Panel>
    </AppShell>
  );
}
