import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CurrentOrgState {
  userId: string | null;
  organizationIds: string[];
  organizationId: string | null;
  isAuthenticated: boolean;
}

export function resolveOrganizationSelection({
  userId,
  organizationIds,
  preferredOrganizationId,
}: {
  userId: string | null;
  organizationIds: string[];
  preferredOrganizationId?: string | null;
}): string | null {
  if (!userId || organizationIds.length === 0) {
    return null;
  }

  const uniqueOrganizationIds = [...new Set(organizationIds.filter(Boolean))];

  if (preferredOrganizationId && uniqueOrganizationIds.includes(preferredOrganizationId)) {
    return preferredOrganizationId;
  }

  return uniqueOrganizationIds[0] ?? null;
}

export function useCurrentOrg() {
  const query = useQuery<CurrentOrgState>({
    queryKey: ["current-org"],
    enabled: Boolean(supabase),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<CurrentOrgState> => {
      if (!supabase) {
        return {
          userId: null,
          organizationIds: [],
          organizationId: null,
          isAuthenticated: false,
        };
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const userId = session?.user?.id ?? null;
      if (!userId) {
        return {
          userId: null,
          organizationIds: [],
          organizationId: null,
          isAuthenticated: false,
        };
      }

      const [membershipsResult, profileResult] = await Promise.all([
        supabase.from("org_members").select("org_id").eq("user_id", userId),
        supabase.from("profiles").select("current_org_id").eq("id", userId).maybeSingle(),
      ]);

      if (membershipsResult.error) {
        throw membershipsResult.error;
      }

      if (profileResult.error) {
        throw profileResult.error;
      }

      const organizationIds = (membershipsResult.data ?? [])
        .map((membership) => membership.org_id)
        .filter(Boolean);

      const organizationId = resolveOrganizationSelection({
        userId,
        organizationIds,
        preferredOrganizationId: profileResult.data?.current_org_id ?? null,
      });

      return {
        userId,
        organizationIds: [...new Set(organizationIds)],
        organizationId,
        isAuthenticated: true,
      };
    },
  });

  return {
    userId: query.data?.userId ?? null,
    organizationId: query.data?.organizationId ?? null,
    organizationIds: query.data?.organizationIds ?? [],
    isAuthenticated: query.data?.isAuthenticated ?? false,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
  };
}
