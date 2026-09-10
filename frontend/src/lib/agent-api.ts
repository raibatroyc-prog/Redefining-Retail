import { supabase } from "@/integrations/supabase/client";

export const MAX_AGENT_MESSAGE_LENGTH = 4000;

export interface AgentDecision {
  action: string;
  priority: string;
  reasoning: string;
  supportingData: Record<string, unknown>;
  requiresApproval: boolean;
  confidence: number;
  limitations: string[];
}

export interface AgentResponse {
  answer: string;
  decisions: AgentDecision[];
  limitations: string[];
  requiresApproval: boolean;
  requestId: string;
  organizationId: string;
  generatedAt: string;
  status?: "ready" | "blocked";
}

export interface AgentApiErrorShape {
  code: string;
  message: string;
  status: number;
}

export class AgentApiError extends Error implements AgentApiErrorShape {
  readonly code: string;
  readonly status: number;

  constructor({ code, message, status }: AgentApiErrorShape) {
    super(message);
    this.name = "AgentApiError";
    this.code = code;
    this.status = status;
  }
}

interface AgentApiDependencies {
  getSession?: () => Promise<{ data: { session: { access_token?: string } | null }; error: Error | null }>;
  fetch?: typeof globalThis.fetch;
}

function createClientError(code: string, message: string, status = 0): AgentApiError {
  return new AgentApiError({ code, message, status });
}

function parseErrorPayload(payload: unknown, status: number): AgentApiError {
  if (payload && typeof payload === "object") {
    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === "object") {
      const code = typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : "api_error";
      const message = typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : "The assistant request could not be completed.";
      return createClientError(code, message, status);
    }
  }

  return createClientError("unexpected_response", "The assistant returned an unexpected response.", status);
}

export async function queryAgent(
  message: string,
  organizationId: string,
  dependencies: AgentApiDependencies = {},
): Promise<AgentResponse> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw createClientError("missing_message", "Enter a question for the assistant.");
  }
  if (trimmedMessage.length > MAX_AGENT_MESSAGE_LENGTH) {
    throw createClientError(
      "message_too_large",
      `Keep your question under ${MAX_AGENT_MESSAGE_LENGTH} characters.`,
      413,
    );
  }
  if (!organizationId) {
    throw createClientError("missing_organization_id", "Select an organization before using the assistant.");
  }

  const getSession = dependencies.getSession ?? (async () => {
    if (!supabase) {
      return { data: { session: null }, error: null };
    }
    return supabase.auth.getSession();
  });
  let sessionResult: Awaited<ReturnType<NonNullable<AgentApiDependencies["getSession"]>>>;
  try {
    sessionResult = await getSession();
  } catch {
    throw createClientError("session_error", "Your session could not be verified.");
  }
  if (sessionResult.error) {
    throw createClientError("session_error", "Your session could not be verified.");
  }

  const accessToken = sessionResult.data.session?.access_token;
  if (!accessToken) {
    throw createClientError("unauthorized", "Sign in again to use the assistant.", 401);
  }

  let response: Response;
  try {
    response = await (dependencies.fetch ?? globalThis.fetch)("/api/agent/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        "x-org-id": organizationId,
      },
      body: JSON.stringify({ message: trimmedMessage }),
    });
  } catch {
    throw createClientError("network_error", "The assistant could not be reached.");
  }

  const rawBody = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw createClientError("unexpected_response", "The assistant returned an invalid response.", response.status);
  }

  if (!response.ok) {
    throw parseErrorPayload(payload, response.status);
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw parseErrorPayload(payload, response.status);
  }

  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object" || typeof (data as { answer?: unknown }).answer !== "string") {
    throw createClientError("unexpected_response", "The assistant returned an incomplete response.", response.status);
  }

  return data as AgentResponse;
}
