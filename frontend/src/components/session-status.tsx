import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export function SessionStatus() {
  const navigate = useNavigate();
  const { session } = useSession();

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    await navigate({ to: "/login" });
  }

  if (!session) return null;

  return (
    <div>
      <span>{session.user.email ?? "Signed in"}</span>{" "}
      <button type="button" onClick={() => void handleSignOut()}>Sign out</button>
    </div>
  );
}
