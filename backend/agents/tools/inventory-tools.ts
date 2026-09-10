import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import { getProduct, getProducts, getStockMovements } from "../../services/inventory.service";
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

export const inventoryQuerySchema = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).max(10000).default(0),
  status: z.string().trim().max(32).optional(),
  lowStock: z.boolean().optional(),
  expiring: z.boolean().optional(),
  search: z.string().trim().max(128).optional(),
});

export const productLookupSchema = z.object({
  productId: z.string().trim().min(1).max(128),
});

export const stockMovementLookupSchema = z.object({
  productId: z.string().trim().min(1).max(128),
  limit: z.number().int().min(1).max(200).default(25),
  offset: z.number().int().min(0).max(10000).default(0),
});

export interface InventoryToolDependencies {
  getProducts?: typeof getProducts;
  getProduct?: typeof getProduct;
  getStockMovements?: typeof getStockMovements;
}

export function createInventoryTools(deps: InventoryToolDependencies = {}) {
  const getProductsFn = deps.getProducts ?? getProducts;
  const getProductFn = deps.getProduct ?? getProduct;
  const getStockMovementsFn = deps.getStockMovements ?? getStockMovements;

  const getInventory = tool({
    name: "get_inventory",
    description: "Return a paginated list of products for the authenticated organization.",
    parameters: inventoryQuerySchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      const params = inventoryQuerySchema.parse(input);
      const data = await getProductsFn(organizationId);
      return data.slice(params.offset, params.offset + params.limit);
    },
  });

  const getProductTool = tool({
    name: "get_product",
    description: "Fetch a single product record for the authenticated organization.",
    parameters: productLookupSchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      const params = productLookupSchema.parse(input);
      const data = await getProductFn(params.productId);
      if (data?.org_id && data.org_id !== organizationId) {
        throw new Error("Product does not belong to the authenticated organization.");
      }
      return data;
    },
  });

  const getStockMovementsTool = tool({
    name: "get_stock_movements",
    description: "Read stock movements for a product within the authenticated organization.",
    parameters: stockMovementLookupSchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      const params = stockMovementLookupSchema.parse(input);
      const data = await getStockMovementsFn(organizationId, params.productId);
      return data.slice(params.offset, params.offset + params.limit);
    },
  });

  return {
    getInventory,
    getProduct: getProductTool,
    getStockMovements: getStockMovementsTool,
  };
}

export const inventoryTools = createInventoryTools();
export const inventoryToolSet = Object.values(inventoryTools);
