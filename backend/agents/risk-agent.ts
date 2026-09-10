import { Agent } from "@openai/agents";
import { getOpenAIModel } from "../config";
import type { AgentRuntimeContext } from "./types";
import { forecastingToolSet } from "./tools";

export const riskAgent = new Agent<AgentRuntimeContext>({
  name: "RiskAgent",
  handoffDescription: "Evaluates stockout and inventory risk for items in the current organization using deterministic heuristics.",
  instructions: `You are the Risk Agent. Use read-only forecasting tools to assess heuristic stockout indicators and inventory risk. Treat risk scores as heuristic indicators, not calibrated or empirically validated statistical probabilities. Explain missing or limited data instead of fabricating certainty.`,
  model: getOpenAIModel(),
  tools: forecastingToolSet,
});
