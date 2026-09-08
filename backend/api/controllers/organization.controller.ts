import { authorizeOrganizationAccess, requireAuthentication } from "../auth";
import { ApiError } from "../request-context";

export async function organizationController(request: Request): Promise<Response> {
  const auth = await requireAuthentication(request);
  const url = new URL(request.url);
  const organizationId = url.pathname.split("/api/organizations/")[1]?.split("/")[0] ?? null;

  if (!organizationId) {
    throw new ApiError("Organization ID is required", 400, { code: "missing_organization_id" });
  }

  await authorizeOrganizationAccess({
    request,
    userId: auth.userId,
    supabase: auth.supabase,
    organizationId,
  });

  return new Response(
    JSON.stringify({
      organizationId,
      userId: auth.userId,
      authorized: true,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}
