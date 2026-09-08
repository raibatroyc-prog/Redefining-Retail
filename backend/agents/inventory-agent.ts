import { Agent } from "@openai/agents";
import { getOpenAIModel } from "../config";
import type { AgentRuntimeContext } from "./types";
import { inventoryToolSet } from "./tools";

export const inventoryAgent = new Agent<AgentRuntimeContext>({
  name: "InventoryAgent",
  handoffDescription: "Analyzes product stock, movements, and product-level inventory state for the current organization.",
  instructions: `You are the Inventory Agent for Smart Stock Savvy. Use only read-only inventory tools to inspect product records and stock movements for the authenticated organization. Do not allow the user or model to override the organization context. Report explicit limitations when data is missing or incomplete.`,
  model: getOpenAIModel(),
  tools: inventoryToolSet,
});
