// Deterministic, read-only projection models used by the What-If Simulator
// and the Inventory Stress Test. Nothing here writes to the database —
// every function is a pure projection over the live product rows.

import type { Product } from "./inventory-data";

export const DEFAULT_MARGIN = 0.28; // retail markup over unit cost
export const STORAGE_COST_PER_UNIT_DAY = 0.35; // currency units

const VELOCITY_FACTOR: Record<Product["velocity"], number> = {
  High: 0.16,
  Medium: 0.09,
  Low: 0.04,
};

/** Baseline units sold per day for a SKU, derived from velocity + trend. */
export function dailyDemand(p: Product, demandMultiplier = 1): number {
  const base = Math.max(1, (p.capacity || 50) * VELOCITY_FACTOR[p.velocity ?? "Medium"]);
  const trend = 1 + Number(p.demand_trend ?? 0) / 100;
  return +(base * trend * demandMultiplier).toFixed(2);
}

export function daysUntilExpiry(p: Product): number | null {
  if (!p.expires_at) return null;
  const d = (new Date(p.expires_at).getTime() - Date.now()) / 86_400_000;
  return Math.max(0, +d.toFixed(1));
}

export function daysToStockout(p: Product, demandMultiplier = 1): number {
  const d = dailyDemand(p, demandMultiplier);
  if (d <= 0) return Infinity;
  return +(p.stock / d).toFixed(1);
}

export interface SimInput {
  product: Product;
  orderQty: number;
  horizonDays: number;
  margin?: number;
  demandMultiplier?: number;
  /** Days before the incoming order actually lands on the shelf. */
  leadTimeDays?: number;
  /** 0..1 reduction of usable storage capacity. */
  capacityLoss?: number;
  /** Multiplier on spoilage speed (1 = normal cold chain). */
  spoilageMultiplier?: number;
}

export interface SimResult {
  expectedDemand: number;
  unitsSold: number;
  leftover: number;
  stockoutDays: number;
  expiredUnits: number;
  expiryRisk: number; // %
  storageUtilisation: number; // % of capacity at peak
  storageDelta: number; // percentage points vs today
  storageCost: number;
  revenue: number;
  wasteCost: number;
  profit: number;
  verdict: "under" | "balanced" | "over";
  curve: { day: number; stock: number; demand: number }[];
}

export function simulate(input: SimInput): SimResult {
  const {
    product: p,
    orderQty,
    horizonDays,
    margin = DEFAULT_MARGIN,
    demandMultiplier = 1,
    leadTimeDays = 0,
    capacityLoss = 0,
    spoilageMultiplier = 1,
  } = input;

  const perDay = dailyDemand(p, demandMultiplier);
  const unitCost = Number(p.unit_cost ?? 0) || 1;
  const price = unitCost * (1 + margin);
  const usableCapacity = Math.max(
    1,
    Math.round((p.capacity || orderQty + p.stock) * (1 - capacityLoss)),
  );
  const expiryDay = daysUntilExpiry(p);
  const effectiveExpiryDay =
    expiryDay === null ? null : expiryDay / Math.max(0.1, spoilageMultiplier);

  let stock = p.stock;
  let sold = 0;
  let stockoutDays = 0;
  let expired = 0;
  let peakStock = stock;
  let storageUnitDays = 0;
  const curve: SimResult["curve"] = [];

  for (let day = 1; day <= horizonDays; day++) {
    if (day === Math.max(1, Math.ceil(leadTimeDays) || 1) && orderQty > 0) {
      stock += orderQty;
    }

    // Expiry write-off: everything still on hand past the expiry point spoils.
    if (effectiveExpiryDay !== null && day > effectiveExpiryDay && stock > 0) {
      expired += stock;
      stock = 0;
    }

    const demandToday = perDay;
    const soldToday = Math.min(stock, demandToday);

    sold += soldToday;
    stock = +(stock - soldToday).toFixed(2);

    if (soldToday < demandToday - 0.01) stockoutDays++;

    peakStock = Math.max(peakStock, stock);
    storageUnitDays += Math.max(0, stock);

    curve.push({
      day,
      stock: Math.round(stock),
      demand: Math.round(demandToday),
    });
  }

  const expectedDemand = +(perDay * horizonDays).toFixed(0);
  const leftover = Math.round(stock);
  const revenue = +(sold * price).toFixed(0);
  const wasteCost = +(expired * unitCost).toFixed(0);
  const storageCost = +(storageUnitDays * STORAGE_COST_PER_UNIT_DAY).toFixed(0);
  const cogs = +(sold * unitCost).toFixed(0);
  const profit = +(revenue - cogs - wasteCost - storageCost).toFixed(0);

  const totalUnits = p.stock + orderQty;

  const expiryRisk =
    totalUnits > 0 ? +((expired / totalUnits) * 100).toFixed(1) : 0;

  const storageUtilisation = +((peakStock / usableCapacity) * 100).toFixed(0);

  const todayUtilisation =
    p.capacity > 0 ? (p.stock / p.capacity) * 100 : 0;

  const fillRate = expectedDemand > 0 ? sold / expectedDemand : 1;

  const verdict: SimResult["verdict"] =
    fillRate < 0.92
      ? "under"
      : leftover > expectedDemand * 0.55 || expiryRisk > 10
        ? "over"
        : "balanced";

  return {
    expectedDemand,
    unitsSold: Math.round(sold),
    leftover,
    stockoutDays,
    expiredUnits: Math.round(expired),
    expiryRisk,
    storageUtilisation,
    storageDelta: +(storageUtilisation - todayUtilisation).toFixed(0),
    storageCost,
    revenue,
    wasteCost,
    profit,
    verdict,
    curve,
  };
}

