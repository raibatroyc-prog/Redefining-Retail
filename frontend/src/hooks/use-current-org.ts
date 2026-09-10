import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CurrentOrgState {
  userId: string | null;
  organizationIds: string[];
  organizations: Array<{ id: string; name: string; role: string }>;
  organizationId: string | null;
  isAuthenticated: boolean;
}

export function removeOrganizationScopedQueries(queryClient: QueryClient, organizationId: string): void {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[1] === organizationId,
  });
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
  const queryClient = useQueryClient();
  const [isSwitchingOrganization, setIsSwitchingOrganization] = useState(false);
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
          organizations: [],
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
          organizations: [],
          organizationId: null,
          isAuthenticated: false,
        };
      }

      const [membershipsResult, profileResult] = await Promise.all([
        supabase.from("org_members").select("org_id, role").eq("user_id", userId),
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
      const organizationDetails = await supabase
        .from("organizations")
        .select("id, name")
        .in("id", organizationIds);

      if (organizationDetails.error) {
        throw organizationDetails.error;
      }

      const organizations = (membershipsResult.data ?? []).map((membership) => ({
        id: membership.org_id,
        name: organizationDetails.data?.find((organization) => organization.id === membership.org_id)?.name
          ?? membership.org_id,
        role: membership.role,
      }));

      const organizationId = resolveOrganizationSelection({
        userId,
        organizationIds,
        preferredOrganizationId: profileResult.data?.current_org_id ?? null,
      });
      return {
        userId,
        organizationIds: [...new Set(organizationIds)],
        organizations,
        organizationId,
        isAuthenticated: true,
      };
    },
  });

  return {
    userId: query.data?.userId ?? null,
    organizationId: isSwitchingOrganization ? null : query.data?.organizationId ?? null,
    organizationIds: query.data?.organizationIds ?? [],
    organizations: query.data?.organizations ?? [],
    isAuthenticated: query.data?.isAuthenticated ?? false,
    isLoading: query.isLoading,
    isSwitchingOrganization,
    error: query.error instanceof Error ? query.error : null,
    selectOrganization: async (nextOrganizationId: string) => {
      if (!supabase || !query.data?.userId || !query.data.organizationIds.includes(nextOrganizationId)) {
        return false;
      }
      const previousOrganizationId = query.data.organizationId;
      setIsSwitchingOrganization(true);
      if (previousOrganizationId) {
        removeOrganizationScopedQueries(queryClient, previousOrganizationId);
      }
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ current_org_id: nextOrganizationId })
          .eq("id", query.data.userId);
        if (error) throw error;
        const refreshed = await query.refetch();
        if (refreshed.error) {
          throw refreshed.error;
        }
        return true;
      } catch (error) {
        queryClient.setQueryData<CurrentOrgState>(["current-org"], (current) => (
          current ? { ...current, organizationId: null } : current
        ));
        throw error;
      } finally {
        setIsSwitchingOrganization(false);
      }
    },
  };
}
