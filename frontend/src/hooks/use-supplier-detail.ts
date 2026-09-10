import { useQuery } from "@tanstack/react-query";
import { requestReadOnlyApi } from "@/lib/api-client";
import {
  supplierDetailQueryKey,
  type Supplier,
} from "@/lib/supplier-data";

export function useSupplierDetail(
  organizationId: string | null,
  supplierId: string,
) {
  return useQuery({
    queryKey: supplierDetailQueryKey(organizationId, supplierId),
    enabled: Boolean(organizationId && supplierId),
    retry: false,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization is required.");
      const response = await requestReadOnlyApi<{ data: Supplier }>(
        `/api/suppliers/${encodeURIComponent(supplierId)}`,
        organizationId,
      );
      return response.data;
    },
  });
}
