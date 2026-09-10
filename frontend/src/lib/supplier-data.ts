export interface Supplier {
  id: string;
  org_id?: string;
  name: string | null;
  category: string | null;
  contact_email: string | null;
  on_time_rate: number | null;
  status: string | null;
  next_delivery: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SupplierResponse {
  data: Supplier[];
  meta: {
    organizationId: string;
    total: number;
    limit: number;
    offset: number;
  };
}

export function supplierListQueryKey(
  organizationId: string | null,
  filters: SupplierFilters = {},
) {
  return ["suppliers", organizationId, filters] as const;
}

export function supplierDetailQueryKey(
  organizationId: string | null,
  supplierId: string,
) {
  return ["supplier-detail", organizationId, supplierId] as const;
}

export function buildSupplierPath(filters: SupplierFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  params.set("limit", String(filters.limit ?? 25));
  params.set("offset", String(filters.offset ?? 0));
  return `/api/suppliers?${params.toString()}`;
}
