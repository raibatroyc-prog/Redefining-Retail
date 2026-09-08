import { authorizeOrganizationAccess, requireAuthentication } from "../auth";
import { ApiError } from "../request-context";
import { getInventorySummary } from "../../services/report.service";
import { isValidUuid } from "../validation";

export interface ReportControllerDependencies {
  getInventorySummaryReport?: typeof getInventorySummary;
}

function getRequestedOrganizationId(request: Request): string | null {
  const header = request.headers.get("x-org-id") ?? request.headers.get("x-organization-id");
  if (header) return header;

  const query = new URL(request.url).searchParams;
  return query.get("organizationId") ?? query.get("orgId") ?? null;
}

export function createReportController(deps: ReportControllerDependencies = {}) {
  const getInventorySummaryFn = deps.getInventorySummaryReport ?? getInventorySummary;

  return {
    async inventorySummary(request: Request): Promise<Response> {
      const auth = await requireAuthentication(request);
      const organizationId = getRequestedOrganizationId(request);
      if (!organizationId) {
        throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
      }
      if (!isValidUuid(organizationId)) {
        throw new ApiError("Organization ID is not valid", 400, { code: "invalid_organization_id" });
      }

      const resolvedOrgId = await authorizeOrganizationAccess({
        request,
        userId: auth.userId,
        supabase: auth.supabase,
        organizationId,
      });

      const summary = await getInventorySummaryFn(resolvedOrgId);
      return new Response(
        JSON.stringify({ data: summary, meta: { organizationId: resolvedOrgId } }),
        { status: 200, headers: { "content-type": "application/json; charset=utf-8" } },
      );
    },
  };
}

export const reportController = createReportController();
