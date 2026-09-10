import type { AgentActionCategory, AgentExecutionMetadata } from "../types";
import { redactSensitiveValue } from "../types";

export class AgentAuditLogger {
  private readonly entries: AgentExecutionMetadata[] = [];

  record(entry: Omit<AgentExecutionMetadata, "timestamp"> & { timestamp?: string }): AgentExecutionMetadata {
    const auditEntry: AgentExecutionMetadata = {
      ...entry,
      timestamp: entry.timestamp ?? new Date().toISOString(),
    };
    this.entries.push(redactSensitiveValue(auditEntry));
    return this.entries[this.entries.length - 1];
  }

  getEntries(): AgentExecutionMetadata[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

export const agentAuditLogger = new AgentAuditLogger();

export function createAuditEntry(params: {
  requestId: string;
  userId: string;
  organizationId: string;
  agentName: string;
  toolName?: string;
  actionCategory: AgentActionCategory;
  success: boolean;
  errorCode?: string;
  intent?: string;
  specialists?: string[];
  durationMs?: number;
  model?: string;
  executionStatus?: "ready" | "blocked" | "error" | "timeout";
  modelAttempted?: boolean;
  mixedExecutionCapped?: boolean;
}): AgentExecutionMetadata {
  return agentAuditLogger.record({
    ...params,
    timestamp: new Date().toISOString(),
  });
}
