import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestMutationApi } from "@/lib/api-client";
import type { PurchaseOrder, PurchaseOrderItem } from "@/lib/purchase-order-data";

export type PurchaseOrderStatus = "draft" | "sent" | "received" | "cancelled";

/**
 * Manager/Admin management operation: open a new draft purchase order
 * against a supplier. Calls POST /api/purchase-orders ->
 * createPurchaseOrder() service.
 */
export function useCreatePurchaseOrder(organizationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { supplierId: string }) => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestMutationApi<{ data: PurchaseOrder }>("/api/purchase-orders", "POST", input, organizationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchase-orders", organizationId] });
    },
  });
}

/**
 * Manager/Admin management operation: add a line item (product, quantity,
 * unit cost) to a draft purchase order. Calls
 * POST /api/purchase-orders/:id/items -> addPurchaseOrderItem() service.
 */
export function useAddPurchaseOrderItem(organizationId: string | null, purchaseOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { productId: string; quantity: number; unitCost: number }) => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestMutationApi<{ data: PurchaseOrderItem }>(
        `/api/purchase-orders/${encodeURIComponent(purchaseOrderId)}/items`,
        "POST",
        input,
        organizationId,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchase-order-detail", organizationId, purchaseOrderId] });
      void queryClient.invalidateQueries({ queryKey: ["purchase-orders", organizationId] });
    },
  });
}

/**
 * Manager/Admin management operation + business algorithm guard: advance
 * a purchase order through its lifecycle (send/approve, mark received, or
 * cancel). Calls PATCH /api/purchase-orders/:id/status, which enforces
 * the draft -> sent -> received|cancelled state machine server-side.
 */
export function useUpdatePurchaseOrderStatus(organizationId: string | null, purchaseOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: PurchaseOrderStatus) => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestMutationApi<{ data: PurchaseOrder }>(
        `/api/purchase-orders/${encodeURIComponent(purchaseOrderId)}/status`,
        "PATCH",
        { status },
        organizationId,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchase-order-detail", organizationId, purchaseOrderId] });
      void queryClient.invalidateQueries({ queryKey: ["purchase-orders", organizationId] });
    },
  });
}
