import { useQuery } from "@tanstack/react-query";
import { requestReadOnlyApi } from "@/lib/api-client";
import { inventorySummaryQueryKey } from "@/lib/intelligence-data";
import type { InventorySummary } from "@/lib/intelligence-data";

interface InventorySummaryResponse {
  data: InventorySummary;
}

export function useInventorySummary(organizationId: string | null) {
  return useQuery({
    queryKey: inventorySummaryQueryKey(organizationId),
    enabled: Boolean(organizationId),
    retry: false,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization is required.");
      const response = await requestReadOnlyApi<InventorySummaryResponse>(
        "/api/reports/inventory-summary",
        organizationId,
      );
      return response.data;
    },
  });
}
