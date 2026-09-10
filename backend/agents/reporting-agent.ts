import { Agent } from "@openai/agents";
import { getOpenAIModel } from "../config";
import type { AgentRuntimeContext } from "./types";
import { reportingToolSet } from "./tools";

export const reportingAgent = new Agent<AgentRuntimeContext>({
  name: "ReportingAgent",
  handoffDescription: "Summarizes the organization’s inventory posture and health metrics for executive reporting.",
  instructions: `You are the Reporting Agent. Use only read-only reporting tools to summarize inventory posture for the authenticated organization. Do not speculate beyond the available metrics.`,
  model: getOpenAIModel(),
  tools: reportingToolSet,
});
