import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import { getInventorySummary } from "../../services/report.service";
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

export const reportingInputSchema = z.object({}).strict();

export interface ReportingToolDependencies {
  getInventorySummary?: typeof getInventorySummary;
}

export function createReportingTools(deps: ReportingToolDependencies = {}) {
  const getInventorySummaryFn = deps.getInventorySummary ?? getInventorySummary;

  const getInventorySummaryTool = tool({
    name: "get_inventory_summary",
    description: "Return a summary of inventory health for the authenticated organization.",
    parameters: reportingInputSchema,
    execute: async (_input, runContext) => {
      assertActionAllowed("READ_ONLY");
      const organizationId = getRuntimeOrganizationId(runContext);
      return getInventorySummaryFn(organizationId);
    },
  });

  return {
    getInventorySummary: getInventorySummaryTool,
  };
}

export const reportingTools = createReportingTools();
export const reportingToolSet = Object.values(reportingTools);
