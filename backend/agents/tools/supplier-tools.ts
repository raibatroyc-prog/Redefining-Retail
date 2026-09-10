import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import { getSupplier, getSuppliers } from "../../services/supplier.service";
import { assertActionAllowed } from "../policy/action-policy";
import type { AgentRuntimeContext } from "../types";

function getRuntimeOrganizationId(runContext: RunContext<unknown> | undefined): string {
  const organizationId = runContext?.context && typeof runContext.context === "object"
    ? (runContext.context as Partial<AgentRuntimeContext>).organizationId
    : undefined;
  if (typeof organizationId !== "string" || !organizationId.trim()) {
    throw new Error("No authenticated organization context is available for this tool call.");
  }
  return organizationId;
}

export const supplierLookupSchema = z.object({
  supplierId: z.string().trim().min(1).max(128).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).max(10000).default(0),
});

export interface SupplierToolDependencies {
  getSuppliers?: typeof getSuppliers;
  getSupplier?: typeof getSupplier;
}

export function createSupplierTools(deps: SupplierToolDependencies = {}) {
  const getSuppliersFn = deps.getSuppliers ?? getSuppliers;
  const getSupplierFn = deps.getSupplier ?? getSupplier;

  const getSuppliersList = tool({
    name: "get_suppliers",
    description: "List suppliers for the authenticated organization.",
    parameters: supplierLookupSchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      const params = supplierLookupSchema.parse(input);
      const data = await getSuppliersFn(organizationId);
      return data.slice(params.offset, params.offset + params.limit);
    },
  });

  const getSupplierInfo = tool({
    name: "get_supplier",
    description: "Fetch a supplier record within the authenticated organization.",
    parameters: supplierLookupSchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const params = supplierLookupSchema.parse(input);
      if (!params.supplierId) {
        throw new Error("Supplier ID is required for supplier lookup.");
      }
      const organizationId = getRuntimeOrganizationId(runContext);
      const data = await getSupplierFn(params.supplierId);
      if (!data || (data as { org_id?: string }).org_id !== organizationId) {
        throw new Error("Supplier does not belong to the authenticated organization.");
      }
      return data;
    },
  });

  return {
    getSuppliers: getSuppliersList,
    getSupplier: getSupplierInfo,
  };
}

export const supplierTools = createSupplierTools();
export const supplierToolSet = Object.values(supplierTools);
