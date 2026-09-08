import { useQuery } from "@tanstack/react-query";
import { requestReadOnlyApi } from "@/lib/api-client";

export interface StockMovement {
  id?: string;
  movement_type?: "sale" | "receipt" | "waste" | "adjustment";
  type?: "sale" | "receipt" | "waste" | "adjustment";
  quantity: number;
  note?: string | null;
  actor_id?: string | null;
  created_at: string;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  meta: { total: number; limit: number; offset: number; productId: string; organizationId: string };
}

export function useStockMovements(
  organizationId: string | null,
  productId: string,
  offset: number,
) {
  return useQuery({
    queryKey: ["stock-movements", organizationId, productId, 25, offset],
    enabled: Boolean(organizationId && productId),
    retry: false,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestReadOnlyApi<StockMovementsResponse>(
        `/api/inventory/${encodeURIComponent(productId)}/movements?limit=25&offset=${offset}`,
        organizationId,
      );
    },
  });
}
