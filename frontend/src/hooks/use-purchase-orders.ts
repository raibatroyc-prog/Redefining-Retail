import { useQuery } from "@tanstack/react-query";
import { requestReadOnlyApi } from "@/lib/api-client";
import {
  buildPurchaseOrderPath,
  purchaseOrderListQueryKey,
  type PurchaseOrderFilters,
  type PurchaseOrderResponse,
} from "@/lib/purchase-order-data";

export function usePurchaseOrders(
  organizationId: string | null,
  filters: PurchaseOrderFilters = {},
) {
  return useQuery({
    queryKey: purchaseOrderListQueryKey(organizationId, filters),
    enabled: Boolean(organizationId),
    retry: false,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestReadOnlyApi<PurchaseOrderResponse>(
        buildPurchaseOrderPath(filters),
        organizationId,
      );
    },
  });
}
