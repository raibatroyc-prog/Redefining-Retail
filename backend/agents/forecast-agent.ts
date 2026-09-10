import { Agent } from "@openai/agents";
import { getOpenAIModel } from "../config";
import type { AgentRuntimeContext } from "./types";
import { forecastingToolSet } from "./tools";

export const forecastAgent = new Agent<AgentRuntimeContext>({
  name: "ForecastAgent",
  handoffDescription: "Builds deterministic demand forecasts and reorder guidance from inventory metadata for the current organization.",
  instructions: `You are the Forecast Agent. Use only read-only forecasting and reorder tools. The system is deterministic and heuristic: never fabricate demand history or statistically calibrated probabilities. When data is insufficient, explain the limitation clearly.`,
  model: getOpenAIModel(),
  tools: forecastingToolSet,
});
