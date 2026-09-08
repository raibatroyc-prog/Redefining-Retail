import { useQuery } from "@tanstack/react-query";
import { requestReadOnlyApi } from "@/lib/api-client";
import type { Product } from "@/lib/inventory-data";

export function useProductDetail(organizationId: string | null, productId: string) {
  return useQuery({
    queryKey: ["product-detail", organizationId, productId],
    enabled: Boolean(organizationId && productId),
    retry: false,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization is required.");
      const response = await requestReadOnlyApi<{ data: Product }>(
        `/api/inventory/${encodeURIComponent(productId)}`,
        organizationId,
      );
      return response.data;
    },
  });
}
