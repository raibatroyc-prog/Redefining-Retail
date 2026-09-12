import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestMutationApi } from "@/lib/api-client";

export type StockMovementType = "sale" | "receipt" | "waste" | "adjustment";

export interface RecordStockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
}

/**
 * User-side business operation: record a stock transaction (a sale,
 * receipt, waste write-off or manual adjustment) against a product.
 * Calls POST /api/inventory/:productId/movements, which is backed by
 * `addStockMovement()` in backend/services/inventory.service.ts.
 */
export function useRecordStockMovement(organizationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordStockMovementInput) => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestMutationApi(
        `/api/inventory/${encodeURIComponent(input.productId)}/movements`,
        "POST",
        { type: input.type, quantity: input.quantity, note: input.note },
        organizationId,
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["stock-movements", organizationId, variables.productId] });
      void queryClient.invalidateQueries({ queryKey: ["product-detail", organizationId, variables.productId] });
      void queryClient.invalidateQueries({ queryKey: ["products", organizationId] });
    },
  });
}
