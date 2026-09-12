import { createRoute, Link, useParams } from "@tanstack/react-router";
import { authenticatedRoute } from "@/routes/_authenticated";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { usePurchaseOrderDetail } from "@/hooks/use-purchase-order-detail";
import { useProducts } from "@/hooks/use-products";
import { PurchaseOrderDetailView } from "@/components/purchase-order-detail-view";
import { PurchaseOrderItemForm } from "@/components/purchase-order-item-form";
import { PurchaseOrderStatusActions } from "@/components/purchase-order-status-actions";
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
  const { organizationId, organizations } = useCurrentOrg();
  const currentRole = organizations.find((org) => org.id === organizationId)?.role;
  const canManagePurchaseOrders = currentRole === "owner" || currentRole === "manager";
  const purchaseOrderQuery = usePurchaseOrderDetail(organizationId, purchaseOrderId);
  const productsQuery = useProducts(organizationId, { limit: 200, offset: 0 });

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
      {purchaseOrderQuery.data && canManagePurchaseOrders && (
        <>
          <Panel>
            <PurchaseOrderStatusActions
              organizationId={organizationId}
              purchaseOrderId={purchaseOrderId}
              status={purchaseOrderQuery.data.status}
            />
          </Panel>
          {purchaseOrderQuery.data.status === "draft" && (
            <Panel>
              <PurchaseOrderItemForm
                organizationId={organizationId}
                purchaseOrderId={purchaseOrderId}
                products={productsQuery.data?.data ?? []}
              />
            </Panel>
          )}
        </>
      )}
    </main>
  );
}
