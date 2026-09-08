import { useState } from "react";
import {
  MAX_AGENT_MESSAGE_LENGTH,
  type AgentDecision,
} from "@/lib/agent-api";
import { useAgentQuery } from "@/hooks/use-agent-query";

interface AgentAssistantProps {
  organizationId: string | null;
  isAuthenticated: boolean;
}

function decisionLabel(decision: AgentDecision): string {
  if (decision.action === "blocked") return "Blocked";
  if (decision.action === "recommendation") return "Recommendation";
  return decision.action.replaceAll("_", " ");
}

export function AgentAssistant({ organizationId, isAuthenticated }: AgentAssistantProps) {
  const [message, setMessage] = useState("");
  const agent = useAgentQuery(organizationId, isAuthenticated && Boolean(organizationId));
  const canSubmit = Boolean(
    isAuthenticated &&
    organizationId &&
    message.trim() &&
    message.trim().length <= MAX_AGENT_MESSAGE_LENGTH &&
    !agent.isPending,
  );

  const validationMessage = message.length > MAX_AGENT_MESSAGE_LENGTH
    ? `Your question is ${message.length - MAX_AGENT_MESSAGE_LENGTH} characters over the limit.`
    : !message.trim() && message.length > 0
      ? "Enter a question before submitting."
      : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    await agent.submit(message);
    setMessage("");
  }

  return (
    <section aria-labelledby="agent-assistant-heading">
      <h2 id="agent-assistant-heading">Inventory assistant</h2>
      <p>
        Read-only guidance for the selected organization. No inventory or supplier records are changed.
        No purchase orders are created. Recommendations require human action.
      </p>
      <p>
        Organization: <strong>{organizationId ?? "Unavailable"}</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="agent-message">Ask about inventory, forecasts, suppliers, risk, or reports</label>
        <textarea
          id="agent-message"
          value={message}
          maxLength={MAX_AGENT_MESSAGE_LENGTH + 1}
          onChange={(event) => setMessage(event.target.value)}
          disabled={!isAuthenticated || !organizationId || agent.isPending}
          rows={4}
        />
        <p aria-live="polite">
          {message.length}/{MAX_AGENT_MESSAGE_LENGTH}
        </p>
        {validationMessage && <p role="alert">{validationMessage}</p>}
        <button type="submit" disabled={!canSubmit}>
          {agent.isPending ? "Checking..." : "Ask assistant"}
        </button>
      </form>

      {!isAuthenticated && <p role="alert">Sign in to use the assistant.</p>}
      {isAuthenticated && !organizationId && (
        <p role="alert">Select an organization to use the assistant.</p>
      )}
      {agent.error && (
        <p role="alert">
          {agent.error.message}
        </p>
      )}
      {agent.response && (
        <article aria-live="polite">
          <h3>Assistant response</h3>
          <p>{agent.response.answer}</p>
          {agent.response.decisions.length > 0 && (
            <div>
              <h4>Decisions</h4>
              {agent.response.decisions.map((decision, index) => (
                <section key={`${decision.action}-${index}`}>
                  <strong>{decisionLabel(decision)}</strong>
                  <p>{decision.reasoning}</p>
                </section>
              ))}
            </div>
          )}
          {agent.limitations.length > 0 && (
            <div>
              <h4>Limitations</h4>
              <ul>
                {agent.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
              </ul>
            </div>
          )}
          <small>Request ID: {agent.response.requestId}</small>
        </article>
      )}
    </section>
  );
}
