import { forecastDemand } from "./forecasting";
import { analyzeInventoryRisk } from "./inventory-risk";
import { asCapacityLimit, clamp, DEFAULT_REORDER_BUFFER_DAYS, DEFAULT_SUPPLIER_LEAD_TIME_DAYS, toFiniteNumber, toSafeNonNegative } from "./policy";
import type { IntelligenceProductLike, ReorderDecision, SupplierEvaluation } from "./types";

function safeQuantity(value: number): number {
  const safe = toFiniteNumber(value, 0);
  if (!Number.isFinite(safe)) {
    return 0;
  }
  return Math.max(0, safe);
}

export function calculateReorderDecision(
  product: IntelligenceProductLike,
  supplier?: SupplierEvaluation | null,
): ReorderDecision {
  const productId = product?.id ?? "unknown";
  const forecast = forecastDemand(product, 7);
  const risk = analyzeInventoryRisk(product);

  if (!product || !product.id) {
    return {
      productId,
      action: "no_action",
      priority: "low",
      recommendedQuantity: 0,
      coverageDays: null,
      reason: "Insufficient product data is available to calculate a reorder.",
      dataQuality: "insufficient",
    };
  }

  const currentStock = toSafeNonNegative(product.stock, 0);
  const capacity = toSafeNonNegative(product.capacity, 0);
  const capacityRemaining = asCapacityLimit(currentStock, capacity);

  if (capacity > 0 && currentStock >= capacity) {
    return {
      productId,
      action: "no_action",
      priority: "low",
      recommendedQuantity: 0,
      coverageDays: risk.coverageDays,
      reason: "Current stock is already at or above capacity; no reorder is needed.",
      dataQuality: forecast.dataQuality,
    };
  }

  const coverageDays = risk.coverageDays ?? Number.POSITIVE_INFINITY;
  const leadTimeDays = supplier?.leadTimeDays ?? DEFAULT_SUPPLIER_LEAD_TIME_DAYS;
  const targetStock = Math.max(0, forecast.averageDailyDemand * Math.max(DEFAULT_REORDER_BUFFER_DAYS, leadTimeDays));
  const projectedNeed = Math.max(0, Math.ceil(targetStock + forecast.averageDailyDemand * 2 - currentStock));

  if (forecast.dataQuality === "insufficient" || (currentStock == null && (capacity == null || capacity <= 0))) {
    return {
      productId,
      action: "no_action",
      priority: "low",
      recommendedQuantity: 0,
      coverageDays,
      reason: "Forecasting data is insufficient to support an order recommendation.",
      dataQuality: "insufficient",
    };
  }

  if (capacity <= 0 || !Number.isFinite(capacity)) {
    return {
      productId,
      action: "no_action",
      priority: "low",
      recommendedQuantity: 0,
      coverageDays,
      reason: "Capacity is missing or invalid; no unsafe reorder quantity can be inferred.",
      dataQuality: forecast.dataQuality,
    };
  }

  const capacityCappedQuantity = safeQuantity(Math.min(projectedNeed, capacityRemaining));

  if (risk.riskLevel === "critical" || coverageDays <= 2) {
    return {
      productId,
      action: "urgent_reorder",
      priority: "critical",
      recommendedQuantity: capacityCappedQuantity > 0 ? capacityCappedQuantity : 0,
      coverageDays,
      reason:
        capacityCappedQuantity < projectedNeed
          ? "Stock coverage is critically low and the recommendation is capped by available capacity."
          : "Stock coverage is critically low and the item is at high risk of stockout.",
      dataQuality: forecast.dataQuality,
    };
  }

  if (risk.riskLevel === "high" || coverageDays <= 5) {
    const quantity = clamp(capacityCappedQuantity, 0, capacityRemaining);
    return {
      productId,
      action: quantity > 0 ? "reorder" : "no_action",
      priority: quantity > 0 ? "high" : "low",
      recommendedQuantity: quantity,
      coverageDays,
      reason:
        quantity > 0
          ? "Coverage is below the preferred guardrail and replenishment is limited by remaining capacity."
          : "Remaining capacity is exhausted; no reorder is recommended.",
      dataQuality: forecast.dataQuality,
    };
  }

  if (risk.riskLevel === "medium" || coverageDays <= 10) {
    const quantity = safeQuantity(Math.min(Math.ceil(projectedNeed * 0.5), capacityRemaining));
    return {
      productId,
      action: quantity > 0 ? "monitor" : "no_action",
      priority: quantity > 0 ? "medium" : "low",
      recommendedQuantity: quantity,
      coverageDays,
      reason:
        quantity > 0
          ? "Coverage is acceptable but should be watched closely as demand changes."
          : "Capacity is already exhausted; monitoring is sufficient.",
      dataQuality: forecast.dataQuality,
    };
  }

  return {
    productId,
    action: "no_action",
    priority: "low",
    recommendedQuantity: 0,
    coverageDays,
    reason: "Current stock and demand trend do not justify an immediate reorder.",
    dataQuality: forecast.dataQuality,
  };
}
