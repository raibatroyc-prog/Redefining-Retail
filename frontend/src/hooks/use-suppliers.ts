import { useQuery } from "@tanstack/react-query";
import { requestReadOnlyApi } from "@/lib/api-client";
import {
  buildSupplierPath,
  supplierListQueryKey,
  type SupplierFilters,
  type SupplierResponse,
} from "@/lib/supplier-data";

export function useSuppliers(
  organizationId: string | null,
  filters: SupplierFilters = {},
) {
  return useQuery({
    queryKey: supplierListQueryKey(organizationId, filters),
    enabled: Boolean(organizationId),
    retry: false,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestReadOnlyApi<SupplierResponse>(
        buildSupplierPath(filters),
        organizationId,
      );
    },
  });
}
