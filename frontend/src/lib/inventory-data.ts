// Shared types + helpers. Real data lives in Supabase; this file
// keeps the shared TS types and a couple of static demo constants
// (demand forecast chart is illustrative).

export type StockStatus = "optimal" | "low" | "critical" | "overstock";

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  department: string | null;
  aisle: string | null;
  stock: number;
  capacity: number;
  velocity: "High" | "Medium" | "Low";
  demand_trend: number;
  expires_at: string | null;
  last_received: string | null;
  unit_cost: number;
  supplier_id: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  category: string | null;
  status: string;
  next_delivery: string | null;
  on_time_rate: number;
}

export function statusOf(p: Product): StockStatus {
  if (p.capacity <= 0) return "optimal";
  const pct = p.stock / p.capacity;
  if (pct < 0.1) return "critical";
  if (pct < 0.3) return "low";
  if (pct > 0.95 && p.demand_trend < 0) return "overstock";
  return "optimal";
}

export function hoursUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 3_600_000));
}

export const demandForecast = [
  { day: "Mon", actual: 420, predicted: 410 },
  { day: "Tue", actual: 385, predicted: 400 },
  { day: "Wed", actual: 445, predicted: 430 },
  { day: "Thu", actual: 510, predicted: 495 },
  { day: "Fri", actual: 620, predicted: 600 },
  { day: "Sat", actual: 780, predicted: 750 },
  { day: "Sun", actual: 690, predicted: 680 },
  { day: "Mon", actual: null, predicted: 460 },
  { day: "Tue", actual: null, predicted: 440 },
  { day: "Wed", actual: null, predicted: 520 },
  { day: "Thu", actual: null, predicted: 610 },
  { day: "Fri", actual: null, predicted: 820 },
  { day: "Sat", actual: null, predicted: 940 },
  { day: "Sun", actual: null, predicted: 870 },
];

export interface Recommendation {
  id: string;
  product: Product;
  quantity: number;
  estCost: number;
  reason: string;
  confidence: number;
  urgency: "high" | "medium" | "low";
}

// Derive AI-style recommendations from live products.
export function buildRecommendations(products: Product[]): Recommendation[] {
  return products
    .map((p) => {
      const pct = p.capacity > 0 ? p.stock / p.capacity : 1;
      const hrs = hoursUntil(p.expires_at);
      let urgency: Recommendation["urgency"] | null = null;
      let reason = "";
      let confidence = 80;
      let quantity = 0;

      if (pct < 0.1) {
        urgency = "high";
        reason = "Stockout risk within 24-48h at current velocity.";
        confidence = 92;
        quantity = Math.max(20, Math.round(p.capacity * 0.6));
      } else if (pct < 0.3 && p.demand_trend > 0) {
        urgency = "medium";
        reason = `Demand trending +${p.demand_trend}% — pre-position stock.`;
        confidence = 87;
        quantity = Math.round(p.capacity * 0.5);
      } else if (p.demand_trend > 15) {
        urgency = "medium";
        reason = `Surge detected (+${p.demand_trend}%). Meet 7-day demand.`;
        confidence = 89;
        quantity = Math.round(p.capacity * 0.4);
      } else if (pct > 0.95 && p.demand_trend < -5) {
        urgency = "low";
        reason = `Reduce next order — trailing demand ${p.demand_trend}%.`;
        confidence = 82;
        quantity = 0;
      }

      if (!urgency) return null;

      return {
        id: `rec-${p.id}`,
        product: p,
        quantity,
        estCost: +(quantity * Number(p.unit_cost)).toFixed(2),
        reason,
        confidence,
        urgency,
      } satisfies Recommendation;
    })
    .filter((r): r is Recommendation => r !== null)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.urgency] - order[b.urgency];
    });
}
