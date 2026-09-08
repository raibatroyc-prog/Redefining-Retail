import { describe, expect, it } from "vitest";
import { dailyDemand, factorsFrom, suggestedQty } from "../frontend/src/lib/simulation";
import type { Product } from "../frontend/src/lib/inventory-data";

const product: Product = {
  id: "p1",
  sku: "SKU-1",
  name: "Test product",
  brand: null,
  department: "Grocery",
  aisle: null,
  stock: 10,
  capacity: 100,
  velocity: "High",
  demand_trend: 0,
  expires_at: null,
  last_received: null,
  unit_cost: 2,
  supplier_id: null,
};

describe("inventory simulation calculations", () => {
  it("derives daily demand from velocity and trend", () => {
    expect(dailyDemand(product)).toBe(16);
    expect(dailyDemand({ ...product, demand_trend: 25 })).toBe(20);
  });

  it("does not suggest stock beyond capacity", () => {
    expect(suggestedQty(product, 10)).toBe(90);
  });

  it("combines enabled stress factors", () => {
    expect(
      factorsFrom([
        { id: "demand_surge", enabled: true, severity: 50 },
        { id: "supplier_delay", enabled: true, severity: 3 },
      ]),
    ).toEqual({
      demandMultiplier: 1.5,
      leadTimeDays: 3,
      capacityLoss: 0,
      spoilageMultiplier: 1,
    });
  });
});
