import { describe, expect, it } from "vitest";
import {
  MAX_AGENT_MESSAGE_LENGTH,
  AgentApiError,
  queryAgent,
} from "../frontend/src/lib/agent-api";

function dependencies(fetchImpl: typeof fetch = async () => new Response()) {
  return {
    getSession: async () => ({
      data: { session: { access_token: "session-token" } },
      error: null,
    }),
    fetch: fetchImpl,
  };
}

describe("agent API client", () => {
  it("posts only the message with auth and organization headers", async () => {
    let request: Request | undefined;
    const result = await queryAgent("Which products are low on stock?", "org-1", {
      ...dependencies(async (input, init) => {
        request = new Request(`http://localhost${input}`, init);
        return Response.json({
          data: {
            answer: "Review the low-stock products.",
            decisions: [],
            limitations: [],
            requiresApproval: false,
            requestId: "request-1",
            organizationId: "org-1",
            generatedAt: new Date().toISOString(),
          },
        });
      }),
    });

    expect(result.answer).toContain("low-stock");
    expect(request?.method).toBe("POST");
    expect(request?.headers.get("authorization")).toBe("Bearer session-token");
    expect(request?.headers.get("x-org-id")).toBe("org-1");
    expect(await request?.json()).toEqual({ message: "Which products are low on stock?" });
  });

  it("rejects empty and oversized messages before making a request", async () => {
    const fetchImpl = async () => {
      throw new Error("fetch should not be called");
    };
    await expect(queryAgent("   ", "org-1", dependencies(fetchImpl))).rejects.toMatchObject({
      code: "missing_message",
    });
    await expect(queryAgent("x".repeat(MAX_AGENT_MESSAGE_LENGTH + 1), "org-1", dependencies(fetchImpl)))
      .rejects.toMatchObject({ code: "message_too_large" });
  });

  it("requires a current session and access token", async () => {
    await expect(queryAgent("Show inventory.", "org-1", {
      ...dependencies(),
      getSession: async () => ({ data: { session: null }, error: null }),
    })).rejects.toMatchObject({ code: "unauthorized" });
    await expect(queryAgent("Show inventory.", "org-1", {
      ...dependencies(),
      getSession: async () => ({ data: { session: null }, error: new Error("expired") }),
    })).rejects.toMatchObject({ code: "session_error" });
  });

  it("parses backend errors without exposing raw payloads", async () => {
    await expect(queryAgent("Send an email.", "org-1", {
      ...dependencies(async () => Response.json(
        { error: { code: "unsupported_request", message: "Unsupported request." } },
        { status: 400 },
      )),
    })).rejects.toMatchObject({
      code: "unsupported_request",
      message: "Unsupported request.",
      status: 400,
    });
  });

  it("treats non-JSON and incomplete responses as errors", async () => {
    await expect(queryAgent("Show risk.", "org-1", {
      ...dependencies(async () => new Response("not-json", { status: 200 })),
    })).rejects.toMatchObject({ code: "unexpected_response" });
    await expect(queryAgent("Show risk.", "org-1", {
      ...dependencies(async () => Response.json({ data: { answer: 42 } })),
    })).rejects.toMatchObject({ code: "unexpected_response" });
  });

  it("does not add privileged context or browser-side secrets", async () => {
    let body = "";
    let headers: Headers | undefined;
    await queryAgent("Show inventory.", "org-1", {
      ...dependencies(async (input, init) => {
        headers = new Headers(init?.headers);
        body = String(init?.body);
        return Response.json({ data: {
          answer: "Inventory.",
          decisions: [],
          limitations: [],
          requiresApproval: false,
          requestId: "request-2",
          organizationId: "org-1",
          generatedAt: new Date().toISOString(),
        } });
      }),
    });
    expect(body).not.toContain("userId");
    expect(body).not.toContain("specialist");
    expect(body).not.toContain("tool");
    expect(body).not.toContain("OPENAI_API_KEY");
    expect(body).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(headers?.get("openai-api-key")).toBeNull();
    expect(headers?.get("supabase-service-role-key")).toBeNull();
  });

  it("uses the typed client error for local failures", () => {
    expect(new AgentApiError({ code: "test", message: "Test", status: 400 })).toBeInstanceOf(Error);
  });
});
