import { describe, expect, it } from "vitest";
import { requestReadOnlyApi } from "../frontend/src/lib/api-client";
import { buildInventoryPath, inventoryQueryKey } from "../frontend/src/hooks/use-products";

const session = async () => ({
  data: { session: { access_token: "session-token" } },
  error: null,
});

describe("phase 5.3 inventory API contracts", () => {
  it("maps supported list filters, limit, and offset to the backend request", () => {
    const url = new URL(`http://localhost${buildInventoryPath({
      search: "coffee",
      status: "low",
      category: "Grocery",
      lowStock: true,
      expiring: false,
      limit: 25,
      offset: 50,
    })}`);
    expect(url.searchParams.get("search")).toBe("coffee");
    expect(url.searchParams.get("status")).toBe("low");
    expect(url.searchParams.get("category")).toBe("Grocery");
    expect(url.searchParams.get("lowStock")).toBe("true");
    expect(url.searchParams.get("expiring")).toBe("false");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("offset")).toBe("50");
  });

  it("keeps list queries organization- and filter-aware", () => {
    expect(inventoryQueryKey("org-1", { offset: 0 })).not.toEqual(
      inventoryQueryKey("org-2", { offset: 0 }),
    );
    expect(inventoryQueryKey("org-1", { offset: 0 })).not.toEqual(
      inventoryQueryKey("org-1", { offset: 25 }),
    );
  });

  it("constructs authenticated product-detail requests and parses null fields", async () => {
    let request: Request | undefined;
    const result = await requestReadOnlyApi<{ data: { id: string; brand: null; aisle: null } }>(
      "/api/inventory/product-1",
      "org-1",
      {
        getSession: session,
        fetch: async (input, init) => {
          request = new Request(`http://localhost${input}`, init);
          return Response.json({ data: { id: "product-1", brand: null, aisle: null } });
        },
      },
    );
    expect(result.data.brand).toBeNull();
    expect(result.data.aisle).toBeNull();
    expect(request?.headers.get("x-org-id")).toBe("org-1");
    expect(new URL(request?.url ?? "http://localhost").searchParams.get("organizationId")).toBe("org-1");
  });

  it("constructs movement requests with default pagination and parses all movement types", async () => {
    let request: Request | undefined;
    const movements = ["sale", "receipt", "waste", "adjustment"].map((movement_type, index) => ({
      id: String(index),
      movement_type,
      quantity: index + 1,
      note: null,
      actor_id: null,
      created_at: "2026-09-08T00:00:00.000Z",
    }));
    const result = await requestReadOnlyApi<{ data: typeof movements; meta: { total: number } }>(
      "/api/inventory/product-1/movements?limit=25&offset=25",
      "org-1",
      {
        getSession: session,
        fetch: async (input, init) => {
          request = new Request(`http://localhost${input}`, init);
          return Response.json({ data: movements, meta: { total: 30 } });
        },
      },
    );
    const url = new URL(request?.url ?? "http://localhost");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("offset")).toBe("25");
    expect(result.data.map((movement) => movement.movement_type)).toEqual(
      ["sale", "receipt", "waste", "adjustment"],
    );
  });

  it("handles empty movement responses without treating them as errors", async () => {
    const result = await requestReadOnlyApi<{ data: unknown[] }>(
      "/api/inventory/product-1/movements?limit=25&offset=0",
      "org-1",
      { getSession: session, fetch: async () => Response.json({ data: [] }) },
    );
    expect(result.data).toEqual([]);
  });
});
