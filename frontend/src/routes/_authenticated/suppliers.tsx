import { createRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authenticatedRoute } from "@/routes/_authenticated";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { SupplierFilters } from "@/lib/supplier-data";
import { SupplierList } from "@/components/supplier-list";
import { PaginationControls } from "@/components/pagination-controls";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Panel } from "@/components/ui-parts";

export const suppliersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/suppliers",
  component: SuppliersPage,
});

function SuppliersPage() {
  const { organizationId } = useCurrentOrg();
  const [filters, setFilters] = useState<SupplierFilters>({ limit: 25, offset: 0 });
  const suppliersQuery = useSuppliers(organizationId, filters);

  return (
    <main>
      <h1>Suppliers</h1>
      <p><Link to="/dashboard">Dashboard</Link>{" · "}<Link to="/inventory">Inventory</Link></p>
      {!organizationId && (
        <EmptyState title="No organization selected" message="Select an authorized organization to view suppliers." />
      )}
      {organizationId && (
        <Panel>
          <label>
            Search suppliers
            <input
              value={filters.search ?? ""}
              onChange={(event) => setFilters({
                ...filters,
                search: event.target.value || undefined,
                offset: 0,
              })}
            />
          </label>
          {suppliersQuery.isLoading && <LoadingState label="Loading suppliers..." />}
          {suppliersQuery.error && (
            <ErrorState message="Suppliers could not be loaded. Sign in again if your session expired." />
          )}
          {!suppliersQuery.isLoading && !suppliersQuery.error && suppliersQuery.data?.data.length === 0 && (
            <EmptyState title="No suppliers found" message="This organization has no suppliers matching the current search." />
          )}
          {suppliersQuery.data && <SupplierList suppliers={suppliersQuery.data.data} />}
          {suppliersQuery.data && (
            <PaginationControls
              offset={filters.offset ?? 0}
              limit={suppliersQuery.data.meta.limit}
              total={suppliersQuery.data.meta.total}
              onChange={(offset) => setFilters((current) => ({ ...current, offset }))}
            />
          )}
        </Panel>
      )}
    </main>
  );
}
