import { useCallback, useEffect, useRef, useState } from "react";
import {
  queryAgent,
  type AgentApiError,
  type AgentResponse,
} from "@/lib/agent-api";

export type AgentQueryStatus = "idle" | "pending" | "success" | "error";

export function useAgentQuery(organizationId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<AgentQueryStatus>("idle");
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<AgentApiError | null>(null);
  const pendingRef = useRef(false);

  const reset = useCallback(() => {
    pendingRef.current = false;
    setStatus("idle");
    setResponse(null);
    setError(null);
  }, []);

  useEffect(() => {
    reset();
  }, [organizationId, reset]);

  const submit = useCallback(async (message: string) => {
    if (pendingRef.current || !enabled || !organizationId) {
      return;
    }

    pendingRef.current = true;
    setStatus("pending");
    setResponse(null);
    setError(null);
    try {
      const result = await queryAgent(message, organizationId);
      setResponse(result);
      setStatus("success");
      return result;
    } catch (caughtError) {
      const nextError = caughtError as AgentApiError;
      setError(nextError);
      setStatus("error");
      return undefined;
    } finally {
      pendingRef.current = false;
    }
  }, [enabled, organizationId]);

  return {
    status,
    response,
    limitations: response?.limitations ?? [],
    error,
    isPending: status === "pending",
    submit,
    reset,
  };
}
