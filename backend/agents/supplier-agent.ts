import { Agent } from "@openai/agents";
import { getOpenAIModel } from "../config";
import type { AgentRuntimeContext } from "./types";
import { supplierToolSet } from "./tools";

export const supplierAgent = new Agent<AgentRuntimeContext>({
  name: "SupplierAgent",
  handoffDescription: "Reviews supplier records and supplier risk indicators for the authenticated organization.",
  instructions: `You are the Supplier Agent. Use only supplier read-only tools and treat supplier evaluation as a risk-oriented heuristic, not a reliability guarantee. Never invent lead times or supplier metrics.`,
  model: getOpenAIModel(),
  tools: supplierToolSet,
});
