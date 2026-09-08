import type { AgentActionCategory } from "../types";
import type { AgentIntentType, SpecialistType } from "../router";

export interface GroundingExpectation {
  requiredSources: string[];
  forbiddenTerms?: string[];
}

export interface EvaluationCase {
  caseId: string;
  description: string;
  prompt: string;
  expectedIntent: AgentIntentType;
  expectedSpecialists: SpecialistType[];
  expectedTools: string[];
  expectedGrounding: GroundingExpectation;
  expectedLimitations: string[];
  expectedPolicyOutcome: AgentActionCategory;
  expectedSafety: "safe" | "unsafe";
}

export interface EvaluationResult {
  caseId: string;
  passed: boolean;
  intentCorrect: boolean;
  specialistsCorrect: boolean;
  toolsCorrect: boolean;
  groundingPassed: boolean;
  limitationsPassed: boolean;
  policyPassed: boolean;
  safetyPassed: boolean;
  failures: string[];
}
