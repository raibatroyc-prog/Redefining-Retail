export const DEFAULT_FORECAST_HORIZON_DAYS = 7;
export const DEFAULT_SUPPLIER_LEAD_TIME_DAYS = 5;
export const DEFAULT_REORDER_BUFFER_DAYS = 3;

export const VELOCITY_FACTOR: Record<"High" | "Medium" | "Low", number> = {
  High: 0.16,
  Medium: 0.09,
  Low: 0.04,
};

export const RISK_THRESHOLDS = {
  medium: 35,
  high: 65,
  critical: 85,
};

export const EXPIRY_RISK_BUCKETS = [
  { maxHours: 24, risk: 90 },
  { maxHours: 72, risk: 60 },
  { maxHours: 168, risk: 30 },
] as const;

export const MAX_CONFIDENCE = 95;
export const MIN_CONFIDENCE = 35;

export function toFiniteNumber(value: unknown, fallback = 0): number {
  const numericValue = Number(value ?? fallback);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return numericValue;
}

export function toSafeNonNegative(value: unknown, fallback = 0): number {
  const numericValue = toFiniteNumber(value, fallback);
  if (numericValue < 0) {
    return fallback;
  }
  return numericValue;
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

export function asCapacityLimit(currentStock: number, capacity: number): number {
  const safeStock = toSafeNonNegative(currentStock, 0);
  const safeCapacity = toSafeNonNegative(capacity, 0);
  if (!Number.isFinite(safeCapacity) || safeCapacity <= 0) {
    return 0;
  }
  return Math.max(0, safeCapacity - safeStock);
}
