import { createRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authenticatedRoute } from "@/routes/_authenticated";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { PurchaseOrderFilters } from "@/lib/purchase-order-data";
import { PurchaseOrderList } from "@/components/purchase-order-list";
import { PurchaseOrderCreateForm } from "@/components/purchase-order-create-form";
import { PaginationControls } from "@/components/pagination-controls";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Panel } from "@/components/ui-parts";

export const purchaseOrdersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/purchase-orders",
  component: PurchaseOrdersPage,
});

function PurchaseOrdersPage() {
  const { organizationId, organizations } = useCurrentOrg();
  const currentRole = organizations.find((org) => org.id === organizationId)?.role;
  const canManagePurchaseOrders = currentRole === "owner" || currentRole === "manager";
  const [filters, setFilters] = useState<PurchaseOrderFilters>({ limit: 25, offset: 0 });
  const purchaseOrdersQuery = usePurchaseOrders(organizationId, filters);
  const suppliersQuery = useSuppliers(organizationId, { limit: 200, offset: 0 });

  return (
    <main>
      <h1>Purchase orders</h1>
      <p>
        <Link to="/dashboard">Dashboard</Link>{" · "}
        <Link to="/inventory">Inventory</Link>{" · "}
        <Link to="/suppliers">Suppliers</Link>
      </p>
      {!organizationId && (
        <EmptyState title="No organization selected" message="Select an authorized organization to view purchase orders." />
      )}
      {organizationId && canManagePurchaseOrders && (
        <Panel>
          <PurchaseOrderCreateForm organizationId={organizationId} suppliers={suppliersQuery.data?.data ?? []} />
        </Panel>
      )}
      {organizationId && (
        <Panel>
          {purchaseOrdersQuery.isLoading && <LoadingState label="Loading purchase orders..." />}
          {purchaseOrdersQuery.error && (
            <ErrorState message="Purchase orders could not be loaded. Sign in again if your session expired." />
          )}
          {!purchaseOrdersQuery.isLoading && !purchaseOrdersQuery.error && purchaseOrdersQuery.data?.data.length === 0 && (
            <EmptyState title="No purchase orders found" message="This organization has no purchase orders." />
          )}
          {purchaseOrdersQuery.data && <PurchaseOrderList purchaseOrders={purchaseOrdersQuery.data.data} />}
          {purchaseOrdersQuery.data && (
            <PaginationControls
              offset={filters.offset ?? 0}
              limit={purchaseOrdersQuery.data.meta.limit}
              total={purchaseOrdersQuery.data.meta.total}
              onChange={(offset) => setFilters((current) => ({ ...current, offset }))}
            />
          )}
        </Panel>
      )}
    </main>
  );
}
