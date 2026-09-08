import { describe, expect, it } from "vitest";
import { handleApiRequest } from "../backend/api/routes/index";
import { ApiError } from "../backend/api/request-context";
import { resolveOrganizationSelection } from "../frontend/src/hooks/use-current-org";
import { isPreviewAuthEnabled } from "../frontend/src/integrations/supabase/previewAuthStorage";

describe("organization context", () => {
  it("returns null when the user is unauthenticated or has no memberships", () => {
    expect(
      resolveOrganizationSelection({
        userId: null,
        organizationIds: [],
      }),
    ).toBeNull();

    expect(
      resolveOrganizationSelection({
        userId: "user-1",
        organizationIds: [],
      }),
    ).toBeNull();
  });

  it("prefers the current profile organization when it is a valid org membership", () => {
    expect(
      resolveOrganizationSelection({
        userId: "user-1",
        organizationIds: ["org-a", "org-b"],
        preferredOrganizationId: "org-b",
      }),
    ).toBe("org-b");
  });

  it("falls back to the first valid organization membership when the stored org is invalid", () => {
    expect(
      resolveOrganizationSelection({
        userId: "user-1",
        organizationIds: ["org-a", "org-b"],
        preferredOrganizationId: "org-c",
      }),
    ).toBe("org-a");
  });

  it("keeps organization selection within the user membership set", () => {
    expect(
      resolveOrganizationSelection({
        userId: "user-1",
        organizationIds: ["org-a"],
        preferredOrganizationId: "org-c",
      }),
    ).toBe("org-a");
  });
});

describe("preview auth helpers", () => {
  it("requires an explicit opt-in to enable preview auth in development", () => {
    expect(
      isPreviewAuthEnabled({
        DEV: true,
        VITE_ENABLE_PREVIEW_AUTH: "true",
      }),
    ).toBe(true);

    expect(
      isPreviewAuthEnabled({
        DEV: true,
        VITE_ENABLE_PREVIEW_AUTH: "false",
      }),
    ).toBe(false);

    expect(
      isPreviewAuthEnabled({
        DEV: false,
        VITE_ENABLE_PREVIEW_AUTH: "true",
      }),
    ).toBe(false);

    expect(
      isPreviewAuthEnabled({
        DEV: true,
      }),
    ).toBe(false);
  });
});

describe("server api foundation", () => {
  it("exposes a health endpoint without authentication", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/health"));
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.service).toBe("smart-stock-savvy");
  });

  it("rejects unauthenticated requests with 401", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/me"), {
      meController: async () => {
        throw new ApiError("Unauthorized", 401, { code: "unauthorized" });
      },
    });

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error.code).toBe("unauthorized");
  });

  it("accepts an authenticated user with memberships", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/me"), {
      meController: async () =>
        new Response(
          JSON.stringify({
            userId: "user-1",
            isAuthenticated: true,
            organizationMemberships: [{ organizationId: "org-1", role: "owner" }],
            currentOrganizationId: "org-1",
          }),
          { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
        ),
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.userId).toBe("user-1");
    expect(payload.currentOrganizationId).toBe("org-1");
  });

  it("rejects unauthorized organization access with 403", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/organizations/org-2"), {
      organizationController: async () => {
        throw new ApiError("Forbidden", 403, { code: "forbidden" });
      },
    });

    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error.code).toBe("forbidden");
  });

  it("does not expose secrets in API error responses", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/me"), {
      meController: async () => {
        throw new ApiError("Unauthorized", 401, { code: "unauthorized", secret: "SUPABASE_SERVICE_ROLE_KEY=top-secret" });
      },
    });

    const payload = await response.json();
    expect(payload.error.message).toBe("Unauthorized");
    expect(JSON.stringify(payload)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("routes inventory requests through the domain controller", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/inventory?organizationId=org-1"), {
      inventoryController: {
        list: async () => new Response(JSON.stringify({ ok: true, source: "inventory" }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        }),
      },
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.source).toBe("inventory");
  });

  it("routes supplier reports through their domain controller", async () => {
    const response = await handleApiRequest(new Request("http://localhost/api/reports/inventory-summary?organizationId=org-1"), {
      reportController: {
        inventorySummary: async () => new Response(JSON.stringify({ ok: true, source: "report" }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        }),
      },
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.source).toBe("report");
  });
});
