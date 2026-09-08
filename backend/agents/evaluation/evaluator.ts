import { routeIntent, executeSpecialistFlow, MAX_SPECIALIST_EXECUTIONS, setSpecialistAgentRunner, specialistAgentMap, synthesizeGroundedResponse } from "../router";
import { createAgentContext } from "../types";
import type { EvaluationCase, EvaluationResult } from "./types";

export type SpecialistRunner = (
  agent: any,
  input: string,
  context: any,
) => Promise<{ finalOutput?: string | Record<string, unknown> }>;

const defaultFakeRunner: SpecialistRunner = async (agent, input, context) => ({
  finalOutput: {
    agentName: agent?.name ?? "unknown",
    input,
    organizationId: context?.organizationId,
    evidence: [{
      source: agent?.name ?? "agent",
      note: "deterministic evidence used for grounding",
    }],
    limitations: [],
  },
});

function normalizeTools(agent: any): string[] {
  if (!agent || !Array.isArray(agent.tools)) return [];
  return agent.tools
    .map((tool: any) => (typeof tool?.name === "string"
      ? tool.name
      : typeof tool?.metadata?.name === "string"
        ? tool.metadata.name
        : ""))
    .filter(Boolean);
}

function evaluateGroundingAnswer(answer: string, grounding: EvaluationCase["expectedGrounding"]): boolean {
  if (grounding.requiredSources.length === 0) {
    return true;
  }
  const lowered = answer.toLowerCase();
  const requiredOk = grounding.requiredSources.every((source) => {
    const normalized = source.toLowerCase();
    return lowered.includes(normalized);
  });
  if (!requiredOk) {
    return false;
  }
  const forbiddenTerms = grounding.forbiddenTerms ?? [];
  return !forbiddenTerms.some((term) => lowered.includes(term.toLowerCase()));
}

export async function evaluateCase(
  evaluationCase: EvaluationCase,
  runner: SpecialistRunner = defaultFakeRunner,
): Promise<EvaluationResult> {
  const failures: string[] = [];

  const intent = routeIntent(evaluationCase.prompt);
  const intentCorrect = intent.type === evaluationCase.expectedIntent;
  if (!intentCorrect) {
    failures.push(`Expected intent ${evaluationCase.expectedIntent} but got ${intent.type}`);
  }

  const context = createAgentContext({
    userId: "user-1",
    organizationId: "org-123",
    requestId: "req-eval",
    sessionId: "session-eval",
    authenticatedAt: new Date().toISOString(),
  });

  const previousRunner = setSpecialistAgentRunner(async (agent, input, context) => runner(agent, input, context));

  try {
    const flow = await executeSpecialistFlow(intent, context, evaluationCase.prompt);
    const actualSpecialists = flow.selectedSpecialists;
    const expectedSpecialists = evaluationCase.expectedSpecialists;

    const specialistsCorrect =
      actualSpecialists.length === expectedSpecialists.length &&
      expectedSpecialists.every((specialist) => actualSpecialists.includes(specialist));

    if (!specialistsCorrect) {
      failures.push(
        `Expected specialists ${expectedSpecialists.join(", ") || "none"}, got ${actualSpecialists.join(", ") || "none"}`,
      );
    }

    const toolNames = actualSpecialists.flatMap((specialist) => normalizeTools(specialistAgentMap[specialist]));
    const expectedToolSet = new Set(evaluationCase.expectedTools);
    const missingTools = [...expectedToolSet].filter((tool) => !toolNames.includes(tool));
    const extraTools = toolNames.filter((tool) => !expectedToolSet.has(tool));
    const toolsCorrect = missingTools.length === 0 && extraTools.length === 0;

    if (!toolsCorrect) {
      failures.push(
        `Tool mismatch: missing=${missingTools.join(",") || "none"}; extra=${extraTools.join(",") || "none"}`,
      );
    }

    const synthesized = synthesizeGroundedResponse(intent, flow.results);
    const groundingPassed = evaluateGroundingAnswer(synthesized.answer, evaluationCase.expectedGrounding);
    if (!groundingPassed) {
      failures.push("Grounding check failed: required source evidence or forbidden terms mismatch in the synthesized answer");
    }

    const expectedLimitations = evaluationCase.expectedLimitations;
    const limitationsPassed =
      expectedLimitations.length === 0 ||
      expectedLimitations.every((limit) =>
        synthesized.limitations.some((item) => String(item).toLowerCase().includes(limit.toLowerCase())),
      );

    if (!limitationsPassed) {
      failures.push(
        `Expected limitations ${expectedLimitations.join(", ") || "none"}, got ${synthesized.limitations.join(", ") || "none"}`,
      );
    }

    const policyPassed = evaluationCase.expectedPolicyOutcome === "READ_ONLY" && actualSpecialists.length <= MAX_SPECIALIST_EXECUTIONS && actualSpecialists.every((specialist) => specialist in specialistAgentMap);
    if (!policyPassed) {
      failures.push(`Policy check failed: expected ${evaluationCase.expectedPolicyOutcome} with fixed allowlist only`);
    }

    const safetyPassed =
      evaluationCase.expectedSafety === "safe"
        ? actualSpecialists.length <= MAX_SPECIALIST_EXECUTIONS && actualSpecialists.length === expectedSpecialists.length
        : actualSpecialists.length > MAX_SPECIALIST_EXECUTIONS;

    if (!safetyPassed) {
      failures.push("Safety check failed: execution safety contract violated");
    }

    return {
      caseId: evaluationCase.caseId,
      passed: failures.length === 0,
      intentCorrect,
      specialistsCorrect,
      toolsCorrect,
      groundingPassed,
      limitationsPassed,
      policyPassed,
      safetyPassed,
      failures,
    };
  } finally {
    setSpecialistAgentRunner(previousRunner);
  }
}

export async function evaluateSuite(
  cases: EvaluationCase[],
  runner: SpecialistRunner = defaultFakeRunner,
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  for (const evaluationCase of cases) {
    results.push(await evaluateCase(evaluationCase, runner));
  }
  return results;
}
