import { FormEvent, useState } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "@/routeTree.gen";
import { supabase } from "@/integrations/supabase/client";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!supabase) {
      setError("Authentication is unavailable in this environment.");
      return;
    }
    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (signInError) {
      setError("Sign-in failed. Check your email and password.");
      return;
    }
    await navigate({ to: "/dashboard" });
  }

  return (
    <main>
      <h1>Smart Stock Savvy</h1>
      <h2>Sign in</h2>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
