import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestMutationApi } from "@/lib/api-client";
import type { Supplier } from "@/lib/supplier-data";

export interface CreateSupplierInput {
  name: string;
  category?: string;
  contactEmail?: string;
}

export interface UpdateSupplierInput {
  supplierId: string;
  name?: string;
  category?: string;
  contactEmail?: string;
  status?: "on-time" | "delayed" | "at-risk";
  nextDelivery?: string;
  onTimeRate?: number;
}

/**
 * Manager/Admin business-record management operation: onboard a new
 * supplier. Calls POST /api/suppliers -> createSupplier() service.
 */
export function useCreateSupplier(organizationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSupplierInput) => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestMutationApi<{ data: Supplier }>("/api/suppliers", "POST", input, organizationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["suppliers", organizationId] });
    },
  });
}

/**
 * Manager/Admin business-record management operation: update an existing
 * supplier's details or delivery-performance status. Calls
 * PATCH /api/suppliers/:id -> updateSupplier() service.
 */
export function useUpdateSupplier(organizationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ supplierId, ...updates }: UpdateSupplierInput) => {
      if (!organizationId) throw new Error("Organization is required.");
      return requestMutationApi<{ data: Supplier }>(
        `/api/suppliers/${encodeURIComponent(supplierId)}`,
        "PATCH",
        updates,
        organizationId,
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["suppliers", organizationId] });
      void queryClient.invalidateQueries({ queryKey: ["supplier-detail", organizationId, variables.supplierId] });
    },
  });
}
