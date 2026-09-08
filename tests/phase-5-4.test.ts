import { describe, expect, it } from "vitest";
import { requestReadOnlyApi } from "../frontend/src/lib/api-client";
import {
  buildSupplierPath,
  supplierDetailQueryKey,
  supplierListQueryKey,
} from "../frontend/src/lib/supplier-data";

const session = async () => ({
  data: { session: { access_token: "session-token" } },
  error: null,
});

describe("phase 5.4 supplier contracts", () => {
  it("maps supported supplier search and pagination parameters", () => {
    const url = new URL(`http://localhost${buildSupplierPath({
      search: "fresh",
      limit: 25,
      offset: 50,
    })}`);
    expect(url.searchParams.get("search")).toBe("fresh");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("offset")).toBe("50");
    expect(url.searchParams.has("category")).toBe(false);
  });

  it("constructs an organization-scoped supplier list request and parses the envelope", async () => {
    let request: Request | undefined;
    const result = await requestReadOnlyApi<{ data: Array<{ id: string; contact_email: null }> }>(
      "/api/suppliers?limit=25&offset=0",
      "org-1",
      {
        getSession: session,
        fetch: async (input, init) => {
          request = new Request(`http://localhost${input}`, init);
          return Response.json({ data: [{ id: "supplier-1", contact_email: null }] });
        },
      },
    );
    expect(result.data[0].contact_email).toBeNull();
    expect(request?.headers.get("x-org-id")).toBe("org-1");
    expect(new URL(request?.url ?? "http://localhost").searchParams.get("organizationId")).toBe("org-1");
  });

  it("constructs supplier detail requests and preserves unavailable fields", async () => {
    let request: Request | undefined;
    const result = await requestReadOnlyApi<{
      data: { id: string; name: string; category: null; contact_email: null };
    }>("/api/suppliers/supplier-1", "org-1", {
      getSession: session,
      fetch: async (input, init) => {
        request = new Request(`http://localhost${input}`, init);
        return Response.json({
          data: { id: "supplier-1", name: "Supplier", category: null, contact_email: null },
        });
      },
    });
    expect(result.data.category).toBeNull();
    expect(result.data.contact_email).toBeNull();
    expect(request?.headers.get("x-org-id")).toBe("org-1");
  });

  it("keeps supplier queries isolated by organization and supplier", () => {
    expect(supplierListQueryKey("org-1", { offset: 0 })).not.toEqual(
      supplierListQueryKey("org-2", { offset: 0 }),
    );
    expect(supplierListQueryKey("org-1", { offset: 0 })).not.toEqual(
      supplierListQueryKey("org-1", { offset: 25 }),
    );
    expect(supplierDetailQueryKey("org-1", "supplier-1")).not.toEqual(
      supplierDetailQueryKey("org-2", "supplier-1"),
    );
    expect(supplierDetailQueryKey("org-1", "supplier-1")).not.toEqual(
      supplierDetailQueryKey("org-1", "supplier-2"),
    );
  });

  it("does not send requests without a session", async () => {
    await expect(requestReadOnlyApi("/api/suppliers", "org-1", {
      getSession: async () => ({ data: { session: null }, error: null }),
      fetch: async () => {
        throw new Error("fetch should not be called");
      },
    })).rejects.toMatchObject({ code: "unauthorized", status: 401 });
  });
});
