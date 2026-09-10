import { describe, expect, it } from "vitest";
import { requestReadOnlyApi } from "../frontend/src/lib/api-client";
import {
  formatFillRate,
  inventoryRecommendationsQueryKey,
  inventorySummaryQueryKey,
  resolveProductNames,
} from "../frontend/src/lib/intelligence-data";

describe("phase 5.2 inventory intelligence contracts", () => {
  it("constructs an organization-scoped summary request and parses its envelope", async () => {
    let request: Request | undefined;
    const response = await requestReadOnlyApi<{ data: { totalProducts: number; averageFillRate: number } }>(
      "/api/reports/inventory-summary",
      "org-1",
      {
        getSession: async () => ({
          data: { session: { access_token: "session-token" } },
          error: null,
        }),
        fetch: async (input, init) => {
          request = new Request(`http://localhost${input}`, init);
          return Response.json({ data: { totalProducts: 4, averageFillRate: 0.875 } });
        },
      },
    );

    expect(response.data.totalProducts).toBe(4);
    expect(new URL(request?.url ?? "http://localhost").searchParams.get("organizationId")).toBe("org-1");
    expect(request?.headers.get("x-org-id")).toBe("org-1");
    expect(request?.headers.get("authorization")).toMatch(/^Bearer /);
  });

  it("formats backend fill rates without recalculating alternate metrics", () => {
    expect(formatFillRate(0.875)).toBe("87.5%");
    expect(formatFillRate(0)).toBe("0.0%");
  });

  it("parses recommendation data while preserving limitations and supports unresolved product fallback", async () => {
    const recommendation = {
      productId: "product-2",
      action: "reorder",
      priority: "high",
      recommendedQuantity: 12,
      riskLevel: "high",
      reasons: ["Low stock"],
      forecast: {
        productId: "product-2",
        horizonDays: 7,
        averageDailyDemand: 2,
        forecastedDemand: 14,
        trendDirection: "up",
        confidence: 0.6,
        dataQuality: "partial",
      },
      supplier: null,
      dataQualityLimitations: ["Heuristic indicator only."],
      timestamp: "2026-09-08T00:00:00.000Z",
    };
    const response = await requestReadOnlyApi<{ data: typeof recommendation[] }>(
      "/api/intelligence/inventory-recommendations",
      "org-1",
      {
        getSession: async () => ({
          data: { session: { access_token: "session-token" } },
          error: null,
        }),
        fetch: async () => Response.json({ data: [recommendation] }),
      },
    );

    expect(response.data[0].dataQualityLimitations).toEqual(["Heuristic indicator only."]);
    const names = resolveProductNames([{ id: "product-1", name: "Known product" }]);
    expect(names.get(response.data[0].productId) ?? response.data[0].productId).toBe("product-2");
  });

  it("uses organization-aware independent query keys", () => {
    expect(inventorySummaryQueryKey("org-1")).not.toEqual(inventorySummaryQueryKey("org-2"));
    expect(inventoryRecommendationsQueryKey("org-1")).not.toEqual(inventoryRecommendationsQueryKey("org-2"));
  });

  it("represents an empty recommendation result as successful data", async () => {
    const response = await requestReadOnlyApi<{ data: unknown[] }>(
      "/api/intelligence/inventory-recommendations",
      "org-1",
      {
        getSession: async () => ({
          data: { session: { access_token: "session-token" } },
          error: null,
        }),
        fetch: async () => Response.json({ data: [] }),
      },
    );
    expect(response.data).toEqual([]);
  });
});
