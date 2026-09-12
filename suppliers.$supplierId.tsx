import { createRoute, Link, useParams } from "@tanstack/react-router";
import { authenticatedRoute } from "@/routes/_authenticated";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useSupplierDetail } from "@/hooks/use-supplier-detail";
import { SupplierDetailView } from "@/components/supplier-detail-view";
import { SupplierStatusForm } from "@/components/supplier-status-form";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/ui-parts";

export const supplierDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/suppliers/$supplierId",
  component: SupplierDetailPage,
});

function SupplierDetailPage() {
  const { supplierId } = useParams({ from: supplierDetailRoute.id });
  const { organizationId, organizations } = useCurrentOrg();
  const currentRole = organizations.find((org) => org.id === organizationId)?.role;
  const canManageSuppliers = currentRole === "owner" || currentRole === "manager";
  const supplierQuery = useSupplierDetail(organizationId, supplierId);

  return (
    <main>
      <p>
        <Link to="/suppliers">Back to suppliers</Link>{" · "}
        <Link to="/dashboard">Dashboard</Link>{" · "}
        <Link to="/inventory">Inventory</Link>
      </p>
      <Panel>
        {supplierQuery.isLoading && <LoadingState label="Loading supplier..." />}
        {supplierQuery.error && (
          <ErrorState message="Supplier could not be loaded. It may not exist in this organization." />
        )}
        {supplierQuery.data && <SupplierDetailView supplier={supplierQuery.data} />}
        {!supplierQuery.isLoading && !supplierQuery.error && !supplierQuery.data && (
          <EmptyState title="Supplier unavailable" message="No supplier data was returned." />
        )}
      </Panel>
      {supplierQuery.data && canManageSuppliers && (
        <Panel>
          <SupplierStatusForm organizationId={organizationId} supplier={supplierQuery.data} />
        </Panel>
      )}
    </main>
  );
}
