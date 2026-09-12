import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestMutationApi } from "@/lib/api-client";
import type { Product } from "@/lib/inventory-data";

export interface CreateProductInput {
  sku: string;
  name: string;
  brand?: string;
  department?: string;
  stock?: number;
  capacity?: number;
  unitCost?: number;
}

/**
 * Manager/Admin business-record management operation: add a new product
 * (SKU) to the organization's catalog. Calls POST /api/inventory ->
 * createProduct() service.
 */
export function useCreateProduct(organizationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestMutationApi<{ data: Product }>("/api/inventory", "POST", input, organizationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products", organizationId] });
    },
  });
}
