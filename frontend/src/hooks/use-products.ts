import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/lib/inventory-data";
import { requestReadOnlyApi } from "@/lib/api-client";

export interface InventoryFilters {
  search?: string;
  status?: string;
  category?: string;
  lowStock?: boolean;
  expiring?: boolean;
  limit?: number;
  offset?: number;
}

export interface InventoryResponse {
  data: Product[];
  meta: { total: number; limit: number; offset: number; organizationId: string };
}

export function inventoryQueryKey(organizationId: string | null, filters: InventoryFilters = {}) {
  return ["products", organizationId, filters] as const;
}

export function buildInventoryPath(filters: InventoryFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.lowStock !== undefined) params.set("lowStock", String(filters.lowStock));
  if (filters.expiring !== undefined) params.set("expiring", String(filters.expiring));
  params.set("limit", String(filters.limit ?? 25));
  params.set("offset", String(filters.offset ?? 0));
  return `/api/inventory?${params.toString()}`;
}

export function useProducts(organizationId: string | null, filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: inventoryQueryKey(organizationId, filters),
    enabled: Boolean(organizationId),
    retry: false,
    queryFn: async (): Promise<InventoryResponse> => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestReadOnlyApi<InventoryResponse>(buildInventoryPath(filters), organizationId);
    },
  });
}
