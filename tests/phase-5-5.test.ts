import { describe, expect, it } from "vitest";
import { requestReadOnlyApi } from "../frontend/src/lib/api-client";
import {
  buildPurchaseOrderPath,
  purchaseOrderDetailQueryKey,
  purchaseOrderListQueryKey,
} from "../frontend/src/lib/purchase-order-data";

const session = async () => ({
  data: { session: { access_token: "session-token" } },
  error: null,
});

describe("phase 5.5 purchase-order contracts", () => {
  it("supports only the backend purchase-order pagination parameters", () => {
    const url = new URL(`http://localhost${buildPurchaseOrderPath({ limit: 25, offset: 50 })}`);
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("offset")).toBe("50");
    expect(url.searchParams.has("search")).toBe(false);
    expect(url.searchParams.has("status")).toBe(false);
    expect(url.searchParams.has("supplierId")).toBe(false);
  });

  it("constructs an authenticated organization-scoped list request and parses enriched rows", async () => {
    let request: Request | undefined;
    const result = await requestReadOnlyApi<{
      data: Array<{
        id: string;
        supplier_id: string | null;
        suppliers: { id: string; name: string; category: string | null };
        purchase_order_items: Array<{ id: string; product_id: string; qty: number; unit_cost: number }>;
      }>;
    }>("/api/purchase-orders?limit=25&offset=0", "org-1", {
      getSession: session,
      fetch: async (input, init) => {
        request = new Request(`http://localhost${input}`, init);
        return Response.json({
          data: [{
            id: "po-1",
            supplier_id: "supplier-1",
            suppliers: { id: "supplier-1", name: "Supplier", category: null },
            purchase_order_items: [{ id: "item-1", product_id: "product-1", qty: 3, unit_cost: 4.5 }],
          }],
        });
      },
    });
    expect(result.data[0].suppliers.name).toBe("Supplier");
    expect(result.data[0].purchase_order_items[0].unit_cost).toBe(4.5);
    expect(request?.headers.get("x-org-id")).toBe("org-1");
    expect(new URL(request?.url ?? "http://localhost").searchParams.get("organizationId")).toBe("org-1");
  });

  it("constructs detail requests and preserves null supplier fields", async () => {
    let request: Request | undefined;
    const result = await requestReadOnlyApi<{
      data: { id: string; total: null; suppliers: null; purchase_order_items: [] };
    }>("/api/purchase-orders/po-1", "org-1", {
      getSession: session,
      fetch: async (input, init) => {
        request = new Request(`http://localhost${input}`, init);
        return Response.json({
          data: { id: "po-1", total: null, suppliers: null, purchase_order_items: [] },
        });
      },
    });
    expect(result.data.total).toBeNull();
    expect(result.data.suppliers).toBeNull();
    expect(request?.headers.get("x-org-id")).toBe("org-1");
  });

  it("keeps list and detail queries isolated by organization and identifier", () => {
    expect(purchaseOrderListQueryKey("org-1", { offset: 0 })).not.toEqual(
      purchaseOrderListQueryKey("org-2", { offset: 0 }),
    );
    expect(purchaseOrderListQueryKey("org-1", { offset: 0 })).not.toEqual(
      purchaseOrderListQueryKey("org-1", { offset: 25 }),
    );
    expect(purchaseOrderDetailQueryKey("org-1", "po-1")).not.toEqual(
      purchaseOrderDetailQueryKey("org-2", "po-1"),
    );
    expect(purchaseOrderDetailQueryKey("org-1", "po-1")).not.toEqual(
      purchaseOrderDetailQueryKey("org-1", "po-2"),
    );
  });

  it("does not issue a request without an access token", async () => {
    await expect(requestReadOnlyApi("/api/purchase-orders", "org-1", {
      getSession: async () => ({ data: { session: null }, error: null }),
      fetch: async () => {
        throw new Error("fetch should not be called");
      },
    })).rejects.toMatchObject({ code: "unauthorized", status: 401 });
  });
});
