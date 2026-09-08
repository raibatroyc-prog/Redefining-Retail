import type { AgentActionCategory } from "../types";

export const AGENT_ACTION_POLICY: Record<
  AgentActionCategory,
  { allowed: boolean; description: string }
> = {
  READ_ONLY: {
    allowed: true,
    description: "Read-only analytical access is allowed for approved inventory and reporting work.",
  },
  RECOMMENDATION: {
    allowed: true,
    description: "Recommendations are allowed as proposals only; no direct business mutation is permitted.",
  },
  MUTATION: {
    allowed: false,
    description: "Direct data mutation is blocked for Phase 4A.",
  },
  EXTERNAL_COMMUNICATION: {
    allowed: false,
    description: "External communication is blocked for Phase 4A.",
  },
  DESTRUCTIVE: {
    allowed: false,
    description: "Destructive actions are blocked for Phase 4A.",
  },
};

export function isActionAllowed(category: AgentActionCategory): boolean {
  return AGENT_ACTION_POLICY[category]?.allowed === true;
}

export function assertActionAllowed(category: AgentActionCategory): void {
  if (!isActionAllowed(category)) {
    throw new Error(`Action category ${category} is blocked by the Phase 4A policy.`);
  }
}
