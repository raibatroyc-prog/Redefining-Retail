import { dailyDemand } from "./forecasting";
import { EXPIRY_RISK_BUCKETS, RISK_THRESHOLDS, toFiniteNumber, toSafeNonNegative } from "./policy";
import type { IntelligenceProductLike, InventoryRisk } from "./types";

export function analyzeInventoryRisk(product: IntelligenceProductLike): InventoryRisk {
  if (!product || !product.id) {
    return {
      productId: "unknown",
      riskLevel: "critical",
      score: 100,
      stockoutProbability: 100,
      coverageDays: null,
      expiryRisk: 0,
      reasons: ["Missing product identity prevents a valid risk assessment."],
      dataQuality: "insufficient",
    };
  }

  const productId = product.id;
  const stock = toSafeNonNegative(product?.stock, 0);
  const capacity = toSafeNonNegative(product?.capacity, 0);
  const trend = toFiniteNumber(product?.demand_trend, 0);
  const averageDailyDemand = dailyDemand(product, 1);

  const coverageDays = averageDailyDemand > 0 ? Number((stock / averageDailyDemand).toFixed(1)) : null;
  const stockRatio = capacity > 0 ? stock / capacity : 0;

  let expiryRisk = 0;
  if (product?.expires_at) {
    const expiryTime = new Date(product.expires_at).getTime();
    if (!Number.isNaN(expiryTime)) {
      const hoursRemaining = (expiryTime - Date.now()) / (60 * 60 * 1000);
      const matchedBucket = EXPIRY_RISK_BUCKETS.find(({ maxHours }) => hoursRemaining <= maxHours);
      expiryRisk = matchedBucket ? matchedBucket.risk : 0;
    }
  }

  let score = 0;
  const reasons: string[] = [];

  if (coverageDays === null) {
    reasons.push("No reliable demand signal is available for coverage analysis.");
    score += 25;
  } else if (coverageDays <= 2) {
    reasons.push("Coverage is below 2 days at current demand.");
    score += 35;
  } else if (coverageDays <= 5) {
    reasons.push("Coverage is under 5 days.");
    score += 20;
  } else if (coverageDays <= 10) {
    reasons.push("Coverage is moderate but trending toward risk.");
    score += 10;
  }

  if (capacity > 0 && stockRatio < 0.1) {
    reasons.push("Stock is below 10% of capacity.");
    score += 25;
  } else if (capacity > 0 && stockRatio < 0.3) {
    reasons.push("Stock is below 30% of capacity.");
    score += 15;
  } else if (capacity <= 0) {
    reasons.push("Capacity is missing or invalid, so stock ratio cannot be evaluated safely.");
    score += 15;
  }

  if (trend > 10) {
    reasons.push("Demand trend is positive and accelerating.");
    score += 15;
  } else if (trend < -10) {
    reasons.push("Demand trend is falling, which can hide overstock risk.");
    score += 10;
  }

  if (expiryRisk > 0) {
    reasons.push("Expiry risk is elevated for the current inventory window.");
    score += expiryRisk > 60 ? 20 : 10;
  }

  if (product?.velocity == null || product?.demand_trend == null || product?.capacity == null) {
    reasons.push("Some demand inputs are unavailable, reducing forecast confidence.");
    score += 10;
  }

  const normalizedScore = Math.min(100, Math.max(0, score));
  const riskLevel: InventoryRisk["riskLevel"] =
    normalizedScore >= RISK_THRESHOLDS.critical
      ? "critical"
      : normalizedScore >= RISK_THRESHOLDS.high
        ? "high"
        : normalizedScore >= RISK_THRESHOLDS.medium
          ? "medium"
          : "low";

  const stockoutProbability = Math.min(100, Math.max(0, Math.round(normalizedScore * 0.9)));

  return {
    productId,
    riskLevel,
    score: normalizedScore,
    stockoutProbability,
    coverageDays,
    expiryRisk,
    reasons: reasons.length > 0 ? reasons : ["No immediate risk indicators detected."],
    dataQuality:
      product.capacity == null || product.demand_trend == null || product.velocity == null
        ? "partial"
        : "complete",
  };
}
