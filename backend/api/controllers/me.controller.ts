import { getOrganizationMemberships, requireAuthentication } from "../auth";
import { ApiError } from "../request-context";

export async function meController(request: Request): Promise<Response> {
  const auth = await requireAuthentication(request);
  const memberships = await getOrganizationMemberships(auth.userId, auth.supabase);

  const profileResult = await auth.supabase
    .from("profiles")
    .select("current_org_id")
    .eq("id", auth.userId)
    .maybeSingle();

  if (profileResult.error) {
    throw new ApiError("Failed to resolve authentication context", 500, { code: "profile_lookup_failed" });
  }

  return new Response(
    JSON.stringify({
      userId: auth.userId,
      isAuthenticated: true,
      organizationMemberships: memberships.map((membership) => ({
        organizationId: membership.org_id,
        role: membership.role,
      })),
      currentOrganizationId: profileResult.data?.current_org_id ?? null,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}
