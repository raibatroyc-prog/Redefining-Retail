import { useQuery } from "@tanstack/react-query";
import { requestReadOnlyApi } from "@/lib/api-client";
import { inventoryRecommendationsQueryKey } from "@/lib/intelligence-data";
import type { InventoryRecommendationData } from "@/lib/intelligence-data";

interface InventoryRecommendationsResponse {
  data: InventoryRecommendationData[];
}

export function useInventoryRecommendations(organizationId: string | null) {
  return useQuery({
    queryKey: inventoryRecommendationsQueryKey(organizationId),
    enabled: Boolean(organizationId),
    retry: false,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization is required.");
      const response = await requestReadOnlyApi<InventoryRecommendationsResponse>(
        "/api/intelligence/inventory-recommendations",
        organizationId,
      );
      return response.data;
    },
  });
}
