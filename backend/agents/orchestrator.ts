import { Agent } from "@openai/agents";
import { getOpenAIModel, hasOpenAIConfig } from "../config";
import { createAuditEntry } from "./audit/agent-audit";
import { assertActionAllowed } from "./policy/action-policy";
import { executeSpecialistFlow, getAgentSdkRun, routeIntent, synthesizeGroundedResponse, validateAgentIntent, type AgentIntent, type SpecialistType } from "./router";
import type { AgentContext, AgentDecision, AgentRequest, AgentResponse, AgentRuntimeContext } from "./types";
import { createAgentContext, MAX_AGENT_TURNS, redactSensitiveValue, withAgentTimeout } from "./types";

export interface AgentOrchestratorRequest extends AgentRequest {
  context?: Partial<AgentContext>;
}

export interface AgentOrchestratorOutput extends AgentResponse {
  status: "ready" | "blocked";
}

const intentClassifier = new Agent<AgentRuntimeContext>({
  name: "IntentClassifier",
  handoffDescription: "Classifies supported read-only inventory intents for routing.",
  instructions: `Classify the user's request into one of: INVENTORY, FORECAST, SUPPLIER, RISK, REPORTING, MIXED, UNKNOWN. Use only the allowed values and return valid JSON with keys: type, confidence, reason, selectedSpecialists, limitations. Allowed specialist values are: inventory, forecast, supplier, risk, reporting. Never invent arbitrary specialist names or control organizationId.`,
  model: getOpenAIModel(),
});

function createSafeFailureRecord(errorCode: string, message: string) {
  return Object.assign(new Error(message), { code: errorCode });
}

function normalizeModelError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message || "Model execution failed.";
    if (message.toLowerCase().includes("timeout") || message.toLowerCase().includes("timed out") || message.toLowerCase().includes("aborted") || String((error as { code?: string }).code ?? "") === "AGENT_TIMEOUT") {
      return createSafeFailureRecord("AGENT_TIMEOUT", "Model execution timed out.");
    }
    if (/rate[_ -]?limit|429/i.test(message)) {
      return createSafeFailureRecord("AGENT_RATE_LIMITED", "The model is rate-limited.");
    }
    if (/invalid.*output|malformed/i.test(message)) {
      return createSafeFailureRecord("AGENT_INVALID_OUTPUT", "The model returned an invalid response.");
    }
    return createSafeFailureRecord("AGENT_PROVIDER_ERROR", "The model provider is unavailable.");
  }

  return createSafeFailureRecord("AGENT_PROVIDER_ERROR", "The model provider is unavailable.");
}

