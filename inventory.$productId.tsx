import { createRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { authenticatedRoute } from "@/routes/_authenticated";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useStockMovements } from "@/hooks/use-stock-movements";
import { ProductDetailView } from "@/components/product-detail-view";
import { StockMovementForm } from "@/components/stock-movement-form";
import { StockMovementList } from "@/components/stock-movement-list";
import { PaginationControls } from "@/components/pagination-controls";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/ui-parts";

export const productDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/inventory/$productId",
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = useParams({ from: productDetailRoute.id });
  const { organizationId } = useCurrentOrg();
  const productQuery = useProductDetail(organizationId, productId);
  const [offset, setOffset] = useState(0);
  const movementsQuery = useStockMovements(organizationId, productId, offset);

  return (
    <main>
      <Link to="/inventory">Back to inventory</Link>
      <Panel>
        {productQuery.isLoading && <LoadingState label="Loading product..." />}
        {productQuery.error && <ErrorState message="Product could not be loaded. It may not exist in this organization." />}
        {productQuery.data && <ProductDetailView product={productQuery.data} />}
        {!productQuery.isLoading && !productQuery.error && !productQuery.data && (
          <EmptyState title="Product unavailable" message="No product data was returned." />
        )}
      </Panel>
      <Panel>
        <StockMovementForm
          organizationId={organizationId}
          productId={productId}
          currentStock={productQuery.data?.stock}
        />
      </Panel>
      <Panel>
        {movementsQuery.isLoading && <LoadingState label="Loading stock movements..." />}
        {movementsQuery.error && <ErrorState message="Stock movements could not be loaded." />}
        {movementsQuery.data && <StockMovementList movements={movementsQuery.data.data} />}
        {movementsQuery.data && (
          <PaginationControls
            offset={offset}
            limit={movementsQuery.data.meta.limit}
            total={movementsQuery.data.meta.total}
            onChange={setOffset}
          />
        )}
      </Panel>
    </main>
  );
}
