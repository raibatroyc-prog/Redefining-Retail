import { describe, expect, it } from "vitest";
import { requestReadOnlyApi } from "../frontend/src/lib/api-client";
import { resolveOrganizationSelection } from "../frontend/src/hooks/use-current-org";

describe("phase 5.1 authenticated shell contracts", () => {
  it("uses the session token and organization routing hint for read-only API requests", async () => {
    let request: Request | undefined;
    const payload = await requestReadOnlyApi<{ data: string }>("/api/me", "org-1", {
      getSession: async () => ({
        data: { session: { access_token: "session-token" } },
        error: null,
      }),
      fetch: async (input, init) => {
        request = new Request(`http://localhost${input}`, init);
        return Response.json({ data: "ok" });
      },
    });

    expect(payload.data).toBe("ok");
    expect(request?.method).toBe("GET");
    expect(request?.headers.get("authorization")).toBe("Bearer session-token");
    expect(request?.headers.get("x-org-id")).toBe("org-1");
    expect(new URL(request?.url ?? "http://localhost").searchParams.get("organizationId")).toBe("org-1");
  });

  it("does not send a request without a session token", async () => {
    await expect(requestReadOnlyApi("/api/me", "org-1", {
      getSession: async () => ({ data: { session: null }, error: null }),
      fetch: async () => {
        throw new Error("fetch should not be called");
      },
    })).rejects.toMatchObject({ code: "unauthorized", status: 401 });
  });

  it("normalizes backend errors and malformed responses", async () => {
    await expect(requestReadOnlyApi("/api/inventory", "org-1", {
      getSession: async () => ({
        data: { session: { access_token: "session-token" } },
        error: null,
      }),
      fetch: async () => Response.json(
        { error: { code: "forbidden", message: "Forbidden" } },
        { status: 403 },
      ),
    })).rejects.toMatchObject({ code: "forbidden", status: 403 });

    await expect(requestReadOnlyApi("/api/inventory", "org-1", {
      getSession: async () => ({
        data: { session: { access_token: "session-token" } },
        error: null,
      }),
      fetch: async () => new Response("not-json", { status: 200 }),
    })).rejects.toMatchObject({ code: "unexpected_response" });
  });

  it("selects only an organization returned for the authenticated user", () => {
    expect(resolveOrganizationSelection({
      userId: "user-1",
      organizationIds: ["org-1", "org-2"],
      preferredOrganizationId: "org-2",
    })).toBe("org-2");
    expect(resolveOrganizationSelection({
      userId: "user-1",
      organizationIds: ["org-1"],
      preferredOrganizationId: "org-other",
    })).toBe("org-1");
    expect(resolveOrganizationSelection({
      userId: "user-1",
      organizationIds: [],
    })).toBeNull();
  });
});
