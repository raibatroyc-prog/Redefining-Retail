import { describe, expect, it } from "vitest";
import { handleApiRequest } from "../backend/api/routes/index";
import { ApiError } from "../backend/api/request-context";
import { analyzeInventoryRisk } from "../backend/intelligence/inventory-risk";
import { forecastDemand } from "../backend/intelligence/forecasting";
import { calculateReorderDecision } from "../backend/intelligence/reorder";
import { evaluateSupplier } from "../backend/intelligence/supplier-evaluation";
import { buildInventoryRecommendations } from "../backend/intelligence/recommendation";

const product = {
  id: "prod-1",
  sku: "SKU-1",
  name: "Widget",
  stock: 12,
  capacity: 100,
  velocity: "High" as const,
  demand_trend: 25,
  expires_at: null,
  unit_cost: 2,
  supplier_id: "supplier-1",
};

const supplier = {
  id: "supplier-1",
  name: "Northwind Retail",
  status: "active",
  next_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  on_time_rate: 96,
};

describe("deterministic intelligence", () => {
  it("builds a stable demand forecast for known inventory", () => {
    const forecast = forecastDemand(product, 7);
    expect(forecast.productId).toBe("prod-1");
    expect(forecast.averageDailyDemand).toBeGreaterThan(0);
    expect(forecast.horizonDays).toBe(7);
    expect(forecast.dataQuality).toBe("complete");
  });

  it("flags low inventory as a high risk condition", () => {
    const risk = analyzeInventoryRisk({ ...product, stock: 2, capacity: 100 });
    expect(risk.riskLevel).toBe("high");
    expect(risk.reasons.some((reason) => reason.toLowerCase().includes("coverage"))).toBe(true);
  });

  it("recommends an urgent reorder when coverage is critical", () => {
    const decision = calculateReorderDecision({ ...product, stock: 2 }, evaluateSupplier(product, supplier));
    expect(decision.action).toBe("urgent_reorder");
    expect(decision.priority).toBe("critical");
    expect(decision.recommendedQuantity).toBeGreaterThan(0);
  });

  it("keeps reorder quantities within capacity limits", () => {
    const decision = calculateReorderDecision({ ...product, stock: 40, capacity: 50 }, evaluateSupplier(product, supplier));
    expect(decision.recommendedQuantity).toBeGreaterThanOrEqual(0);
    expect(decision.recommendedQuantity).toBeLessThanOrEqual(10);
    expect(40 + decision.recommendedQuantity).toBeLessThanOrEqual(50);
  });

  it("returns no action when current stock already meets capacity", () => {
    const decision = calculateReorderDecision({ ...product, stock: 100, capacity: 90 }, evaluateSupplier(product, supplier));
    expect(decision.action).toBe("no_action");
    expect(decision.recommendedQuantity).toBe(0);
  });

  it("handles null and undefined demand trend values safely", () => {
    const nullTrend = forecastDemand({ ...product, demand_trend: null });
    const undefinedTrend = forecastDemand({ ...product, demand_trend: undefined });
    expect(nullTrend.dataQuality).toBe("partial");
    expect(undefinedTrend.dataQuality).toBe("partial");
    expect(Number.isFinite(nullTrend.averageDailyDemand)).toBe(true);
    expect(Number.isFinite(undefinedTrend.averageDailyDemand)).toBe(true);
  });

  it("handles negative stock and invalid capacity without generating unsafe quantities", () => {
    const decision = calculateReorderDecision({ ...product, stock: -15, capacity: -10 }, evaluateSupplier(product, supplier));
    expect(Number.isFinite(decision.recommendedQuantity)).toBe(true);
    expect(decision.recommendedQuantity).toBeGreaterThanOrEqual(0);
  });

  it("handles negative demand and invalid supplier metrics safely", () => {
    const forecast = forecastDemand({ ...product, demand_trend: -500 });
    const result = evaluateSupplier(product, {
      ...supplier,
      on_time_rate: -10,
      lead_time_days: -5,
      next_delivery: "bad-date",
    });

    expect(Number.isFinite(forecast.averageDailyDemand)).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.leadTimeDays).toBeNull();
  });

  it("evaluates supplier risk without inventing metrics", () => {
    const evaluation = evaluateSupplier(product, supplier);
    expect(evaluation.evaluation).toMatch(/low|medium|high/);
    expect(evaluation.score).toBeGreaterThan(0);
    expect(evaluation.onTimeRate).toBe(96);
  });

  it("returns insufficient data when required demand inputs are missing", () => {
    const forecast = forecastDemand({ ...product, capacity: 0, demand_trend: null });
    expect(forecast.dataQuality).toBe("insufficient");
    expect(forecast.averageDailyDemand).toBe(0);
  });

  it("applies expiry thresholds consistently", () => {
    const risk = analyzeInventoryRisk({
      ...product,
      expires_at: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    });
    expect(risk.expiryRisk).toBeGreaterThanOrEqual(90);
    expect(["high", "critical"]).toContain(risk.riskLevel);
  });

  it("creates an explainable recommendation with required fields", () => {
    const recommendations = buildInventoryRecommendations([product], [supplier]);
    expect(recommendations.length).toBe(1);
    const recommendation = recommendations[0];

    expect(recommendation.productId).toBe("prod-1");
    expect(["no_action", "monitor", "reorder", "urgent_reorder"]).toContain(recommendation.action);
    expect(["low", "medium", "high", "critical"]).toContain(recommendation.priority);
    expect(["low", "medium", "high", "critical"]).toContain(recommendation.riskLevel);
    expect(recommendation.reasons.length).toBeGreaterThan(0);
    expect(recommendation.forecast.productId).toBe("prod-1");
    expect(recommendation.supplier).not.toBeNull();
    expect(recommendation.dataQualityLimitations.join(" ").toLowerCase()).toMatch(/heuristic/);
    expect(recommendation.dataQualityLimitations.join(" ").toLowerCase()).not.toMatch(/calibrated probability/);
    expect(recommendation.timestamp).toBeTruthy();
  });

  it("sorts recommendations by priority severity", () => {
    const recommendations = buildInventoryRecommendations(
      [
        { ...product, id: "prod-low", stock: 200, capacity: 200, demand_trend: 0 },
        { ...product, id: "prod-critical", stock: 2, capacity: 100, demand_trend: 25 },
      ],
      [supplier],
    );

    const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 };
    expect(recommendations[0].productId).toBe("prod-critical");
    expect(priorityRank[recommendations[0].priority]).toBeLessThan(priorityRank[recommendations[1].priority]);
  });

  it("does not produce NaN, Infinity, or negative quantities in recommendations", () => {
    const recommendations = buildInventoryRecommendations(
      [
        { ...product, id: "prod-invalid", stock: 0, capacity: Number.NaN, velocity: undefined },
        { ...product, id: "prod-negative", stock: -3, capacity: 100, demand_trend: -20 },
      ],
      [supplier],
    );

    for (const recommendation of recommendations) {
      expect(Number.isFinite(recommendation.recommendedQuantity)).toBe(true);
      expect(recommendation.recommendedQuantity).toBeGreaterThanOrEqual(0);
      expect(recommendation.reasons.length).toBeGreaterThan(0);
    }
  });

  it("handles missing supplier records explicitly instead of fabricating them", () => {
    const evaluation = evaluateSupplier(product, null);
    expect(evaluation.dataQuality).toBe("insufficient");
    expect(evaluation.evaluation).toBe("high");
    expect(evaluation.reasons[0]).toContain("No supplier record");
  });
});

describe("intelligence api", () => {
  it("rejects unauthenticated intelligence requests with 401", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/intelligence/inventory-recommendations?organizationId=org-1"), {
      intelligenceController: {
        inventoryRecommendations: async () => {
          throw new ApiError("Unauthorized", 401, { code: "unauthorized" });
        },
      },
    });

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error.code).toBe("unauthorized");
  });

  it("rejects unauthorized organization access with 403", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/intelligence/inventory-recommendations?organizationId=org-2"), {
      intelligenceController: {
        inventoryRecommendations: async () => {
          throw new ApiError("Forbidden", 403, { code: "forbidden" });
        },
      },
    });

    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error.code).toBe("forbidden");
  });

  it("returns recommendations for an authorized organization", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/intelligence/inventory-recommendations?organizationId=org-1"), {
      intelligenceController: {
        inventoryRecommendations: async () => new Response(JSON.stringify({
          data: [{ productId: "prod-1", action: "monitor", recommendedQuantity: 0 }],
          meta: { organizationId: "org-1", total: 1 },
        }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        }),
      },
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.meta.organizationId).toBe("org-1");
    expect(payload.data[0].productId).toBe("prod-1");
  });
});
