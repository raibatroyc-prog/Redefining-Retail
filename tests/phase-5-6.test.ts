import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { matchesInventoryFilters } from "../backend/api/controllers/inventory.controller";
import { getSupplierDisplay } from "../frontend/src/components/product-detail-view";
import {
  removeOrganizationScopedQueries,
  resolveOrganizationSelection,
} from "../frontend/src/hooks/use-current-org";
import type { Product } from "../frontend/src/lib/inventory-data";

function product(stock: number, capacity = 100): Record<string, unknown> {
  return {
    name: "Test product",
    sku: "SKU-1",
    stock,
    capacity,
    demand_trend: 0,
    expires_at: null,
  };
}

describe("phase 5.6 hardening", () => {
  it("applies lowStock=true only to low and critical products", () => {
    expect(matchesInventoryFilters(product(5), { lowStock: true })).toBe(true);
    expect(matchesInventoryFilters(product(20), { lowStock: true })).toBe(true);
    expect(matchesInventoryFilters(product(50), { lowStock: true })).toBe(false);
  });

  it("applies lowStock=false to exclude both low and critical products", () => {
    expect(matchesInventoryFilters(product(5), { lowStock: false })).toBe(false);
    expect(matchesInventoryFilters(product(20), { lowStock: false })).toBe(false);
    expect(matchesInventoryFilters(product(50), { lowStock: false })).toBe(true);
  });

  it("does not apply a low-stock filter when lowStock is omitted", () => {
    expect(matchesInventoryFilters(product(5), {})).toBe(true);
    expect(matchesInventoryFilters(product(20), {})).toBe(true);
    expect(matchesInventoryFilters(product(50), {})).toBe(true);
  });

  it("prefers returned supplier name/category and safely falls back to supplier ID", () => {
    const baseProduct = {
      id: "product-1",
      sku: "SKU-1",
      name: "Coffee",
      brand: null,
      department: null,
      aisle: null,
      stock: 10,
      capacity: 100,
      velocity: "Medium",
      demand_trend: 0,
      expires_at: null,
      last_received: null,
      unit_cost: 2,
      supplier_id: "supplier-1",
    } satisfies Product;

    expect(getSupplierDisplay({
      ...baseProduct,
      suppliers: { id: "supplier-1", name: "Acme Foods", category: "Grocery" },
    })).toEqual({ name: "Acme Foods", category: "Grocery" });
    expect(getSupplierDisplay({ ...baseProduct, suppliers: null }))
      .toEqual({ name: "supplier-1", category: "Unavailable" });
  });

  it("removes only cached queries belonging to the previous organization", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["products", "org-1", { offset: 0 }], "old");
    queryClient.setQueryData(["suppliers", "org-1", {}], "old supplier");
    queryClient.setQueryData(["products", "org-2", { offset: 0 }], "new");

    removeOrganizationScopedQueries(queryClient, "org-1");

    expect(queryClient.getQueryData(["products", "org-1", { offset: 0 }])).toBeUndefined();
    expect(queryClient.getQueryData(["suppliers", "org-1", {}])).toBeUndefined();
    expect(queryClient.getQueryData(["products", "org-2", { offset: 0 }])).toBe("new");
  });

  it("continues to select only an authorized organization", () => {
    expect(resolveOrganizationSelection({
      userId: "user-1",
      organizationIds: ["org-1", "org-2"],
      preferredOrganizationId: "org-2",
    })).toBe("org-2");
    expect(resolveOrganizationSelection({
      userId: "user-1",
      organizationIds: ["org-1"],
      preferredOrganizationId: "org-other",
    })).toBe("org-1");
  });
});