/** Suggested order quantity that roughly covers horizon demand up to capacity. */
export function suggestedQty(p: Product, horizonDays: number): number {
  const need = dailyDemand(p) * horizonDays - p.stock;
  const cap = Math.max(0, (p.capacity || 0) - p.stock);

  return Math.max(
    0,
    Math.round(Math.min(Math.max(need, 0), cap || need)),
  );
}

// ---------------------------------------------------------------- stress test

export type ScenarioId =
  | "demand_drop"
  | "demand_surge"
  | "supplier_delay"
  | "capacity_loss"
  | "cold_chain";

export interface ScenarioState {
  id: ScenarioId;
  enabled: boolean;
  severity: number; // 0..100, meaning depends on scenario
}

export const SCENARIOS: {
  id: ScenarioId;
  label: string;
  blurb: string;
  unit: string;
  defaultSeverity: number;
  mitigation: string;
}[] = [
  {
    id: "demand_drop",
    label: "Demand collapse",
    blurb: "Footfall falls — slow movers pile up and expiry losses spike.",
    unit: "% drop in demand",
    defaultSeverity: 30,
    mitigation:
      "Cut open orders, run markdowns on short-dated stock, shift to consignment where possible.",
  },
  {
    id: "demand_surge",
    label: "Demand surge",
    blurb: "Storm watch, payday or a viral item drives demand far above plan.",
    unit: "% lift in demand",
    defaultSeverity: 50,
    mitigation:
      "Pre-position fast movers, raise reorder points, secure a backup supplier for top SKUs.",
  },
  {
    id: "supplier_delay",
    label: "Supplier delay",
    blurb: "Deliveries land late — cover has to stretch across extra days.",
    unit: "days delayed",
    defaultSeverity: 3,
    mitigation:
      "Hold buffer stock on high-velocity SKUs and split volume across two suppliers.",
  },
  {
    id: "capacity_loss",
    label: "Storage capacity loss",
    blurb: "Backroom or chiller space is out of action.",
    unit: "% capacity lost",
    defaultSeverity: 20,
    mitigation:
      "Move to smaller, more frequent deliveries and de-list overstocked slow movers.",
  },
  {
    id: "cold_chain",
    label: "Cold-chain failure",
    blurb: "Refrigeration underperforms — perishables spoil faster.",
    unit: "× faster spoilage",
    defaultSeverity: 60,
    mitigation:
      "Prioritise perishables for immediate markdown and trigger maintenance escalation.",
  },
];

export interface StressFactors {
  demandMultiplier: number;
  leadTimeDays: number;
  capacityLoss: number;
  spoilageMultiplier: number;
}

