import { authorizeOrganizationAccess, getOrganizationMemberships, requireAuthentication } from "../auth";
import { ApiError, resolveOrganizationIdFromRequest } from "../request-context";
import { createAgentContext, MAX_AGENT_MESSAGE_LENGTH, redactSensitiveValue, type AgentContext } from "../../agents/types";
import { orchestrator } from "../../agents/orchestrator";

export interface AgentControllerDependencies {
  requireAuthentication?: typeof requireAuthentication;
  getOrganizationMemberships?: typeof getOrganizationMemberships;
  authorizeOrganizationAccess?: typeof authorizeOrganizationAccess;
  resolveOrganizationId?: typeof resolveOrganizationIdFromRequest;
  orchestrator?: {
    process: (request: { message: string; context: AgentContext }) => Promise<unknown>;
  };
}

function sanitizeAgentResponsePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const output = payload as Record<string, unknown>;
  const answer = typeof output.answer === "string" ? output.answer.slice(0, 2000) : "";
  const decisions = Array.isArray(output.decisions)
    ? output.decisions.slice(0, 5).map((decision) => {
        if (!decision || typeof decision !== "object") { return decision; }
        const next = { ...(decision as Record<string, unknown>) };
        if (typeof next.reasoning === "string") {
          next.reasoning = next.reasoning.slice(0, 500);
        }
        if (Array.isArray(next.limitations)) {
          next.limitations = next.limitations.slice(0, 5).map((limit) => String(limit).slice(0, 250));
        }
        return next;
      })
    : [];
  const limitations = Array.isArray(output.limitations)
    ? [...new Set(output.limitations.map((limit) => String(limit).slice(0, 250)))].slice(0, 8)
    : [];

  return redactSensitiveValue({
    ...output,
    answer,
    decisions,
    limitations,
  });
}

export async function agentController(request: Request, dependencies: AgentControllerDependencies = {}): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: { code: "method_not_allowed", message: "Only POST requests are supported." } }),
      { status: 405, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }

  const auth = await (dependencies.requireAuthentication ?? requireAuthentication)(request);
  const requestOrganizationId = (dependencies.resolveOrganizationId ?? resolveOrganizationIdFromRequest)(request);

  let resolvedOrganizationId = requestOrganizationId;
  if (!resolvedOrganizationId) {
    const memberships = await (dependencies.getOrganizationMemberships ?? getOrganizationMemberships)(auth.userId, auth.supabase);
    const currentOrgResult = await auth.supabase
      .from("profiles")
      .select("current_org_id")
      .eq("id", auth.userId)
      .maybeSingle();

    if (currentOrgResult.error) {
      throw new ApiError("Failed to resolve current organization context", 500, { code: "current_organization_lookup_failed" });
    }

    resolvedOrganizationId = currentOrgResult.data?.current_org_id ?? memberships[0]?.org_id ?? null;
  }

  if (!resolvedOrganizationId) {
    throw new ApiError("Organization context is required", 400, { code: "missing_organization_id" });
  }

  const authorizedOrganizationId = await (dependencies.authorizeOrganizationAccess ?? authorizeOrganizationAccess)({
    request,
    userId: auth.userId,
    supabase: auth.supabase,
    organizationId: resolvedOrganizationId,
  });

  let body: unknown;
  try {
    const rawBody = await request.clone().text();
    if (!rawBody.trim()) {
      throw new ApiError("Request body is required", 400, { code: "missing_body" });
    }
    body = JSON.parse(rawBody);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Malformed JSON body", 400, { code: "malformed_json" });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError("Request body must be a JSON object", 400, { code: "malformed_json" });
  }

  const payload = body as Record<string, unknown>;
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) {
    throw new ApiError("A non-empty message is required", 400, { code: "missing_message" });
  }

  if (message.length > MAX_AGENT_MESSAGE_LENGTH) {
    throw new ApiError(`Message exceeds the ${MAX_AGENT_MESSAGE_LENGTH}-character limit.`, 413, { code: "message_too_large" });
  }

  const response = await (dependencies.orchestrator ?? orchestrator).process({
    message,
    context: createAgentContext({
      userId: auth.userId,
      organizationId: authorizedOrganizationId,
      requestId: crypto.randomUUID(),
      sessionId: null,
      authenticatedAt: new Date().toISOString(),
    }),
  });

  return new Response(JSON.stringify({ data: sanitizeAgentResponsePayload(response) }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
