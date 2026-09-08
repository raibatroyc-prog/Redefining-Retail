import { createRoute, Outlet, redirect } from "@tanstack/react-router";
import { rootRoute } from "@/routeTree.gen";
import { AppShell } from "@/components/app-shell";
import { LoadingState } from "@/components/loading-state";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: async () => {
    if (!supabase) {
      throw redirect({ to: "/login" });
    }
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isLoading } = useSession();
  if (isLoading) {
    return <LoadingState label="Checking your session..." />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
