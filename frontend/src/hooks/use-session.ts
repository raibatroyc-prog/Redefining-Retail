import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["session"],
    enabled: Boolean(supabase),
    retry: false,
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      void queryClient.invalidateQueries({ queryKey: ["current-org"] });
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return {
    session: query.data ?? null,
    isAuthenticated: Boolean(query.data?.access_token),
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
  };
}
