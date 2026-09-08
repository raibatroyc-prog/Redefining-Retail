import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import type { IntelligenceProductLike } from "../../intelligence/types";
import { analyzeInventoryRisk } from "../../intelligence/inventory-risk";
import { forecastDemand } from "../../intelligence/forecasting";
import { calculateReorderDecision } from "../../intelligence/reorder";
import { buildInventoryRecommendations } from "../../intelligence/recommendation";
import { getProducts } from "../../services/inventory.service";
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

const forecastInputSchema = z.object({
  productId: z.string().trim().min(1).max(128).optional(),
  horizonDays: z.number().int().min(1).max(90).default(7),
  limit: z.number().int().min(1).max(200).default(20),
});

export interface ForecastingToolDependencies {
  getProducts?: typeof getProducts;
}

export function createForecastingTools(deps: ForecastingToolDependencies = {}) {
  const getProductsFn = deps.getProducts ?? getProducts;

  const getInventoryForecast = tool({
    name: "get_inventory_forecast",
    description: "Return deterministic demand forecasts and risk summaries for the authenticated organization.",
    parameters: forecastInputSchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      const params = forecastInputSchema.parse(input);
      const products = await getProductsFn(organizationId);
      const filtered = params.productId
        ? products.filter((product) => product.id === params.productId)
        : products.slice(0, params.limit);

      return filtered.map((product) => ({
        productId: product.id,
        forecast: forecastDemand(product as IntelligenceProductLike, params.horizonDays),
        risk: analyzeInventoryRisk(product as IntelligenceProductLike),
      }));
    },
  });

  const getInventoryRisk = tool({
    name: "get_inventory_risk",
    description: "Return risk indicators for products in the authenticated organization.",
    parameters: forecastInputSchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      const params = forecastInputSchema.parse(input);
      const products = await getProductsFn(organizationId);
      const filtered = params.productId
        ? products.filter((product) => product.id === params.productId)
        : products.slice(0, params.limit);

      return filtered.map((product) => ({
        productId: product.id,
        risk: analyzeInventoryRisk(product as IntelligenceProductLike),
      }));
    },
  });

  const getReorderDecision = tool({
    name: "get_reorder_decision",
    description: "Return reorder recommendations for products in the authenticated organization.",
    parameters: forecastInputSchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      const params = forecastInputSchema.parse(input);
      const products = await getProductsFn(organizationId);
      const filtered = params.productId
        ? products.filter((product) => product.id === params.productId)
        : products.slice(0, params.limit);

      return filtered.map((product) => ({
        productId: product.id,
        decision: calculateReorderDecision(product as IntelligenceProductLike),
      }));
    },
  });

  const getInventoryRecommendations = tool({
    name: "get_inventory_recommendations",
    description: "Return deterministic inventory recommendations for the authenticated organization.",
    parameters: forecastInputSchema,
    execute: async (input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      const params = forecastInputSchema.parse(input);
      const products = await getProductsFn(organizationId);
      const filtered = params.productId
        ? products.filter((product) => product.id === params.productId)
        : products.slice(0, params.limit);

      return buildInventoryRecommendations(filtered as IntelligenceProductLike[]);
    },
  });

  return {
    getInventoryForecast,
    getInventoryRisk,
    getReorderDecision,
    getInventoryRecommendations,
  };
}

export const forecastingTools = createForecastingTools();
export const forecastingToolSet = Object.values(forecastingTools);
