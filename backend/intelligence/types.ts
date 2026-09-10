export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ActionType = "no_action" | "monitor" | "reorder" | "urgent_reorder";
export type PriorityLevel = "low" | "medium" | "high" | "critical";
export type DataQualityLevel = "complete" | "partial" | "insufficient";

/**
 * Demand forecast confidence is a deterministic heuristic score derived from
 * available inventory metadata. It is not a statistically calibrated probability.
 */

export interface IntelligenceProductLike {
  id: string;
  sku?: string | null;
  name?: string | null;
  stock?: number | null;
  capacity?: number | null;
  velocity?: "High" | "Medium" | "Low" | null;
  demand_trend?: number | null;
  expires_at?: string | null;
  unit_cost?: number | null;
  supplier_id?: string | null;
  department?: string | null;
}

export interface IntelligenceSupplierLike {
  id?: string | null;
  name?: string | null;
  category?: string | null;
  status?: string | null;
  next_delivery?: string | null;
  on_time_rate?: number | null;
  onTimeRate?: number | null;
  lead_time_days?: number | null;
}

export interface DemandForecast {
  productId: string;
  horizonDays: number;
  averageDailyDemand: number;
  forecastedDemand: number;
  trendDirection: "up" | "steady" | "down";
  /**
   * Heuristic confidence score only; not a calibrated forecast probability.
   */
  confidence: number;
  dataQuality: DataQualityLevel;
}

export interface InventoryRisk {
  productId: string;
  riskLevel: RiskLevel;
  score: number;
  /**
   * Heuristic risk indicator only; not a calibrated stockout probability.
   */
  stockoutProbability: number;
  coverageDays: number | null;
  expiryRisk: number;
  reasons: string[];
  dataQuality: DataQualityLevel;
}

export interface ReorderDecision {
  productId: string;
  action: ActionType;
  priority: PriorityLevel;
  recommendedQuantity: number;
  coverageDays: number | null;
  reason: string;
  dataQuality: DataQualityLevel;
}

export interface SupplierEvaluation {
  supplierId: string | null;
  supplierName: string | null;
  /**
   * Supplier risk band, not a reliability score. Lower values are not "better";
   * this field indicates risk exposure for a downstream recommendation.
   */
  evaluation: RiskLevel;
  score: number;
  leadTimeDays: number | null;
  onTimeRate: number | null;
  fillRate: number | null;
  reasons: string[];
  dataQuality: DataQualityLevel;
}

export interface InventoryRecommendation {
  productId: string;
  action: ActionType;
  priority: PriorityLevel;
  recommendedQuantity: number;
  riskLevel: RiskLevel;
  reasons: string[];
  forecast: DemandForecast;
  supplier: SupplierEvaluation | null;
  dataQualityLimitations: string[];
  timestamp: string;
}
