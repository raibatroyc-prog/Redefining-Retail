import { describe, expect, it } from "vitest";
import { executeSpecialistFlow, MAX_SPECIALIST_EXECUTIONS, routeIntent, setSpecialistAgentRunner } from "../backend/agents/router";
import { evaluationCases, evaluateCase, evaluateSuite } from "../backend/agents/evaluation";
import { createAgentContext } from "../backend/agents/types";

const fakeRunner = async (agent: any, input: string, context: any) => ({
  finalOutput: {
    agentName: agent?.name ?? "unknown",
    input,
    organizationId: context?.organizationId,
    evidence: [{ source: agent?.name ?? "agent", note: "deterministic evidence used for grounding" }],
    limitations: [],
  },
});

describe("phase 4b.3 evaluation layer", () => {
  it("evaluates all representative cases successfully", async () => {
    const results = await evaluateSuite(evaluationCases, fakeRunner);
    expect(results.every((result) => result.passed)).toBe(true);
  });

  it("flags invalid evaluation expectations when routing is wrong", async () => {
    const result = await evaluateCase({
      ...evaluationCases[0],
      expectedIntent: "FORECAST",
      expectedSpecialists: ["forecast"],
      expectedTools: ["get_inventory_forecast"],
      expectedGrounding: { requiredSources: ["forecast"], forbiddenTerms: [] },
      expectedLimitations: [],
      expectedPolicyOutcome: "READ_ONLY",
      expectedSafety: "safe",
    }, fakeRunner);

    expect(result.intentCorrect).toBe(false);
    expect(result.passed).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);
  });

  it("keeps unknown requests at zero specialists and respects the execution cap", async () => {
    const previousRunner = setSpecialistAgentRunner(fakeRunner);
    try {
      const context = createAgentContext({
        userId: "user-1",
        organizationId: "org-123",
        requestId: "unknown-check",
      });

      const unknown = await executeSpecialistFlow(routeIntent("Write me a poem."), context, "Write me a poem.");
      expect(unknown.selectedSpecialists).toEqual([]);
      expect(Object.keys(unknown.results)).toHaveLength(0);

      const mixedIntent = routeIntent("Which products are at risk and which suppliers should we consider and what is the forecast?");
      const mixed = await executeSpecialistFlow(mixedIntent, context, "Which products are at risk and which suppliers should we consider and what is the forecast?");
      expect(mixed.selectedSpecialists.length).toBeLessThanOrEqual(MAX_SPECIALIST_EXECUTIONS);
      expect(mixed.selectedSpecialists).toEqual(["risk", "inventory", "supplier"]);
    } finally {
      setSpecialistAgentRunner(previousRunner);
    }
  });
});