export function factorsFrom(states: ScenarioState[]): StressFactors {
  const f: StressFactors = {
    demandMultiplier: 1,
    leadTimeDays: 0,
    capacityLoss: 0,
    spoilageMultiplier: 1,
  };

  for (const s of states) {
    if (!s.enabled) continue;

    if (s.id === "demand_drop") {
      f.demandMultiplier *= 1 - s.severity / 100;
    }

    if (s.id === "demand_surge") {
      f.demandMultiplier *= 1 + s.severity / 100;
    }

    if (s.id === "supplier_delay") {
      f.leadTimeDays += s.severity;
    }

    if (s.id === "capacity_loss") {
      f.capacityLoss = Math.min(
        0.9,
        f.capacityLoss + s.severity / 100,
      );
    }

    if (s.id === "cold_chain") {
      f.spoilageMultiplier *= 1 + s.severity / 100;
    }
  }

  f.demandMultiplier = Math.max(
    0.05,
    +f.demandMultiplier.toFixed(3),
  );

  return f;
}

export interface SkuImpact {
  product: Product;
  before: SimResult;
  after: SimResult;
  stockoutDays: number;
  wasteDelta: number;
  profitDelta: number;
  riskScore: number;
}

export interface StressReport {
  horizonDays: number;
  stockouts: number;
  overstocked: number;
  wasteValue: number;
  revenueAtRisk: number;
  storageOverflow: number;
  resilience: number;
  radar: { axis: string; score: number }[];
  impacts: SkuImpact[];
}

export function runStressTest(
  products: Product[],
  states: ScenarioState[],
  horizonDays = 14,
): StressReport {
  const f = factorsFrom(states);

  const impacts: SkuImpact[] = products.map((product) => {
    const qty = suggestedQty(product, horizonDays);

    const before = simulate({
      product,
      orderQty: qty,
      horizonDays,
    });

    const after = simulate({
      product,
      orderQty: qty,
      horizonDays,
      demandMultiplier: f.demandMultiplier,
      leadTimeDays: f.leadTimeDays,
      capacityLoss: f.capacityLoss,
      spoilageMultiplier: f.spoilageMultiplier,
    });

    const wasteDelta = after.wasteCost - before.wasteCost;
    const profitDelta = after.profit - before.profit;

    const riskScore =
      after.stockoutDays * 6 +
      after.expiryRisk * 1.5 +
      Math.max(0, -profitDelta) / 200;

    return {
      product,
      before,
      after,
      stockoutDays: after.stockoutDays,
      wasteDelta,
      profitDelta,
      riskScore,
    };
  });

  const stockouts = impacts.filter(
    (i) => i.after.stockoutDays > 0,
  ).length;

  const overstocked = impacts.filter(
    (i) => i.after.storageUtilisation > 95,
  ).length;

  const wasteValue = impacts.reduce(
    (s, i) => s + i.after.wasteCost,
    0,
  );

  const revenueAtRisk = impacts.reduce(
    (s, i) => s + Math.max(0, i.before.revenue - i.after.revenue),
    0,
  );

  const storageOverflow = impacts.filter(
    (i) => i.after.storageUtilisation > 100,
  ).length;

  const n = Math.max(1, impacts.length);

  const availability = clamp(
    100 - (stockouts / n) * 140,
  );

  const wasteScore = clamp(
    100 -
      (impacts.reduce(
        (s, i) => s + i.after.expiryRisk,
        0,
      ) /
        n) *
        4,
  );

  const storageScore = clamp(
    100 - (overstocked / n) * 160,
  );

  const revenueScore = clamp(
    100 -
      (revenueAtRisk /
        Math.max(
          1,
          impacts.reduce(
            (s, i) => s + i.before.revenue,
            0,
          ),
        )) *
        200,
  );

  const replenishScore = clamp(
    100 -
      f.leadTimeDays * 9 -
      (f.demandMultiplier > 1
        ? (f.demandMultiplier - 1) * 55
        : 0),
  );

  const radar = [
    { axis: "Availability", score: availability },
    { axis: "Waste", score: wasteScore },
    { axis: "Storage", score: storageScore },
    { axis: "Revenue", score: revenueScore },
    { axis: "Replenishment", score: replenishScore },
  ];

  const resilience = Math.round(
    radar.reduce((s, r) => s + r.score, 0) /
      radar.length,
  );

  return {
    horizonDays,
    stockouts,
    overstocked,
    wasteValue: Math.round(wasteValue),
    revenueAtRisk: Math.round(revenueAtRisk),
    storageOverflow,
    resilience,
    radar,
    impacts: impacts.sort(
      (a, b) => b.riskScore - a.riskScore,
    ),
  };
}

function clamp(v: number): number {
  return Math.round(Math.max(0, Math.min(100, v)));
}

export function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
