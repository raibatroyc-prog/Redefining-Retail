export type AgentActionCategory =
  | "READ_ONLY"
  | "RECOMMENDATION"
  | "MUTATION"
  | "EXTERNAL_COMMUNICATION"
  | "DESTRUCTIVE";

export type AgentPriority = "low" | "medium" | "high" | "critical";
export type AgentDecisionAction = "read_only" | "recommendation" | "blocked" | "error";

export interface AgentContext {
  userId: string;
  organizationId: string;
  requestId: string;
  sessionId?: string | null;
  authenticatedAt: string;
}

export type AgentRuntimeContext = AgentContext & Record<string, unknown>;

export interface AgentRequest {
  message: string;
  organizationId?: string | null;
  sessionId?: string | null;
  context?: Partial<AgentContext>;
}

export function createAgentContext(input: Partial<AgentContext> & { userId: string; organizationId: string; requestId?: string }): AgentContext {
  return {
    userId: input.userId,
    organizationId: input.organizationId,
    requestId: input.requestId ?? crypto.randomUUID(),
    sessionId: input.sessionId ?? null,
    authenticatedAt: input.authenticatedAt ?? new Date().toISOString(),
  };
}

export interface AgentDecision {
  action: AgentDecisionAction;
  priority: AgentPriority;
  reasoning: string;
  supportingData: Record<string, unknown>;
  requiresApproval: boolean;
  confidence: number;
  limitations: string[];
}

export interface AgentToolResult {
  toolName: string;
  status: "success" | "error";
  data?: unknown;
  error?: string;
}

export const MAX_AGENT_MESSAGE_LENGTH = 4000;
export const DEFAULT_AGENT_TIMEOUT_MS = 15000;
export const AGENT_TIMEOUT_MS = DEFAULT_AGENT_TIMEOUT_MS;
export const MAX_AGENT_TURNS = 1;

let agentTimeoutMs = DEFAULT_AGENT_TIMEOUT_MS;

export function getAgentTimeoutMs(): number {
  return agentTimeoutMs;
}

export function setAgentTimeoutMs(ms?: number): number {
  agentTimeoutMs = typeof ms === "number" && Number.isFinite(ms) && ms > 0
    ? ms
    : DEFAULT_AGENT_TIMEOUT_MS;
  return agentTimeoutMs;
}

export async function withAgentTimeout<T>(operation: () => Promise<T>, message = "Model execution timed out."): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(Object.assign(new Error(message), { code: "AGENT_TIMEOUT" }));
    }, getAgentTimeoutMs());
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

const SENSITIVE_PATTERNS: RegExp[] = [
  /sk-[a-zA-Z0-9_-]+/g,
  /Bearer\s+\S+/gi,
  /Authorization\s*[:=]\s*\S+/gi,
  /OPENAI_API_KEY/gi,
  /SUPABASE_SERVICE_ROLE_KEY/gi,
  /service[_-]?role(?:\s*key)?[^\s,;]*/gi,
];

export function redactSensitiveText(value: string): string {
  let next = value;
  for (const pattern of SENSITIVE_PATTERNS) {
    next = next.replace(pattern, "[REDACTED]");
  }
  return next;
}

export function redactSensitiveValue<T>(value: T): T {
  if (typeof value === "string") {
    return redactSensitiveText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValue(item)) as T;
  }
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (/authorization|api[_-]?key|secret|token|password|service[_-]?role/i.test(key)) {
        output[key] = "[REDACTED]";
      } else {
        output[key] = redactSensitiveValue(item);
      }
    }
    return output as T;
  }
  return value;
}

export interface AgentExecutionMetadata {
  requestId: string;
  userId: string;
  organizationId: string;
  agentName: string;
  toolName?: string;
  actionCategory: AgentActionCategory;
  timestamp: string;
  success: boolean;
  errorCode?: string;
  intent?: string;
  specialists?: string[];
  durationMs?: number;
  model?: string;
  executionStatus?: "ready" | "blocked" | "error" | "timeout";
  modelAttempted?: boolean;
  mixedExecutionCapped?: boolean;
}

export interface AgentResponse {
  answer: string;
  decisions: AgentDecision[];
  limitations: string[];
  requiresApproval: boolean;
  requestId: string;
  organizationId: string;
  generatedAt: string;
}

export interface AgentRuntimeOptions {
  model?: string;
  allowModelCalls?: boolean;
}
