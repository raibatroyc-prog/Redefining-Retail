import { DEFAULT_FORECAST_HORIZON_DAYS, MAX_CONFIDENCE, MIN_CONFIDENCE, toFiniteNumber, toSafeNonNegative, VELOCITY_FACTOR } from "./policy";
import type { DemandForecast, IntelligenceProductLike } from "./types";

function safeVelocity(value: unknown): keyof typeof VELOCITY_FACTOR | null {
  if (value === "High" || value === "Medium" || value === "Low") {
    return value;
  }
  return null;
}

export function dailyDemand(product: IntelligenceProductLike, demandMultiplier = 1): number {
  if (!product || !product.id) {
    return 0;
  }

  const capacity = toSafeNonNegative(product?.capacity, 0);
  const velocity = safeVelocity(product?.velocity ?? null);
  const trend = toFiniteNumber(product?.demand_trend, 0);

  if (capacity <= 0 || !velocity) {
    return 0;
  }

  const base = Math.max(1, capacity * VELOCITY_FACTOR[velocity]);
  const trendFactor = 1 + Math.max(-1, Math.min(1, trend / 100));
  const demand = base * trendFactor * toFiniteNumber(demandMultiplier, 1);
  return Number.isFinite(demand) ? Number(demand.toFixed(2)) : 0;
}

export function forecastDemand(
  product: IntelligenceProductLike,
  horizonDays = DEFAULT_FORECAST_HORIZON_DAYS,
): DemandForecast {
  const productId = product?.id ?? "unknown";
  const capacity = toSafeNonNegative(product?.capacity, 0);
  const trend = toFiniteNumber(product?.demand_trend, 0);
  const velocity = safeVelocity(product?.velocity ?? null);

  if (!product || !product.id || !Number.isFinite(capacity) || capacity <= 0 || !velocity) {
    return {
      productId,
      horizonDays: Number.isFinite(horizonDays) && horizonDays > 0 ? Math.round(horizonDays) : DEFAULT_FORECAST_HORIZON_DAYS,
      averageDailyDemand: 0,
      forecastedDemand: 0,
      trendDirection: "steady",
      confidence: 0,
      dataQuality: "insufficient",
    };
  }

  const averageDailyDemand = dailyDemand(product, 1);
  const forecastedDemand = Number((averageDailyDemand * Math.max(1, Math.round(horizonDays))).toFixed(2));
  const trendDirection = trend > 5 ? "up" : trend < -5 ? "down" : "steady";

  const confidenceBase =
    70 +
    (velocity === "High" ? 10 : velocity === "Medium" ? 5 : 0) +
    (trend !== 0 ? 8 : 0);

  const confidence = Math.round(
    Math.min(MAX_CONFIDENCE, Math.max(MIN_CONFIDENCE, confidenceBase)),
  );

  return {
    productId,
    horizonDays: Number.isFinite(horizonDays) && horizonDays > 0 ? Math.round(horizonDays) : DEFAULT_FORECAST_HORIZON_DAYS,
    averageDailyDemand,
    forecastedDemand,
    trendDirection,
    confidence,
    dataQuality:
      product.demand_trend == null || product.capacity == null
        ? "partial"
        : "complete",
  };
}
