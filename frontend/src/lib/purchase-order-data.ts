export interface PurchaseOrderSupplier {
  id: string;
  name: string | null;
  category: string | null;
}

export interface PurchaseOrderItem {
  id: string;
  product_id: string;
  qty: number;
  unit_cost: number;
}

export interface PurchaseOrder {
  id: string;
  org_id?: string;
  supplier_id: string | null;
  status: string | null;
  total: number | null;
  created_at: string;
  updated_at: string;
  supplier?: PurchaseOrderSupplier | null;
  suppliers?: PurchaseOrderSupplier | null;
  purchase_order_items?: PurchaseOrderItem[] | null;
}

export interface PurchaseOrderFilters {
  limit?: number;
  offset?: number;
}

export interface PurchaseOrderResponse {
  data: PurchaseOrder[];
  meta: {
    organizationId: string;
    total: number;
    limit: number;
    offset: number;
  };
}

export function purchaseOrderListQueryKey(
  organizationId: string | null,
  filters: PurchaseOrderFilters = {},
) {
  return ["purchase-orders", organizationId, filters] as const;
}

export function purchaseOrderDetailQueryKey(
  organizationId: string | null,
  purchaseOrderId: string,
) {
  return ["purchase-order-detail", organizationId, purchaseOrderId] as const;
}

export function buildPurchaseOrderPath(filters: PurchaseOrderFilters): string {
  const params = new URLSearchParams();
  params.set("limit", String(filters.limit ?? 25));
  params.set("offset", String(filters.offset ?? 0));
  return `/api/purchase-orders?${params.toString()}`;
}
