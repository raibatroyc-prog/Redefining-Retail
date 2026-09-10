import { forecastDemand } from "./forecasting";
import { analyzeInventoryRisk } from "./inventory-risk";
import { calculateReorderDecision } from "./reorder";
import { evaluateSupplier } from "./supplier-evaluation";
import type { IntelligenceProductLike, IntelligenceSupplierLike, InventoryRecommendation } from "./types";

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function buildRecommendation(
  product: IntelligenceProductLike,
  suppliers: IntelligenceSupplierLike[] = [],
): InventoryRecommendation {
  const forecast = forecastDemand(product, 7);
  const risk = analyzeInventoryRisk(product);
  const matchedSupplier = suppliers.find((supplier) => supplier.id && supplier.id === product.supplier_id) ?? suppliers[0] ?? null;
  const supplierEvaluation = evaluateSupplier(product, matchedSupplier);
  const reorderDecision = calculateReorderDecision(product, supplierEvaluation);

  const reasons = dedupe([
    ...risk.reasons,
    reorderDecision.reason,
    ...supplierEvaluation.reasons,
  ]);

  const dataQualityLimitations = dedupe([
    "Forecast confidence and stockout indicators are heuristic, not empirically validated statistical probabilities.",
    forecast.dataQuality === "insufficient" ? "Forecast inputs are insufficient; demand estimate is conservative." : "",
    risk.dataQuality === "partial" ? "Inventory risk data is partly incomplete." : "",
    supplierEvaluation.dataQuality !== "complete" ? "Supplier reliability data is limited or missing." : "",
  ]);

  return {
    productId: product.id,
    action: reorderDecision.action,
    priority: reorderDecision.priority,
    recommendedQuantity: reorderDecision.recommendedQuantity,
    riskLevel: risk.riskLevel,
    reasons,
    forecast,
    supplier: supplierEvaluation,
    dataQualityLimitations,
    timestamp: new Date().toISOString(),
  };
}

export function buildInventoryRecommendations(
  products: IntelligenceProductLike[],
  suppliers: IntelligenceSupplierLike[] = [],
): InventoryRecommendation[] {
  return products
    .map((product) => buildRecommendation(product, suppliers))
    .sort((a, b) => {
      const rank = { critical: 0, high: 1, medium: 2, low: 3 };
      return rank[a.priority] - rank[b.priority];
    });
}
