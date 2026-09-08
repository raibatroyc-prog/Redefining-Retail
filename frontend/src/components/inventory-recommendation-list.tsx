import type { InventoryRecommendationData } from "@/lib/intelligence-data";

interface InventoryRecommendationListProps {
  recommendations: InventoryRecommendationData[];
  productNames: Map<string, string>;
}

export function InventoryRecommendationList({
  recommendations,
  productNames,
}: InventoryRecommendationListProps) {
  return (
    <section aria-labelledby="recommendations-heading">
      <h2 id="recommendations-heading">Inventory recommendations</h2>
      {recommendations.length === 0 ? (
        <p>No recommendations are currently available for this organization.</p>
      ) : (
        <div>
          {recommendations.map((recommendation) => (
            <article key={`${recommendation.productId}-${recommendation.timestamp}`}>
              <h3>{productNames.get(recommendation.productId) ?? recommendation.productId}</h3>
              <p>Product ID: {recommendation.productId}</p>
              <dl>
                <div><dt>Action</dt><dd>{recommendation.action}</dd></div>
                <div><dt>Priority</dt><dd>{recommendation.priority}</dd></div>
                <div><dt>Risk level</dt><dd>{recommendation.riskLevel}</dd></div>
                <div><dt>Recommended quantity</dt><dd>{recommendation.recommendedQuantity}</dd></div>
              </dl>
              <h4>Reasons</h4>
              <ul>{recommendation.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              <p>
                Forecast: {recommendation.forecast.trendDirection} trend,{" "}
                {recommendation.forecast.forecastedDemand} units over {recommendation.forecast.horizonDays} days.
              </p>
              {recommendation.supplier && (
                <p>
                  Supplier: {recommendation.supplier.supplierName ?? recommendation.supplier.supplierId ?? "Unknown"}
                  {"; "}evaluation {recommendation.supplier.evaluation}
                </p>
              )}
              {recommendation.dataQualityLimitations.length > 0 && (
                <>
                  <h4>Data-quality limitations</h4>
                  <ul>
                    {recommendation.dataQualityLimitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                  </ul>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
