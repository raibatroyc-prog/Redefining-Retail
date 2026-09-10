import { createClient } from "@supabase/supabase-js";
import { getServerConfig } from "../config";
import type { Database } from "../types/database.types";
import { ApiError } from "./request-context";

type SupabaseClientInstance = ReturnType<typeof createClient<Database>>;

export interface AuthenticatedSession {
  userId: string;
  claims: Record<string, unknown>;
  supabase: SupabaseClientInstance;
}

export async function requireAuthentication(
  request: Request,
): Promise<AuthenticatedSession> {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized", 401, { code: "unauthorized" });
  }

  const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    throw new ApiError("Unauthorized", 401, { code: "unauthorized" });
  }

  const config = getServerConfig();
  const supabase = createClient<Database>(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new ApiError("Unauthorized", 401, { code: "invalid_session" });
  }

  return {
    userId: String(data.claims.sub),
    claims: data.claims as Record<string, unknown>,
    supabase,
  };
}

export async function getOrganizationMemberships(
  userId: string,
  supabase: SupabaseClientInstance,
): Promise<Array<{ org_id: string; role: string }>> {
  const { data, error } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", userId);

  if (error) {
    throw new ApiError("Failed to resolve organization membership", 500, { code: "membership_lookup_failed" });
  }

  return (data ?? []) as Array<{ org_id: string; role: string }>;
}

export async function authorizeOrganizationAccess({
  request,
  userId,
  supabase,
  organizationId,
}: {
  request: Request;
  userId: string;
  supabase: SupabaseClientInstance;
  organizationId?: string | null;
}): Promise<string> {
  const requestedOrganizationId = organizationId ?? new URL(request.url).searchParams.get("organizationId");

  if (!requestedOrganizationId) {
    return "";
  }

  const { data, error } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .eq("org_id", requestedOrganizationId)
    .limit(1);

  if (error) {
    throw new ApiError("Failed to verify organization access", 500, { code: "organization_access_check_failed" });
  }

  if (!data || data.length === 0) {
    throw new ApiError("Forbidden", 403, { code: "forbidden" });
  }

  return requestedOrganizationId;
}
