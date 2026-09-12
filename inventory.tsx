import { createRoute } from "@tanstack/react-router";
import { Panel, StockBar, StatusPill } from "@/components/ui-parts";
import { statusOf, hoursUntil } from "@/lib/inventory-data";
import { useMemo, useState } from "react";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts, type InventoryFilters as InventoryFilterState } from "@/hooks/use-products";
import { AgentAssistant } from "@/components/agent-assistant";
import { authenticatedRoute } from "@/routes/_authenticated";
import { InventoryFilters } from "@/components/inventory-filters";
import { ProductCreateForm } from "@/components/product-create-form";
import { PaginationControls } from "@/components/pagination-controls";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { Link } from "@tanstack/react-router";

export const inventoryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/inventory",
  component: InventoryPage,
});

function InventoryPage() {
  const { organizationId, isAuthenticated, organizations } = useCurrentOrg();
  const currentRole = organizations.find((org) => org.id === organizationId)?.role;
  const canManageInventory = currentRole === "owner" || currentRole === "manager";
  const [filters, setFilters] = useState<InventoryFilterState>({ limit: 25, offset: 0 });
  const productsQuery = useProducts(organizationId, filters);
  const products = useMemo(() => productsQuery.data?.data ?? [], [productsQuery.data]);
  const categories = [...new Set(products.map((product) => product.department).filter((value): value is string => Boolean(value)))];

  return (
    <>
      <Panel>
        <AgentAssistant
          organizationId={organizationId}
          isAuthenticated={isAuthenticated}
        />
      </Panel>
      {organizationId && canManageInventory && (
        <Panel>
          <ProductCreateForm organizationId={organizationId} />
        </Panel>
      )}
      <Panel>
        <h2>Inventory</h2>
        <InventoryFilters filters={filters} categories={categories} onChange={setFilters} />
        {productsQuery.isLoading && <LoadingState label="Loading inventory..." />}
        {productsQuery.error && <ErrorState message="Inventory could not be loaded. Sign in again if your session expired." />}
        {!productsQuery.isLoading && !productsQuery.error && products.length === 0 && (
          <EmptyState
            title={filters.search || filters.status || filters.category || filters.lowStock || filters.expiring ? "No matching inventory" : "No inventory"}
            message="Try changing the filters or select another authorized organization."
          />
        )}
        {products.map((product) => (
          <article key={product.id}>
            <h3><Link to="/inventory/$productId" params={{ productId: product.id }}>{product.name}</Link></h3>
            <StatusPill status={product.status ?? statusOf(product)} />
            <StockBar stock={product.stock} capacity={product.capacity} />
            <span>{hoursUntil(product.expires_at) ?? "—"} hours to expiry</span>
          </article>
        ))}
        {productsQuery.data && (
          <PaginationControls
            offset={filters.offset ?? 0}
            limit={productsQuery.data.meta.limit}
            total={productsQuery.data.meta.total}
            onChange={(offset) => setFilters((current) => ({ ...current, offset }))}
          />
        )}
      </Panel>
    </>
  );
}
