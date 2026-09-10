import { createRoute, Link, useParams } from "@tanstack/react-router";
import { authenticatedRoute } from "@/routes/_authenticated";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { usePurchaseOrderDetail } from "@/hooks/use-purchase-order-detail";
import { PurchaseOrderDetailView } from "@/components/purchase-order-detail-view";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/ui-parts";

export const purchaseOrderDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/purchase-orders/$purchaseOrderId",
  component: PurchaseOrderDetailPage,
});

function PurchaseOrderDetailPage() {
  const { purchaseOrderId } = useParams({ from: purchaseOrderDetailRoute.id });
  const { organizationId } = useCurrentOrg();
  const purchaseOrderQuery = usePurchaseOrderDetail(organizationId, purchaseOrderId);

  return (
    <main>
      <p>
        <Link to="/purchase-orders">Back to purchase orders</Link>{" · "}
        <Link to="/dashboard">Dashboard</Link>{" · "}
        <Link to="/inventory">Inventory</Link>{" · "}
        <Link to="/suppliers">Suppliers</Link>
      </p>
      <Panel>
        {purchaseOrderQuery.isLoading && <LoadingState label="Loading purchase order..." />}
        {purchaseOrderQuery.error && (
          <ErrorState message="Purchase order could not be loaded. It may not exist in this organization." />
        )}
        {purchaseOrderQuery.data && <PurchaseOrderDetailView purchaseOrder={purchaseOrderQuery.data} />}
        {!purchaseOrderQuery.isLoading && !purchaseOrderQuery.error && !purchaseOrderQuery.data && (
          <EmptyState title="Purchase order unavailable" message="No purchase-order data was returned." />
        )}
      </Panel>
    </main>
  );
}
