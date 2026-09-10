export interface AgentMemory {
  getSessionContext(sessionId: string): Record<string, unknown>;
  setSessionContext(sessionId: string, context: Record<string, unknown>): void;
  clearSession(sessionId: string): void;
}

export class InMemoryAgentMemory implements AgentMemory {
  private readonly sessions = new Map<string, Record<string, unknown>>();

  getSessionContext(sessionId: string): Record<string, unknown> {
    return { ...(this.sessions.get(sessionId) ?? {}) };
  }

  setSessionContext(sessionId: string, context: Record<string, unknown>): void {
    this.sessions.set(sessionId, { ...this.getSessionContext(sessionId), ...context });
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const agentMemory = new InMemoryAgentMemory();