async function runModelWithBoundedTimeout<T>(operation: () => Promise<T>): Promise<T> {
  if (!hasOpenAIConfig()) {
    throw createSafeFailureRecord("AGENT_CONFIGURATION_ERROR", "Model configuration is unavailable.");
  }

  try {
    return await withAgentTimeout(operation);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

function sanitizeResponse(response: AgentOrchestratorOutput): AgentOrchestratorOutput {
  const redacted = redactSensitiveValue(response);
  const answer = typeof redacted.answer === "string" ? redacted.answer.slice(0, 2000) : "";
  const decisions = Array.isArray(redacted.decisions) ? redacted.decisions.slice(0, 5).map((decision) => ({
    ...decision,
    reasoning: typeof decision.reasoning === "string" ? decision.reasoning.slice(0, 500) : decision.reasoning,
    limitations: Array.isArray(decision.limitations) ? decision.limitations.slice(0, 5) : decision.limitations,
    supportingData: decision.supportingData && typeof decision.supportingData === "object"
      ? Object.fromEntries(Object.entries(decision.supportingData).slice(0, 12))
      : decision.supportingData,
  })) : [];
  const limitations = Array.isArray(redacted.limitations)
    ? [...new Set(redacted.limitations.map((limit) => String(limit).slice(0, 250)))].slice(0, 8)
    : [];

  return {
    ...redacted,
    answer,
    decisions,
    limitations,
  };
}

async function maybeRefineIntent(message: string, baseIntent: AgentIntent, requestId: string): Promise<AgentIntent> {
  if (!hasOpenAIConfig()) {
    return baseIntent;
  }

  const ambiguous = /\b(and|or|as well as|which products|what items)\b/i.test(message) || baseIntent.confidence < 0.8 || baseIntent.type === "UNKNOWN";
  if (!ambiguous) {
    return baseIntent;
  }

  try {
    const result = await runModelWithBoundedTimeout(async () => getAgentSdkRun()(intentClassifier, message, {
      context: { requestId, userId: "server", organizationId: "server", authenticatedAt: new Date().toISOString() },
      maxTurns: MAX_AGENT_TURNS,
    }));
    const candidate = typeof result.finalOutput === "string" ? result.finalOutput : JSON.stringify(result.finalOutput ?? {});
    const parsed = JSON.parse(candidate);
    return validateAgentIntent(parsed);
  } catch {
    return baseIntent;
  }
}

export class AgentOrchestrator {
  async process(request: AgentOrchestratorRequest): Promise<AgentOrchestratorOutput> {
    const startedAt = Date.now();
    const context = createAgentContext({
      userId: request.context?.userId ?? "unknown-user",
      organizationId: request.context?.organizationId ?? request.organizationId ?? "unknown-org",
      requestId: request.context?.requestId ?? crypto.randomUUID(),
      sessionId: request.context?.sessionId ?? request.sessionId ?? null,
      authenticatedAt: request.context?.authenticatedAt ?? new Date().toISOString(),
    });

    if (!context.userId || context.userId === "unknown-user" || context.organizationId === "unknown-org") {
      const blockedDecision: AgentDecision = {
        action: "blocked",
        priority: "medium",
        reasoning: "Received a request without a verified authenticated user and organization context.",
        supportingData: { message: request.message, organizationId: context.organizationId },
        requiresApproval: false,
        confidence: 0,
        limitations: ["Authentication and organization context are required before any agent routing."],
      };
      const blocked: AgentOrchestratorOutput = {
        answer: "Agent execution is blocked because the authenticated user and organization context are unavailable.",
        decisions: [blockedDecision],
        limitations: blockedDecision.limitations,
        requiresApproval: false,
        requestId: context.requestId,
        organizationId: context.organizationId,
        generatedAt: new Date().toISOString(),
        status: "blocked",
      };
      createAuditEntry({
        requestId: context.requestId,
        userId: context.userId,
        organizationId: context.organizationId,
        agentName: "IntentClassifier",
        actionCategory: "READ_ONLY",
        success: false,
        errorCode: "missing_context",
        executionStatus: "blocked",
        durationMs: Date.now() - startedAt,
      });
      return blocked;
    }

    if (!hasOpenAIConfig()) {
      const intent = routeIntent(request.message);
      const grounded = synthesizeGroundedResponse(intent, {});
      const response: AgentOrchestratorOutput = {
        answer: `The language model is unavailable, so this response uses deterministic read-only intent routing only. ${grounded.answer}`,
        decisions: grounded.decisions,
        limitations: [
          ...grounded.limitations,
          "Language-model execution is unavailable; deterministic routing remains the source of truth.",
        ],
        requiresApproval: false,
        requestId: context.requestId,
        organizationId: context.organizationId,
        generatedAt: new Date().toISOString(),
        status: "ready",
      };
      createAuditEntry({
        requestId: context.requestId,
        userId: context.userId,
        organizationId: context.organizationId,
        agentName: "IntentClassifier",
        actionCategory: "READ_ONLY",
        success: true,
        executionStatus: "ready",
        intent: intent.type,
        specialists: intent.selectedSpecialists,
        durationMs: Date.now() - startedAt,
        modelAttempted: false,
      });
      return sanitizeResponse(response);
    }

    assertActionAllowed("READ_ONLY");

    const baseIntent = routeIntent(request.message);
    const intent = await maybeRefineIntent(request.message, baseIntent, context.requestId);
    const selectedSpecialists = intent.selectedSpecialists as SpecialistType[];

    const decision: AgentDecision = {
      action: "read_only",
      priority: intent.type === "MIXED" ? "high" : "medium",
      reasoning: `Intent ${intent.type} selected a fixed specialist set: ${selectedSpecialists.length ? selectedSpecialists.join(", ") : "none"}.`,
      supportingData: {
        message: request.message,
        organizationId: context.organizationId,
        intentType: intent.type,
        selectedSpecialists,
      },
      requiresApproval: false,
      confidence: intent.confidence,
      limitations: intent.limitations,
    };

    if (intent.type === "UNKNOWN") {
      const response: AgentOrchestratorOutput = {
        answer: "This request is outside the supported read-only inventory workflow. Supported requests are inventory, forecast, supplier, risk, reporting, and mixed risk/inventory/supplier questions.",
        decisions: [decision],
        limitations: intent.limitations,
        requiresApproval: false,
        requestId: context.requestId,
        organizationId: context.organizationId,
        generatedAt: new Date().toISOString(),
        status: "ready",
      };
      createAuditEntry({
        requestId: context.requestId,
        userId: context.userId,
        organizationId: context.organizationId,
        agentName: "IntentClassifier",
        actionCategory: "READ_ONLY",
        success: true,
        executionStatus: "ready",
        intent: intent.type,
        durationMs: Date.now() - startedAt,
        model: getOpenAIModel(),
        modelAttempted: true,
      });
      return sanitizeResponse(response);
    }

    try {
      const execution = await executeSpecialistFlow(intent, context, request.message);
      const grounded = synthesizeGroundedResponse(intent, execution.results);
      const finalLimitations = [...new Set([...execution.limitations, ...grounded.limitations])];

      const response: AgentOrchestratorOutput = {
        answer: grounded.answer,
        decisions: grounded.decisions.length ? grounded.decisions : [decision],
        limitations: finalLimitations,
        requiresApproval: false,
        requestId: context.requestId,
        organizationId: context.organizationId,
        generatedAt: new Date().toISOString(),
        status: "ready",
      };

      createAuditEntry({
        requestId: context.requestId,
        userId: context.userId,
        organizationId: context.organizationId,
        agentName: selectedSpecialists[0] ?? "IntentClassifier",
        actionCategory: "READ_ONLY",
        success: true,
        executionStatus: "ready",
        intent: intent.type,
        specialists: selectedSpecialists,
        durationMs: Date.now() - startedAt,
        model: getOpenAIModel(),
        modelAttempted: true,
        mixedExecutionCapped: selectedSpecialists.length > 0 && selectedSpecialists.length >= 3,
      });

      return sanitizeResponse(response);
    } catch (error) {
      const normalized = normalizeModelError(error);
      const errorCode = String((normalized as { code?: string }).code ?? "AGENT_PROVIDER_ERROR");
      const timedOut = errorCode === "AGENT_TIMEOUT";
      const blockedResponse: AgentOrchestratorOutput = {
        answer: timedOut
          ? "The request terminated safely because model or specialist execution timed out."
          : "The request could not be processed safely because model or specialist execution failed.",
        decisions: [decision],
        limitations: [...new Set([
          ...decision.limitations,
          timedOut ? "Specialist execution timed out and was not retried." : "Grounded specialist execution failed.",
        ])],
        requiresApproval: false,
        requestId: context.requestId,
        organizationId: context.organizationId,
        generatedAt: new Date().toISOString(),
        status: "blocked",
      };
      createAuditEntry({
        requestId: context.requestId,
        userId: context.userId,
        organizationId: context.organizationId,
        agentName: selectedSpecialists[0] ?? "IntentClassifier",
        actionCategory: "READ_ONLY",
        success: false,
        errorCode,
        executionStatus: timedOut ? "timeout" : "error",
        intent: intent.type,
        specialists: selectedSpecialists,
        durationMs: Date.now() - startedAt,
        model: getOpenAIModel(),
        modelAttempted: true,
      });
      return sanitizeResponse(blockedResponse);
    }
  }
}

export const orchestrator = new AgentOrchestrator();
