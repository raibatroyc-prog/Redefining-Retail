import { DEFAULT_SUPPLIER_LEAD_TIME_DAYS, toFiniteNumber, toSafeNonNegative } from "./policy";
import type { IntelligenceProductLike, IntelligenceSupplierLike, SupplierEvaluation } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

function parseLeadTimeDays(supplier: IntelligenceSupplierLike | null | undefined): number | null {
  const explicitLeadTime = supplier?.lead_time_days;
  if (explicitLeadTime != null) {
    const leadTime = toFiniteNumber(explicitLeadTime, Number.NaN);
    if (Number.isFinite(leadTime) && leadTime >= 0) {
      return Math.max(0, Math.round(leadTime));
    }
    return null;
  }

  const nextDelivery = supplier?.next_delivery;
  if (!nextDelivery) {
    return null;
  }

  const nextDeliveryDate = new Date(nextDelivery);
  if (Number.isNaN(nextDeliveryDate.getTime())) {
    return null;
  }

  const diffDays = Math.round((nextDeliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (!Number.isFinite(diffDays) || diffDays < 0) {
    return null;
  }

  return Math.max(0, diffDays);
}

/**
 * Supplier evaluation represents supplier risk exposure for the inventory
 * recommendation engine. It is not a measure of supplier reliability.
 */
export function evaluateSupplier(
  product: IntelligenceProductLike,
  supplier?: IntelligenceSupplierLike | null,
): SupplierEvaluation {
  const supplierId = supplier?.id ?? product?.supplier_id ?? null;
  const supplierName = supplier?.name ?? null;

  if (!supplier || !supplier.id) {
    return {
      supplierId,
      supplierName,
      evaluation: "high",
      score: 100,
      leadTimeDays: null,
      onTimeRate: null,
      fillRate: null,
      reasons: ["No supplier record is available, so supplier risk cannot be evaluated."],
      dataQuality: "insufficient",
    };
  }

  const onTimeRateRaw = supplier.on_time_rate ?? supplier.onTimeRate ?? null;
  const onTimeRate = onTimeRateRaw == null ? null : clamp(toSafeNonNegative(onTimeRateRaw, 0), 0, 100);
  const leadTimeDays = parseLeadTimeDays(supplier) ?? null;
  const reasons: string[] = [];

  let score = 50;

  if (onTimeRate == null) {
    reasons.push("Supplier on-time performance is unavailable.");
  } else {
    score += (onTimeRate - 50) * 0.8;
  }

  if (leadTimeDays == null) {
    reasons.push("Supplier lead time is unavailable; the risk estimate is conservative.");
    score += 10;
  } else {
    if (leadTimeDays > 10) {
      score += 20;
      reasons.push("Proxy lead time exceeds 10 days, which increases supply risk.");
    } else if (leadTimeDays <= 5) {
      score -= 10;
      reasons.push("Proxy lead time is within the preferred range.");
    }
  }

  if (supplier.status && supplier.status.toLowerCase() === "inactive") {
    score += 25;
    reasons.push("Supplier is inactive or not currently approved.");
  }

  const normalizedScore = clamp(Math.round(score), 0, 100);
  const evaluation: SupplierEvaluation["evaluation"] =
    normalizedScore >= 80 ? "high" : normalizedScore >= 50 ? "medium" : "low";

  return {
    supplierId,
    supplierName,
    evaluation,
    score: normalizedScore,
    leadTimeDays,
    onTimeRate: onTimeRate == null ? null : Number(onTimeRate.toFixed(2)),
    fillRate: null,
    reasons:
      reasons.length > 0
        ? reasons
        : ["Supplier data is complete and within the expected risk range."],
    dataQuality:
      onTimeRate == null && leadTimeDays == null && !supplier.status
        ? "insufficient"
        : onTimeRate == null || leadTimeDays == null
          ? "partial"
          : "complete",
  };
}
