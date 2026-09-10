import { createRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-parts";
import { authenticatedRoute } from "@/routes/_authenticated";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useInventorySummary } from "@/hooks/use-inventory-summary";
import { useInventoryRecommendations } from "@/hooks/use-inventory-recommendations";
import { useProducts } from "@/hooks/use-products";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { InventorySummaryCards } from "@/components/inventory-summary-cards";
import { DataFreshnessLabel } from "@/components/data-freshness-label";
import { InventoryRecommendationList } from "@/components/inventory-recommendation-list";
import { IntelligenceLimitationNotice } from "@/components/intelligence-limitation-notice";
import { resolveProductNames } from "@/lib/intelligence-data";

export const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

function DashboardPage() {
  const { organizationId } = useCurrentOrg();
  const summaryQuery = useInventorySummary(organizationId);
  const recommendationsQuery = useInventoryRecommendations(organizationId);
  const productsQuery = useProducts(organizationId);
  const productNames = resolveProductNames(productsQuery.data?.data ?? []);

  return (
    <main>
      <h1>Inventory intelligence dashboard</h1>
      {!organizationId && <EmptyState title="No organization selected" message="Select an authorized organization to view inventory intelligence." />}
      {organizationId && (
        <>
          <Panel>
            {summaryQuery.isLoading && <LoadingState label="Loading inventory summary..." />}
            {summaryQuery.error && <ErrorState message="Inventory summary could not be loaded." />}
            {summaryQuery.data && (
              <>
                <InventorySummaryCards summary={summaryQuery.data} />
                <DataFreshnessLabel generatedAt={summaryQuery.data.generatedAt} />
              </>
            )}
            {!summaryQuery.isLoading && !summaryQuery.error && summaryQuery.data?.totalProducts === 0 && (
              <EmptyState title="No inventory yet" message="This organization has no inventory products to summarize." />
            )}
          </Panel>
          <Panel>
            <IntelligenceLimitationNotice />
            {recommendationsQuery.isLoading && <LoadingState label="Loading recommendations..." />}
            {recommendationsQuery.error && <ErrorState message="Inventory recommendations could not be loaded." />}
            {recommendationsQuery.data && productsQuery.error && (
              <ErrorState message="Product names could not be resolved; product IDs remain available." />
            )}
            {recommendationsQuery.data && !productsQuery.isLoading && (
              <InventoryRecommendationList
                recommendations={recommendationsQuery.data}
                productNames={productNames}
              />
            )}
          </Panel>
        </>
      )}
    </main>
  );
}
