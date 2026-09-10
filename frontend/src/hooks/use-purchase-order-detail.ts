import { useQuery } from "@tanstack/react-query";
import { requestReadOnlyApi } from "@/lib/api-client";
import {
  purchaseOrderDetailQueryKey,
  type PurchaseOrder,
} from "@/lib/purchase-order-data";

export function usePurchaseOrderDetail(
  organizationId: string | null,
  purchaseOrderId: string,
) {
  return useQuery({
    queryKey: purchaseOrderDetailQueryKey(organizationId, purchaseOrderId),
    enabled: Boolean(organizationId && purchaseOrderId),
    retry: false,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization is required.");
      const response = await requestReadOnlyApi<{ data: PurchaseOrder }>(
        `/api/purchase-orders/${encodeURIComponent(purchaseOrderId)}`,
        organizationId,
      );
      return response.data;
    },
  });
}
