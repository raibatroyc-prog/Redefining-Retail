# Redefining Retail — Frontend Code
Frontend of the Smart Inventory & Expiry Management System: React 19, TanStack Start / Router / Query, Tailwind CSS v4, shadcn/ui, Recharts.
> The 48 unmodified shadcn/ui primitives in `src/components/ui/` and generated files (`routeTree.gen.ts`) are omitted.

---

## 1. App config, design tokens & router

### `package.json`

```json
{
  "name": "tanstack_start_ts",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@lovable.dev/cloud-auth-js": "^1.1.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@supabase/supabase-js": "^2.110.1",
    "@tailwindcss/vite": "^4.2.1",
    "@tanstack/react-query": "^5.101.1",
    "@tanstack/react-router": "^1.170.16",
    "@tanstack/react-start": "^1.168.26",
    "@tanstack/router-plugin": "^1.168.18",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.575.0",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.71.2",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "vite-tsconfig-paths": "^6.0.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@lovable.dev/vite-tanstack-config": "2.13.1",
    "@types/node": "^22.16.5",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.2.0",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "nitro": "3.0.260603-beta",
    "prettier": "^3.7.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.56.1",
    "vite": "^8.0.16"
  }
}
```

### `vite.config.ts`

```ts
// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
```

### `tsconfig.json`

```json
{
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts", "eslint.config.js"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],

    /* Bundler mode */
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "noEmit": true,

    /* Linting */
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/styles.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

### `src/styles.css`

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-brand-dark: var(--brand-dark);
  --color-neon: var(--neon);
  --color-neon-foreground: var(--neon-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-warning-soft: var(--warning-soft);
  --color-critical: var(--critical);
  --color-critical-foreground: var(--critical-foreground);
  --color-critical-soft: var(--critical-soft);
  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-panel: var(--panel);
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* Futuristic dark-neon theme — default */
:root {
  --radius: 0.75rem;

  --background: oklch(0.14 0.03 275);
  --foreground: oklch(0.97 0.01 275);

  --panel: oklch(0.18 0.04 278);
  --card: oklch(0.18 0.04 278);
  --card-foreground: oklch(0.97 0.01 275);
  --popover: oklch(0.18 0.04 278);
  --popover-foreground: oklch(0.97 0.01 275);

  --primary: oklch(0.22 0.06 285);
  --primary-foreground: oklch(0.98 0.01 275);

  --secondary: oklch(0.24 0.05 285);
  --secondary-foreground: oklch(0.97 0.01 275);

  --muted: oklch(0.24 0.04 282);
  --muted-foreground: oklch(0.72 0.03 275);

  --accent: oklch(0.28 0.08 300);
  --accent-foreground: oklch(0.98 0.01 275);

  --destructive: oklch(0.65 0.24 20);
  --destructive-foreground: oklch(0.99 0.005 275);

  --border: oklch(0.32 0.05 285 / 60%);
  --input: oklch(0.24 0.05 285);
  --ring: oklch(0.72 0.19 305);

  /* Brand — electric violet / magenta */
  --brand: oklch(0.68 0.22 305);
  --brand-foreground: oklch(0.14 0.03 275);
  --brand-dark: oklch(0.48 0.22 300);

  /* Neon accent — cyan */
  --neon: oklch(0.82 0.17 200);
  --neon-foreground: oklch(0.14 0.03 275);

  --warning: oklch(0.82 0.18 80);
  --warning-foreground: oklch(0.18 0.05 70);
  --warning-soft: oklch(0.32 0.09 80 / 55%);

  --critical: oklch(0.7 0.24 20);
  --critical-foreground: oklch(0.14 0.03 275);
  --critical-soft: oklch(0.35 0.14 20 / 45%);

  --success: oklch(0.78 0.19 155);
  --success-soft: oklch(0.32 0.12 160 / 45%);

  --gradient-brand: linear-gradient(135deg, oklch(0.7 0.22 305), oklch(0.75 0.18 240), oklch(0.82 0.17 200));
  --gradient-panel: linear-gradient(180deg, oklch(0.2 0.05 282 / 0.9), oklch(0.16 0.04 278 / 0.9));
  --shadow-neon: 0 0 0 1px oklch(0.72 0.22 305 / 0.4), 0 12px 40px -8px oklch(0.72 0.22 305 / 0.45);

  --sidebar: oklch(0.16 0.04 278);
  --sidebar-foreground: oklch(0.97 0.01 275);
  --sidebar-primary: oklch(0.68 0.22 305);
  --sidebar-primary-foreground: oklch(0.14 0.03 275);
  --sidebar-accent: oklch(0.24 0.05 285);
  --sidebar-accent-foreground: oklch(0.97 0.01 275);
  --sidebar-border: oklch(0.32 0.05 285 / 60%);
  --sidebar-ring: oklch(0.72 0.19 305);

  --chart-1: oklch(0.72 0.22 305);
  --chart-2: oklch(0.82 0.17 200);
  --chart-3: oklch(0.82 0.18 80);
  --chart-4: oklch(0.7 0.24 20);
  --chart-5: oklch(0.75 0.18 240);
}

@layer base {
  * {
    border-color: var(--color-border);
  }
  html, body {
    background-color: var(--color-background);
    color: var(--color-foreground);
  }
  body {
    font-family: var(--font-sans);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    -webkit-font-smoothing: antialiased;
    background-image:
      radial-gradient(ellipse 900px 500px at 12% -10%, oklch(0.68 0.22 305 / 0.18), transparent 60%),
      radial-gradient(ellipse 800px 500px at 100% 0%, oklch(0.82 0.17 200 / 0.14), transparent 60%),
      radial-gradient(ellipse 600px 400px at 50% 110%, oklch(0.75 0.18 240 / 0.14), transparent 60%);
    background-attachment: fixed;
  }
}

@utility tabular {
  font-variant-numeric: tabular-nums;
}

@utility input {
  display: block;
  width: 100%;
  height: 2.5rem;
  border-radius: calc(var(--radius) - 2px);
  border: 1px solid var(--color-border);
  background-color: color-mix(in oklab, var(--color-background) 70%, transparent);
  color: var(--color-foreground);
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}
@utility input {
  &:focus {
    border-color: color-mix(in oklab, var(--color-brand) 65%, transparent);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-brand) 22%, transparent);
    background-color: color-mix(in oklab, var(--color-background) 85%, transparent);
  }
}

@utility gradient-text {
  background: var(--gradient-brand);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

@utility glass {
  background: linear-gradient(180deg, oklch(0.2 0.05 282 / 0.65), oklch(0.16 0.04 278 / 0.55));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--color-border);
}

@utility glow-brand {
  box-shadow: 0 8px 30px -8px oklch(0.72 0.22 305 / 0.55);
}
```

### `src/router.tsx`

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
```

---

## 2. Supabase browser client

### `src/integrations/supabase/client.ts`

```ts
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}


function createSupabaseClient() {
  // Use import.meta.env for client-side (Vite build-time replacement)
  // Fall back to process.env for SSR (server-side rendering)
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
    },
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
```

---

## 3. Routes (pages)

### `src/routes/__root.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Redefining Retail — Smarter Today. Stronger Tomorrow." },
      { name: "description", content: "Redefining Retail is the AI-powered command center for modern stores — live inventory, demand forecasting, expiry alerts, and one-click supplier reordering." },
      { property: "og:title", content: "Redefining Retail — Smarter Today. Stronger Tomorrow." },
      { property: "og:description", content: "AI-powered retail intelligence: innovate, optimize, transform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    import("@/integrations/supabase/client").then(({ supabase }) => {
      if (cancelled) return;
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      unsub = () => sub.subscription.unsubscribe();
    });
    let unsub: (() => void) | undefined;
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
```

### `src/routes/auth.tsx`

```tsx
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Boxes, Loader2 } from "lucide-react";
import logoAsset from "@/assets/redefining-retail-logo.jpeg.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Redefining Retail" },
      { name: "description", content: "Sign in to your Redefining Retail command center." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/" });
    });
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // create org
        if (data.session && company.trim()) {
          const { error: rpcErr } = await supabase.rpc("create_organization", {
            _name: company.trim(),
          });
          if (rpcErr) throw rpcErr;
        }
        nav({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (r.error) setError(r.error.message ?? "Google sign-in failed");
    else if (!r.redirected) nav({ to: "/" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      {/* Left — brand */}
      <div className="hidden lg:flex bg-gradient-to-br from-primary via-primary to-brand-dark text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-96 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="size-11 rounded-md bg-black grid place-items-center overflow-hidden ring-1 ring-white/10">
            <img src={logoAsset.url} alt="Redefining Retail" className="size-11 object-cover" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Redefining Retail</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60">Innovate · Optimize · Transform</p>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Smarter today.<br />Stronger tomorrow.
          </h1>
          <p className="text-primary-foreground/70 leading-relaxed max-w-md">
            The command center behind modern stores. Predict demand, prevent stockouts, cut waste — one dashboard for every SKU, every supplier, every location.
          </p>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            {[
              "Live inventory across every aisle",
              "AI reorder recommendations",
              "Expiry & waste prevention",
              "One-click supplier orders",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/50">
          Trusted by grocery, pharmacy & big-box retail teams.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="size-8 rounded-md bg-black grid place-items-center overflow-hidden ring-1 ring-border">
              <img src={logoAsset.url} alt="Redefining Retail" className="size-8 object-cover" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Redefining Retail</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in to your dashboard" : "Create your company account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "signin"
              ? "Welcome back — pick up where your team left off."
              : "Spin up a new Redefining Retail workspace in under a minute."}
          </p>

          <button
            onClick={onGoogle}
            className="mt-6 w-full h-11 rounded-md border border-border bg-background hover:bg-muted transition flex items-center justify-center gap-2 text-sm font-medium"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> or with email <span className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Your name">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Marcus Reynolds"
                  />
                </Field>
                <Field label="Company / store name">
                  <input
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="input"
                    placeholder="Reynolds Supercenter"
                  />
                </Field>
              </>
            )}
            <Field label="Work email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@company.com"
              />
            </Field>
            <Field label="Password">
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="At least 8 characters"
              />
            </Field>

            {error && (
              <p className="text-xs text-critical bg-critical-soft rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-md bg-brand text-brand-foreground text-sm font-semibold hover:bg-brand-dark transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "signin" ? (
              <>
                New to Redefining Retail?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-brand font-medium hover:underline"
                >
                  Create a company account
                </button>
              </>
            ) : (
              <>
                Already have one?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-brand font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="mt-8 text-[11px] text-muted-foreground text-center">
            <Link to="/" className="hover:underline">
              <Boxes className="size-3 inline mr-1" /> Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
```

### `src/routes/_authenticated/route.tsx`

```tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
```

### `src/routes/_authenticated/index.tsx`

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { KpiTile, Panel, StockBar } from "@/components/ui-parts";
import {
  Boxes,
  AlertTriangle,
  Clock,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Zap,
  Leaf,
  Loader2,
  PackagePlus,
  Building2,
  ShieldCheck,
  Rocket,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";
import { statusOf, hoursUntil, buildRecommendations, demandForecast } from "@/lib/inventory-data";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import logoAsset from "@/assets/redefining-retail-logo.jpeg.asset.json";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Overview — Redefining Retail" },
      { name: "description", content: "Real-time inventory health and AI demand forecasts." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: org, isLoading: orgLoading } = useCurrentOrg();
  const { data: products = [], isLoading } = useProducts(org?.id);

  if (orgLoading || (!org && !orgLoading)) return <NoOrg loading={orgLoading} />;

  if (isLoading) {
    return (
      <AppShell title="Store Health Overview">
        <div className="grid place-items-center h-96 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (products.length === 0) return <EmptyOrg orgId={org!.id} />;

  const criticalExpiry = products
    .map((p) => ({ ...p, hrs: hoursUntil(p.expires_at) }))
    .filter((p) => p.hrs !== null && p.hrs <= 48)
    .sort((a, b) => (a.hrs ?? 0) - (b.hrs ?? 0))
    .slice(0, 4);

  const lowStock = products
    .filter((p) => statusOf(p) === "low" || statusOf(p) === "critical")
    .slice(0, 4);

  const recs = buildRecommendations(products);
  const topRec = recs.filter((r) => r.urgency === "high").slice(0, 2);
  const expiringCount = products.filter(
    (p) => (hoursUntil(p.expires_at) ?? Infinity) <= 48,
  ).length;
  const lowCount = products.filter((p) => {
    const s = statusOf(p);
    return s === "low" || s === "critical";
  }).length;

  return (
    <AppShell
      title="Store Health Overview"
      subtitle={`${org?.name} · Live inventory intelligence`}
      actions={
        <Link
          to="/suppliers"
          className="h-9 px-4 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:bg-brand-dark transition-colors shadow-sm shadow-brand/20 inline-flex items-center gap-2"
        >
          Create Purchase Order
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            label="Active SKUs"
            value={products.length.toLocaleString()}
            delta="tracked live"
            icon={<Boxes className="size-4" />}
          />
          <KpiTile
            label="Low Stock"
            value={lowCount.toString()}
            delta="need refill"
            tone="warning"
            icon={<AlertTriangle className="size-4" />}
          />
          <KpiTile
            label="Expiring < 48h"
            value={expiringCount.toString()}
            delta="action required"
            tone="critical"
            icon={<Clock className="size-4" />}
          />
          <KpiTile
            label="AI Reorders"
            value={recs.length.toString()}
            delta="waiting for review"
            tone="brand"
            icon={<Leaf className="size-4" />}
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <Panel
            className="col-span-12 xl:col-span-8"
            title="Demand Forecast — 14 day window"
            right={
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-foreground" /> Actual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-brand" /> AI Predicted
                </span>
              </div>
            }
          >
            <div className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandForecast} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="predicted" stroke="var(--brand)" strokeWidth={2} fill="url(#predGrad)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="actual" stroke="var(--foreground)" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="col-span-12 xl:col-span-4 rounded-xl bg-gradient-to-br from-primary via-primary to-brand-dark text-primary-foreground p-6 flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-brand/30 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-4 text-brand" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">
                  AI Intelligence
                </span>
              </div>
              <h3 className="text-xl font-semibold leading-snug">
                Weekend surge predicted
              </h3>
              <p className="text-sm text-primary-foreground/70 mt-2 leading-relaxed">
                Storm watch + payday cycle → expect <span className="text-brand font-semibold">+22%</span> demand
                on canned goods, bread, and bottled water.
              </p>
            </div>
            <div className="relative z-10 h-24 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandForecast.slice(6)}>
                  <Line type="monotone" dataKey="predicted" stroke="var(--brand)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Link
              to="/recommendations"
              className="relative z-10 w-full h-10 rounded-md bg-background text-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-background/90 transition"
            >
              <Zap className="size-4" />
              Review AI reorders
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel
            title="Critical Expiry"
            right={
              <span className="text-[10px] font-semibold bg-critical-soft text-critical px-1.5 py-0.5 rounded uppercase tracking-wider">
                Action required
              </span>
            }
          >
            <ul className="divide-y divide-border">
              {criticalExpiry.length === 0 && (
                <li className="px-5 py-8 text-center text-xs text-muted-foreground">
                  Nothing expiring in the next 48h. Nice.
                </li>
              )}
              {criticalExpiry.map((p) => (
                <li key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.department} · Aisle {p.aisle}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-critical tabular">{p.stock} units</p>
                    <p className="text-[11px] text-muted-foreground">{p.hrs}h left</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              to="/alerts"
              className="border-t border-border px-5 py-3 flex items-center justify-between text-xs font-medium text-brand hover:bg-muted/50 transition"
            >
              View all expiry alerts <ArrowRight className="size-3.5" />
            </Link>
          </Panel>

          <Panel
            title="Low Stock"
            right={
              <span className="text-[10px] font-semibold bg-warning-soft text-warning px-1.5 py-0.5 rounded uppercase tracking-wider">
                Auto-refill on
              </span>
            }
          >
            <ul className="divide-y divide-border">
              {lowStock.length === 0 && (
                <li className="px-5 py-8 text-center text-xs text-muted-foreground">
                  All SKUs above threshold.
                </li>
              )}
              {lowStock.map((p) => (
                <li key={p.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {p.department} · Vel: {p.velocity}
                      </p>
                    </div>
                    <p className="text-xs tabular text-muted-foreground shrink-0 ml-3">
                      {p.stock}/{p.capacity}
                    </p>
                  </div>
                  <StockBar value={p.stock} capacity={p.capacity} />
                </li>
              ))}
            </ul>
            <Link
              to="/inventory"
              className="border-t border-border px-5 py-3 flex items-center justify-between text-xs font-medium text-brand hover:bg-muted/50 transition"
            >
              Open full inventory <ArrowRight className="size-3.5" />
            </Link>
          </Panel>

          <Panel title="Top AI Reorders" right={<TrendingDown className="size-4 text-muted-foreground" />}>
            <ul className="divide-y divide-border">
              {topRec.length === 0 && (
                <li className="px-5 py-8 text-center text-xs text-muted-foreground">
                  Model happy with current stock.
                </li>
              )}
              {topRec.map((r) => (
                <li key={r.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium leading-snug">{r.product.name}</p>
                    <span className="text-[10px] font-semibold bg-brand/10 text-brand px-1.5 py-0.5 rounded shrink-0">
                      {r.confidence}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{r.reason}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs">
                      <span className="tabular font-semibold">{r.quantity} units</span>
                      <span className="text-muted-foreground"> · ${r.estCost.toLocaleString()}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              to="/recommendations"
              className="border-t border-border px-5 py-3 flex items-center justify-between text-xs font-medium text-brand hover:bg-muted/50 transition"
            >
              View all recommendations <ArrowRight className="size-3.5" />
            </Link>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function NoOrg({ loading }: { loading: boolean }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc("create_organization", { _name: name.trim() });
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    // Refetch the current-org query so the app transitions into the workspace.
    await qc.invalidateQueries({ queryKey: ["current-org"] });
    // busy stays true — parent will unmount this component on refetch.
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 size-[520px] rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 size-[560px] rounded-full bg-primary/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.05fr_1fr] gap-0">
        {/* Left — pitch */}
        <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg grid place-items-center overflow-hidden ring-1 ring-brand/40 glow-brand" style={{ background: "var(--gradient-brand)" }}>
              <img src={logoAsset.url} alt="Redefining Retail" className="size-10 object-cover mix-blend-luminosity opacity-90" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight">Redefining Retail</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Retail intelligence
              </p>
            </div>
          </div>

          <div className="space-y-8 max-w-lg">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand backdrop-blur">
                <Sparkles className="size-3" /> Set up in 30 seconds
              </span>
              <h1 className="mt-5 text-4xl xl:text-5xl font-semibold leading-[1.05] tracking-tight">
                One workspace.
                <br />
                <span className="text-brand">Every SKU in sync.</span>
              </h1>
              <p className="mt-4 text-sm xl:text-base text-muted-foreground leading-relaxed">
                Predict demand, prevent stockouts, and cut waste — all from a single
                command center your entire team can trust.
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              {[
                { icon: Rocket, t: "Live inventory & realtime alerts" },
                { icon: Sparkles, t: "AI reorder recommendations" },
                { icon: ShieldCheck, t: "Isolated per company · enterprise RLS" },
              ].map(({ icon: I, t }) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="size-8 rounded-md bg-brand/10 text-brand grid place-items-center">
                    <I className="size-4" />
                  </span>
                  <span className="text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Trusted by grocery, pharmacy & big-box retail operators.
          </p>
        </div>

        {/* Right — form card */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border bg-panel/80 backdrop-blur-xl p-8 shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-3 lg:hidden mb-6">
                <div className="size-9 rounded-lg grid place-items-center overflow-hidden ring-1 ring-brand/40" style={{ background: "var(--gradient-brand)" }}>
                  <img src={logoAsset.url} alt="Redefining Retail" className="size-9 object-cover mix-blend-luminosity opacity-90" />
                </div>
                <span className="text-base font-semibold">Redefining Retail</span>
              </div>

              <div className="size-11 rounded-xl bg-brand/10 text-brand grid place-items-center mb-4">
                <Building2 className="size-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Create your workspace</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Name your store or company. You can rename it any time from settings.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  create();
                }}
                className="mt-6 space-y-4"
              >
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Workspace name
                  </span>
                  <input
                    autoFocus
                    className="input h-11 mt-1.5"
                    placeholder="Reynolds Supercenter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                {error && (
                  <p className="text-xs text-critical bg-critical-soft rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="w-full h-11 rounded-md bg-brand text-brand-foreground text-sm font-semibold shadow-lg shadow-brand/30 hover:bg-brand-dark transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {busy ? "Creating workspace…" : "Create workspace"}
                  {!busy && <ArrowRight className="size-4" />}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "SKUs", v: "Unlimited" },
                  { k: "Stores", v: "Multi-site" },
                  { k: "Uptime", v: "99.9%" },
                ].map((s) => (
                  <div key={s.k}>
                    <p className="text-sm font-semibold tabular">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      {s.k}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Your data is isolated to your workspace via row-level security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyOrg({ orgId }: { orgId: string }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function seed() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc("seed_demo_data", { _org: orgId });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["products", orgId] });
    setBusy(false);
  }
  return (
    <AppShell title="Store Health Overview" subtitle="Get started">
      <div className="grid place-items-center h-[60vh]">
        <div className="max-w-lg text-center space-y-6">
          <div className="size-14 mx-auto rounded-xl bg-brand/10 text-brand grid place-items-center shadow-lg shadow-brand/20">
            <PackagePlus className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Let's load your first products</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              Try Redefining Retail with a realistic grocery + pharmacy demo dataset, or head to
              Settings to add your own SKUs or import a CSV.
            </p>
          </div>
          {error && <p className="text-xs text-critical">{error}</p>}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={seed}
              disabled={busy}
              className="h-10 px-5 rounded-md bg-brand text-brand-foreground text-sm font-semibold shadow-lg shadow-brand/30 hover:bg-brand-dark transition disabled:opacity-60 inline-flex items-center gap-2"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Loading…" : "Load demo inventory"}
            </button>
            <Link
              to="/settings"
              className="h-10 px-5 rounded-md border border-border text-sm font-medium flex items-center hover:bg-muted transition"
            >
              Add products manually
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
```

### `src/routes/_authenticated/inventory.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel, StockBar, StatusPill } from "@/components/ui-parts";
import { statusOf, hoursUntil } from "@/lib/inventory-data";
import { useState, useMemo } from "react";
import { Filter, Loader2 } from "lucide-react";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";

export const Route = createFileRoute("/_authenticated/inventory")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Live Inventory — Redefining Retail" },
      { name: "description", content: "SKU-level inventory with stock levels, demand trends, and expiry tracking." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { data: org } = useCurrentOrg();
  const { data: products = [], isLoading } = useProducts(org?.id);
  const { q } = Route.useSearch();
  const [filter, setFilter] = useState<string>("All");

  const departments = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.department && set.add(p.department));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  const query = (q ?? "").trim().toLowerCase();
  const filtered = products.filter((p) => {
    if (filter !== "All" && p.department !== filter) return false;
    if (query && !(`${p.name} ${p.sku} ${p.brand ?? ""}`.toLowerCase().includes(query))) return false;
    return true;
  });

  return (
    <AppShell
      title="Live Inventory"
      subtitle={`${filtered.length} of ${products.length} SKUs${query ? ` · matching "${q}"` : ""} · Realtime sync active`}
    >
      <Panel
        title="Master Inventory List"
        right={
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="size-3.5 text-muted-foreground mr-1" />
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  filter === d
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        }
      >
        {isLoading ? (
          <div className="p-12 grid place-items-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Dept · Aisle</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Demand</th>
                  <th className="px-5 py-3">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const status = statusOf(p);
                  const trend = Number(p.demand_trend);
                  const trendPositive = trend >= 0;
                  const hrs = hoursUntil(p.expires_at);
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium leading-tight">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{p.brand}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground">{p.sku}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {p.department} · {p.aisle}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs tabular font-medium">
                            {p.stock} / {p.capacity}
                          </span>
                          <StockBar value={p.stock} capacity={p.capacity} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusPill status={status} /></td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium tabular ${trendPositive ? "text-success" : "text-muted-foreground"}`}>
                          {trendPositive ? "+" : ""}{trend}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {hrs !== null ? (
                          <span className={`text-xs tabular ${
                            hrs <= 24 ? "text-critical font-semibold"
                            : hrs <= 72 ? "text-warning font-medium"
                            : "text-muted-foreground"}`}>
                            {hrs}h
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
```

### `src/routes/_authenticated/alerts.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/ui-parts";
import { statusOf, hoursUntil } from "@/lib/inventory-data";
import { AlertTriangle, Clock, Tag, Printer, Check } from "lucide-react";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Redefining Retail" },
      { name: "description", content: "Low stock and expiry alerts with recommended actions." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { data: org } = useCurrentOrg();
  const { data: products = [] } = useProducts(org?.id);
  const [markedDown, setMarkedDown] = useState<Set<string>>(new Set());
  const [labeled, setLabeled] = useState<Set<string>>(new Set());

  const expiring = products
    .map((p) => ({ ...p, hrs: hoursUntil(p.expires_at) }))
    .filter((p) => p.hrs !== null && p.hrs <= 96)
    .sort((a, b) => (a.hrs ?? 0) - (b.hrs ?? 0));

  const lowStock = products
    .filter((p) => statusOf(p) === "low" || statusOf(p) === "critical")
    .sort((a, b) => a.stock / a.capacity - b.stock / b.capacity);

  return (
    <AppShell title="Alert Center" subtitle="Prioritized action queue · sorted by urgency">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel
          title="Expiry Alerts"
          right={<span className="text-[10px] font-semibold bg-critical-soft text-critical px-1.5 py-0.5 rounded uppercase tracking-wider">{expiring.length} items</span>}
        >
          <ul className="divide-y divide-border">
            {expiring.length === 0 && <li className="px-5 py-8 text-center text-xs text-muted-foreground">Nothing expiring soon.</li>}
            {expiring.map((p) => {
              const urgent = (p.hrs ?? 0) <= 24;
              return (
                <li key={p.id} className={`p-5 flex gap-4 ${urgent ? "bg-critical-soft/40" : ""}`}>
                  <div className={`size-9 shrink-0 rounded-md grid place-items-center ${urgent ? "bg-critical text-critical-foreground" : "bg-warning-soft text-warning"}`}>
                    <Clock className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {p.stock} units · {p.department} · Aisle {p.aisle}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold tabular shrink-0 ${urgent ? "text-critical" : "text-warning"}`}>{p.hrs}h</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      Recommend: Apply {urgent ? "40%" : "20%"} discount to move stock before expiry.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setMarkedDown((s) => new Set(s).add(p.id))}
                        disabled={markedDown.has(p.id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded text-brand-foreground inline-flex items-center gap-1.5 disabled:opacity-70 transition"
                        style={markedDown.has(p.id) ? { background: "var(--color-success)" } : { background: "var(--gradient-brand)" }}
                      >
                        {markedDown.has(p.id) ? <><Check className="size-3" /> Markdown applied</> : <><Tag className="size-3" /> Apply markdown</>}
                      </button>
                      <button
                        onClick={() => setLabeled((s) => new Set(s).add(p.id))}
                        disabled={labeled.has(p.id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded border border-border inline-flex items-center gap-1.5 hover:bg-muted transition disabled:opacity-70"
                      >
                        {labeled.has(p.id) ? <><Check className="size-3" /> Sent to printer</> : <><Printer className="size-3" /> Print labels</>}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel
          title="Low Stock Alerts"
          right={<span className="text-[10px] font-semibold bg-warning-soft text-warning px-1.5 py-0.5 rounded uppercase tracking-wider">{lowStock.length} items</span>}
        >
          <ul className="divide-y divide-border">
            {lowStock.length === 0 && <li className="px-5 py-8 text-center text-xs text-muted-foreground">Stock levels healthy.</li>}
            {lowStock.map((p) => {
              const critical = statusOf(p) === "critical";
              const pct = Math.round((p.stock / p.capacity) * 100);
              return (
                <li key={p.id} className={`p-5 flex gap-4 ${critical ? "bg-critical-soft/40" : ""}`}>
                  <div className={`size-9 shrink-0 rounded-md grid place-items-center ${critical ? "bg-critical text-critical-foreground" : "bg-warning text-warning-foreground"}`}>
                    <AlertTriangle className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {p.department} · Vel: {p.velocity}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold tabular shrink-0 ${critical ? "text-critical" : "text-warning"}`}>{pct}%</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                      <span>Stock: <span className="tabular font-medium text-foreground">{p.stock}</span> / {p.capacity}</span>
                      <span>·</span>
                      <span>Est. stockout: {critical ? "< 6h" : "24-48h"}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
```

### `src/routes/_authenticated/recommendations.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/ui-parts";
import { buildRecommendations } from "@/lib/inventory-data";
import { Sparkles, TrendingUp, CheckCircle2, X } from "lucide-react";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/recommendations")({
  head: () => ({
    meta: [
      { title: "AI Reorders — Redefining Retail" },
      { name: "description", content: "AI reorder recommendations with demand confidence scores." },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { data: org } = useCurrentOrg();
  const { data: products = [] } = useProducts(org?.id);
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [approved, setApproved] = useState<Set<string>>(new Set());

  const recs = buildRecommendations(products)
    .filter((r) => r.quantity > 0 && !dismissed.has(r.id) && !approved.has(r.id));

  async function approve(recId: string, productId: string, qty: number) {
    if (!org) return;
    setBusy(recId);
    const { error } = await supabase.from("stock_movements").insert({
      org_id: org.id,
      product_id: productId,
      type: "receipt",
      qty,
      note: "AI-approved reorder",
    });
    setBusy(null);
    if (!error) {
      setApproved((s) => new Set(s).add(recId));
      qc.invalidateQueries({ queryKey: ["products", org.id] });
    }
  }

  function reject(recId: string) {
    setDismissed((s) => new Set(s).add(recId));
  }

  const totalValue = recs.reduce((s, r) => s + r.estCost, 0);
  const avgConf = recs.length
    ? Math.round(recs.reduce((s, r) => s + r.confidence, 0) / recs.length)
    : 0;

  return (
    <AppShell
      title="AI Reorder Recommendations"
      subtitle={`${recs.length} suggestions · model tuned to your live sales`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-panel p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total suggested spend</p>
          <p className="text-2xl font-semibold tabular mt-2">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-xl border border-border bg-panel p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">High-priority</p>
          <p className="text-2xl font-semibold tabular mt-2 text-critical">
            {recs.filter((r) => r.urgency === "high").length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-panel p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Avg. model confidence</p>
          <p className="text-2xl font-semibold tabular mt-2 text-brand">{avgConf}%</p>
        </div>
      </div>

      <Panel
        title="Recommendation Queue"
        right={
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" />
            Powered by Redefining Retail Forecast v4.2
          </div>
        }
      >
        {recs.length === 0 && <div className="px-5 py-12 text-center text-sm text-muted-foreground">Model happy — no reorders needed.</div>}
        <ul className="divide-y divide-border">
          {recs.map((r) => {
            const urgencyMap = {
              high: { label: "High priority", cls: "bg-critical text-critical-foreground" },
              medium: { label: "Medium", cls: "bg-warning text-warning-foreground" },
              low: { label: "Low", cls: "bg-muted text-muted-foreground" },
            };
            const u = urgencyMap[r.urgency];
            return (
              <li key={r.id} className="p-5 flex flex-col lg:flex-row gap-5 lg:items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${u.cls}`}>{u.label}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand tabular">{r.confidence}% confidence</span>
                  </div>
                  <p className="text-sm font-semibold">{r.product.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{r.product.sku}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                    <TrendingUp className="size-3 inline mr-1 text-brand" />
                    {r.reason}
                  </p>
                </div>
                <div className="flex items-center gap-6 lg:gap-8 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Quantity</p>
                    <p className="text-lg font-semibold tabular mt-0.5">{r.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Est. cost</p>
                    <p className="text-lg font-semibold tabular mt-0.5">${r.estCost.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => reject(r.id)}
                      title="Dismiss recommendation"
                      className="size-9 rounded-md border border-border grid place-items-center hover:bg-critical/15 hover:text-critical hover:border-critical/40 transition text-muted-foreground"
                    >
                      <X className="size-4" />
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => approve(r.id, r.product.id, r.quantity)}
                      className="h-9 px-4 rounded-md text-brand-foreground text-sm font-semibold flex items-center gap-1.5 transition disabled:opacity-60 glow-brand"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <CheckCircle2 className="size-4" />
                      {busy === r.id ? "Sending…" : "Approve PO"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </AppShell>
  );
}
```

### `src/routes/_authenticated/suppliers.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/ui-parts";
import { Truck, Plus } from "lucide-react";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useSuppliers } from "@/hooks/use-products";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({
    meta: [
      { title: "Supplier Portal — Redefining Retail" },
      { name: "description", content: "Manage suppliers and issue purchase orders." },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const { data: org } = useCurrentOrg();
  const { data: suppliers = [] } = useSuppliers(org?.id);
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");

  const statusMap: Record<string, { label: string; cls: string }> = {
    "on-time": { label: "On time", cls: "bg-success-soft text-success" },
    delayed: { label: "Delayed", cls: "bg-warning-soft text-warning" },
    pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  };

  async function addSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    await supabase.from("suppliers").insert({
      org_id: org.id,
      name,
      category,
      contact_email: email,
      status: "on-time",
    });
    setName("");
    setCategory("");
    setEmail("");
    setAdding(false);
    qc.invalidateQueries({ queryKey: ["suppliers", org.id] });
  }

  return (
    <AppShell
      title="Supplier Portal"
      subtitle={`${suppliers.length} active suppliers`}
      actions={
        <button
          onClick={() => setAdding((v) => !v)}
          className="h-9 px-4 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:bg-brand-dark transition flex items-center gap-2"
        >
          <Plus className="size-4" /> Add supplier
        </button>
      }
    >
      {adding && (
        <div className="mb-6 rounded-xl border border-border bg-panel p-5">
          <form onSubmit={addSupplier} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input required className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input type="email" className="input" placeholder="contact@supplier.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="h-10 rounded-md bg-brand text-brand-foreground text-sm font-semibold">Save supplier</button>
          </form>
        </div>
      )}

      <Panel title="Suppliers">
        {suppliers.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No suppliers yet. Add one above or load demo data from the Overview page.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {suppliers.map((s) => (
              <li key={s.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/30 transition">
                <div className="size-10 rounded-md bg-muted grid place-items-center shrink-0">
                  <Truck className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.category}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Next delivery</p>
                  <p className="text-xs font-medium tabular mt-0.5">{s.next_delivery ?? "—"}</p>
                </div>
                <div className="hidden md:block text-right w-20">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">On-time</p>
                  <p className="text-xs font-medium tabular mt-0.5 text-success">{s.on_time_rate}%</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wider shrink-0 ${(statusMap[s.status] ?? statusMap["on-time"]).cls}`}>
                  {(statusMap[s.status] ?? statusMap["on-time"]).label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
```

### `src/routes/_authenticated/simulator.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { FlaskConical, Loader2, Minus, Plus, Play, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { KpiTile, Panel } from "@/components/ui-parts";
import { Slider } from "@/components/ui/slider";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";
import { simulate, suggestedQty, money, dailyDemand, daysUntilExpiry, DEFAULT_MARGIN } from "@/lib/simulation";

export const Route = createFileRoute("/_authenticated/simulator")({
  head: () => ({
    meta: [
      { title: "What-If Simulator — Redefining Retail" },
      {
        name: "description",
        content:
          "Model any order quantity before you commit: projected demand, leftover stock, expiry risk and profit.",
      },
      { property: "og:title", content: "What-If Simulator — Redefining Retail" },
      {
        property: "og:description",
        content: "Test order decisions against projected demand, waste and profit before spending a dollar.",
      },
    ],
  }),
  component: SimulatorPage,
});

const HORIZONS = [7, 14, 30];

function SimulatorPage() {
  const { data: org } = useCurrentOrg();
  const { data: products = [], isLoading } = useProducts(org?.id);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [horizon, setHorizon] = useState(14);
  const [qty, setQty] = useState<number | null>(null);
  const [margin, setMargin] = useState(Math.round(DEFAULT_MARGIN * 100));
  const [ran, setRan] = useState(false);

  const product = useMemo(
    () => products.find((p) => p.id === selectedId) ?? products[0],
    [products, selectedId],
  );

  const suggestion = product ? suggestedQty(product, horizon) : 0;
  const orderQty = qty ?? suggestion;

  const filtered = products.filter((p) =>
    `${p.name} ${p.sku} ${p.department ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const result = useMemo(
    () => (product ? simulate({ product, orderQty, horizonDays: horizon, margin: margin / 100 }) : null),
    [product, orderQty, horizon, margin],
  );

  const comparison = useMemo(() => {
    if (!product) return [];
    const base = Math.max(10, suggestion || 100);
    const qtys = Array.from(new Set([Math.round(base * 0.6), base, Math.round(base * 1.5)])).filter((q) => q > 0);
    return qtys.map((q) => ({
      qty: q,
      r: simulate({ product, orderQty: q, horizonDays: horizon, margin: margin / 100 }),
    }));
  }, [product, suggestion, horizon, margin]);

  const bestProfit = Math.max(...comparison.map((c) => c.r.profit), -Infinity);

  if (isLoading) {
    return (
      <AppShell title="What-If Simulator">
        <div className="grid place-items-center h-96 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell title="What-If Simulator" subtitle="Add products to start simulating decisions">
        <Panel title="No catalog yet">
          <p className="p-6 text-sm text-muted-foreground">
            Import or add products in Settings, then come back to model order decisions.
          </p>
        </Panel>
      </AppShell>
    );
  }

  const expiry = daysUntilExpiry(product);
  const verdict = {
    under: {
      label: "Under-ordering",
      cls: "bg-critical/15 text-critical border-critical/30",
      icon: <AlertTriangle className="size-4" />,
      copy: "Projected demand exceeds cover — you will lose sales in this window.",
    },
    balanced: {
      label: "Balanced order",
      cls: "bg-brand/15 text-brand border-brand/30",
      icon: <CheckCircle2 className="size-4" />,
      copy: "Cover matches projected demand with low waste exposure.",
    },
    over: {
      label: "Over-ordering",
      cls: "bg-warning/15 text-warning border-warning/30",
      icon: <TrendingUp className="size-4" />,
      copy: "Leftover stock and expiry risk eat into margin — trim the quantity.",
    },
  }[result!.verdict];

  return (
    <AppShell
      title="What-If Simulator"
      subtitle="Model the outcome of an order before you place it"
      actions={
        <button
          onClick={() => setRan(true)}
          className="h-9 px-4 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:bg-brand-dark transition-colors shadow-sm shadow-brand/20 inline-flex items-center gap-2"
        >
          <Play className="size-3.5" /> Run simulation
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Inputs */}
          <Panel className="col-span-12 xl:col-span-4" title="Decision inputs" right={<FlaskConical className="size-4 text-brand" />}>
            <div className="p-5 space-y-6">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Product
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search SKU or name…"
                  className="mt-2 h-9 w-full rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition"
                />
                <div className="mt-2 max-h-44 overflow-auto rounded-md border border-border divide-y divide-border">
                  {filtered.slice(0, 40).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedId(p.id);
                        setQty(null);
                        setRan(true);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition ${
                        p.id === product.id ? "bg-brand/10 text-brand" : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground ml-2 tabular">{p.sku}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">No match</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Order quantity
                  </label>
                  <button
                    onClick={() => setQty(null)}
                    className="text-[11px] text-brand hover:underline"
                  >
                    Use AI suggestion ({suggestion})
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => setQty(Math.max(0, orderQty - 10))}
                    className="size-9 rounded-md border border-border grid place-items-center hover:bg-muted transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    value={orderQty}
                    onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
                    className="h-9 flex-1 rounded-md border border-border bg-background/40 px-3 text-center text-sm tabular outline-none focus:border-brand/60"
                  />
                  <button
                    onClick={() => setQty(orderQty + 10)}
                    className="size-9 rounded-md border border-border grid place-items-center hover:bg-muted transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Slider
                  className="mt-4"
                  value={[Math.min(orderQty, Math.max(50, (product.capacity || 100) * 2))]}
                  max={Math.max(50, (product.capacity || 100) * 2)}
                  step={5}
                  onValueChange={(v) => setQty(v[0])}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Horizon
                </label>
                <div className="mt-2 flex gap-2">
                  {HORIZONS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorizon(h)}
                      className={`h-9 flex-1 rounded-md border text-sm font-medium transition ${
                        h === horizon
                          ? "border-brand/50 bg-brand/10 text-brand"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {h} days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                  <span>Retail margin</span>
                  <span className="tabular text-foreground">{margin}%</span>
                </div>
                <Slider
                  className="mt-3"
                  value={[margin]}
                  min={5}
                  max={70}
                  step={1}
                  onValueChange={(v) => setMargin(v[0])}
                />
              </div>

              <div className="rounded-md border border-border bg-background/30 p-3 text-xs space-y-1.5">
                <Row label="On hand" value={`${product.stock} / ${product.capacity}`} />
                <Row label="Daily demand" value={`${dailyDemand(product)} units`} />
                <Row label="Unit cost" value={money(Number(product.unit_cost ?? 0))} />
                <Row label="Expires in" value={expiry === null ? "not tracked" : `${expiry} days`} />
              </div>
            </div>
          </Panel>

          {/* Results */}
          <div className="col-span-12 xl:col-span-8 space-y-6">
            <div className={`rounded-xl border px-5 py-4 flex items-start gap-3 ${verdict.cls} ${ran ? "animate-in fade-in" : ""}`}>
              {verdict.icon}
              <div>
                <p className="text-sm font-semibold">{verdict.label}</p>
                <p className="text-xs opacity-80 mt-0.5">{verdict.copy}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiTile
                label="Expected demand"
                value={result!.expectedDemand.toLocaleString()}
                delta={`over ${horizon} days`}
              />
              <KpiTile
                label="Units sold"
                value={result!.unitsSold.toLocaleString()}
                delta={`${result!.stockoutDays} stockout days`}
                tone={result!.stockoutDays > 0 ? "warning" : undefined}
              />
              <KpiTile
                label="Expiry risk"
                value={`${result!.expiryRisk}%`}
                delta={`${result!.expiredUnits} units written off`}
                tone={result!.expiryRisk > 8 ? "critical" : undefined}
              />
              <KpiTile
                label="Projected profit"
                value={money(result!.profit)}
                delta={`${money(result!.revenue)} revenue`}
                tone="brand"
              />
            </div>

            <Panel title={`Projected stock curve — ${product.name}`}>
              <div className="h-64 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result!.curve} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--panel)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <ReferenceLine
                      y={Math.round((product.capacity || 0) * 0.3)}
                      stroke="var(--warning)"
                      strokeDasharray="4 4"
                      label={{ value: "reorder point", fontSize: 10, fill: "var(--warning)" }}
                    />
                    {expiry !== null && expiry <= horizon && (
                      <ReferenceLine
                        x={Math.round(expiry)}
                        stroke="var(--critical)"
                        strokeDasharray="4 4"
                        label={{ value: "expiry", fontSize: 10, fill: "var(--critical)" }}
                      />
                    )}
                    <Area type="monotone" dataKey="stock" stroke="var(--brand)" strokeWidth={2} fill="url(#simGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Compare order sizes" right={<span className="text-[11px] text-muted-foreground">best profit highlighted</span>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="text-left font-medium px-5 py-3">Order qty</th>
                      <th className="text-right font-medium px-3 py-3">Sold</th>
                      <th className="text-right font-medium px-3 py-3">Leftover</th>
                      <th className="text-right font-medium px-3 py-3">Expiry risk</th>
                      <th className="text-right font-medium px-3 py-3">Storage</th>
                      <th className="text-right font-medium px-3 py-3">Waste cost</th>
                      <th className="text-right font-medium px-5 py-3">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map(({ qty: q, r }) => (
                      <tr
                        key={q}
                        className={`border-b border-border/60 last:border-0 ${
                          r.profit === bestProfit ? "bg-brand/10" : ""
                        }`}
                      >
                        <td className="px-5 py-3 font-medium tabular">
                          {q}
                          {q === orderQty && <span className="ml-2 text-[10px] text-brand">current</span>}
                        </td>
                        <td className="px-3 py-3 text-right tabular">{r.unitsSold}</td>
                        <td className="px-3 py-3 text-right tabular">{r.leftover}</td>
                        <td className="px-3 py-3 text-right tabular">{r.expiryRisk}%</td>
                        <td className="px-3 py-3 text-right tabular">{r.storageUtilisation}%</td>
                        <td className="px-3 py-3 text-right tabular">{money(r.wasteCost)}</td>
                        <td className="px-5 py-3 text-right tabular font-semibold">{money(r.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniStat label="Leftover stock" value={`${result!.leftover} units`} />
              <MiniStat label="Storage utilisation" value={`${result!.storageUtilisation}%`} sub={`${result!.storageDelta >= 0 ? "+" : ""}${result!.storageDelta} pts vs today`} />
              <MiniStat label="Storage cost" value={money(result!.storageCost)} />
              <MiniStat label="Waste cost" value={money(result!.wasteCost)} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular font-medium">{value}</span>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel/60 backdrop-blur-xl p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
      <p className="text-lg font-semibold tabular mt-1.5">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
```

### `src/routes/_authenticated/stress-test.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import { ShieldAlert, Activity, PackageX, Trash2, Warehouse, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { KpiTile, Panel, StatusPill } from "@/components/ui-parts";
import { Slider } from "@/components/ui/slider";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";
import { statusOf } from "@/lib/inventory-data";
import { SCENARIOS, runStressTest, money, type ScenarioState } from "@/lib/simulation";

export const Route = createFileRoute("/_authenticated/stress-test")({
  head: () => ({
    meta: [
      { title: "Inventory Stress Test — Redefining Retail" },
      {
        name: "description",
        content:
          "Stress-test your store: demand shocks, supplier delays, capacity loss and cold-chain failure, scored end to end.",
      },
      { property: "og:title", content: "Inventory Stress Test — Redefining Retail" },
      {
        property: "og:description",
        content: "Banks stress-test portfolios. Stress-test your inventory the same way.",
      },
    ],
  }),
  component: StressTestPage,
});

const HORIZONS = [7, 14, 30];

function StressTestPage() {
  const { data: org } = useCurrentOrg();
  const { data: products = [], isLoading } = useProducts(org?.id);
  const [horizon, setHorizon] = useState(14);
  const [states, setStates] = useState<ScenarioState[]>(
    SCENARIOS.map((s) => ({ id: s.id, enabled: false, severity: s.defaultSeverity })),
  );

  const active = states.filter((s) => s.enabled);
  const report = useMemo(
    () => (products.length ? runStressTest(products, states, horizon) : null),
    [products, states, horizon],
  );

  function toggle(id: string) {
    setStates((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }
  function setSeverity(id: string, v: number) {
    setStates((prev) => prev.map((s) => (s.id === id ? { ...s, severity: v } : s)));
  }

  const resilience = report?.resilience ?? 100;
  const resTone = resilience >= 75 ? "success" : resilience >= 50 ? "warning" : "critical";

  return (
    <AppShell
      title="Inventory Stress Test"
      subtitle="Shock the store and watch what breaks — availability, waste, storage and revenue"
      actions={
        <div className="flex items-center gap-1 rounded-md border border-border bg-background/40 p-1">
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                horizon === h ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {h}d
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          <KpiTile label="SKUs stocking out" value={String(report?.stockouts ?? 0)} tone="critical" icon={<PackageX className="size-4" />} />
          <KpiTile label="Overstocked SKUs" value={String(report?.overstocked ?? 0)} tone="warning" icon={<Warehouse className="size-4" />} />
          <KpiTile label="Projected waste" value={money(report?.wasteValue ?? 0)} tone="warning" icon={<Trash2 className="size-4" />} />
          <KpiTile label="Revenue at risk" value={money(report?.revenueAtRisk ?? 0)} tone="critical" icon={<TrendingDown className="size-4" />} />
          <KpiTile
            label="Resilience score"
            value={`${resilience}/100`}
            tone={resTone}
            delta={active.length ? `${active.length} shock${active.length > 1 ? "s" : ""}` : "baseline"}
            icon={<ShieldAlert className="size-4" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="Scenarios" className="xl:col-span-2">
            <div className="p-5 grid gap-4 md:grid-cols-2">
              {SCENARIOS.map((sc) => {
                const st = states.find((s) => s.id === sc.id)!;
                const max = sc.id === "supplier_delay" ? 14 : 100;
                return (
                  <div
                    key={sc.id}
                    className={`rounded-xl border p-4 transition ${
                      st.enabled
                        ? "border-brand/50 bg-brand/5 shadow-[0_0_0_1px_var(--brand)]"
                        : "border-border bg-panel/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{sc.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{sc.blurb}</p>
                      </div>
                      <button
                        onClick={() => toggle(sc.id)}
                        role="switch"
                        aria-checked={st.enabled}
                        aria-label={`Toggle ${sc.label}`}
                        className={`shrink-0 w-10 h-5 rounded-full transition relative ${
                          st.enabled ? "bg-brand" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 size-4 rounded-full bg-background transition-all ${
                            st.enabled ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    <div className={`mt-4 ${st.enabled ? "" : "opacity-40 pointer-events-none"}`}>
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="uppercase tracking-widest text-muted-foreground font-semibold">
                          {sc.unit}
                        </span>
                        <span className="tabular font-semibold text-brand">{st.severity}</span>
                      </div>
                      <Slider
                        value={[st.severity]}
                        min={sc.id === "supplier_delay" ? 1 : 5}
                        max={max}
                        step={1}
                        onValueChange={(v) => setSeverity(sc.id, v[0])}
                      />
                    </div>
                    {st.enabled && (
                      <p className="mt-3 text-[11px] text-muted-foreground border-t border-border pt-3">
                        <span className="text-brand font-semibold">Mitigation · </span>
                        {sc.mitigation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel title="Resilience profile">
              <div className="p-4 h-[280px]">
                {report ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={report.radar} outerRadius="72%">
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--panel)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Radar
                        dataKey="score"
                        stroke="var(--brand)"
                        fill="var(--brand)"
                        fillOpacity={0.28}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full grid place-items-center text-xs text-muted-foreground">
                    {isLoading ? "Loading inventory…" : "Add products to stress-test."}
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Most fragile SKUs">
              <div className="divide-y divide-border">
                {(report?.impacts ?? []).slice(0, 5).map((i) => (
                  <div key={i.product.id} className="px-5 py-3 flex items-center gap-3">
                    <Activity className="size-3.5 text-critical shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{i.product.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {i.stockoutDays > 0 ? `${i.stockoutDays} stockout days` : `${i.after.expiryRisk}% expiry risk`}
                      </p>
                    </div>
                    <span className="text-[11px] tabular text-critical font-semibold">
                      {money(i.profitDelta)}
                    </span>
                  </div>
                ))}
                {!report?.impacts.length && (
                  <p className="px-5 py-6 text-xs text-muted-foreground">No SKUs yet.</p>
                )}
              </div>
            </Panel>
          </div>
        </div>

        <Panel
          title="Per-SKU impact"
          right={<span className="text-[11px] text-muted-foreground">Sorted by risk · {horizon}-day horizon</span>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="text-left font-semibold px-5 py-3">Product</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                  <th className="text-right font-semibold px-5 py-3">Stock before → after</th>
                  <th className="text-right font-semibold px-5 py-3">Days to stockout</th>
                  <th className="text-right font-semibold px-5 py-3">Expiry risk</th>
                  <th className="text-right font-semibold px-5 py-3">Waste Δ</th>
                  <th className="text-right font-semibold px-5 py-3">Profit Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(report?.impacts ?? []).slice(0, 25).map((i) => (
                  <tr key={i.product.id} className="hover:bg-muted/40 transition">
                    <td className="px-5 py-3">
                      <p className="font-medium">{i.product.name}</p>
                      <p className="text-[10px] text-muted-foreground tabular">{i.product.sku}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={statusOf(i.product)} />
                    </td>
                    <td className="px-5 py-3 text-right tabular">
                      {i.before.leftover} → <span className="text-brand">{i.after.leftover}</span>
                    </td>
                    <td className="px-5 py-3 text-right tabular">
                      {i.after.stockoutDays > 0 ? `${horizon - i.after.stockoutDays}d` : "—"}
                    </td>
                    <td className={`px-5 py-3 text-right tabular ${i.after.expiryRisk > 15 ? "text-critical" : ""}`}>
                      {i.after.expiryRisk}%
                    </td>
                    <td className={`px-5 py-3 text-right tabular ${i.wasteDelta > 0 ? "text-warning" : ""}`}>
                      {i.wasteDelta >= 0 ? "+" : ""}
                      {money(i.wasteDelta)}
                    </td>
                    <td className={`px-5 py-3 text-right tabular ${i.profitDelta < 0 ? "text-critical" : "text-success"}`}>
                      {i.profitDelta >= 0 ? "+" : ""}
                      {money(i.profitDelta)}
                    </td>
                  </tr>
                ))}
                {!report?.impacts.length && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-xs text-muted-foreground">
                      {isLoading ? "Loading inventory…" : "No products to stress-test yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
```

### `src/routes/_authenticated/settings.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/ui-parts";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts, useSuppliers } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Upload, Sparkles, Trash2, Database } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Redefining Retail" },
      { name: "description", content: "Manage products, suppliers, and workspace settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: org } = useCurrentOrg();
  const { data: products = [] } = useProducts(org?.id);
  const { data: suppliers = [] } = useSuppliers(org?.id);
  const qc = useQueryClient();
  const [tab, setTab] = useState<"products" | "workspace">("products");

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [aisle, setAisle] = useState("");
  const [stock, setStock] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [supplierId, setSupplierId] = useState("");
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);
  const [seedBusy, setSeedBusy] = useState(false);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    await supabase.from("products").insert({
      org_id: org.id,
      sku,
      name,
      department: dept || null,
      aisle: aisle || null,
      stock,
      capacity,
      unit_cost: unitCost,
      supplier_id: supplierId || null,
    });
    setSku("");
    setName("");
    setDept("");
    setAisle("");
    setStock(0);
    setCapacity(0);
    setUnitCost(0);
    setSupplierId("");
    qc.invalidateQueries({ queryKey: ["products", org.id] });
  }

  async function deleteProduct(id: string) {
    if (!org) return;
    if (!confirm("Delete this product? This also removes its stock history.")) return;
    await supabase.from("products").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["products", org.id] });
  }

  async function seed() {
    if (!org) return;
    setSeedBusy(true);
    await supabase.rpc("seed_demo_data", { _org: org.id });
    setSeedBusy(false);
    qc.invalidateQueries();
  }

  async function importCsv(file: File) {
    if (!org) return;
    setCsvError(null);
    setCsvBusy(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const [headerLine, ...rest] = lines;
      const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
      const idx = (k: string) => headers.indexOf(k);
      const rows = rest.map((l) => {
        const cols = l.split(",");
        return {
          org_id: org.id,
          sku: cols[idx("sku")]?.trim(),
          name: cols[idx("name")]?.trim(),
          department: cols[idx("department")]?.trim() || null,
          aisle: cols[idx("aisle")]?.trim() || null,
          stock: Number(cols[idx("stock")]) || 0,
          capacity: Number(cols[idx("capacity")]) || 0,
          unit_cost: Number(cols[idx("unit_cost")]) || 0,
        };
      }).filter((r) => r.sku && r.name);
      if (!rows.length) throw new Error("No valid rows. Expected columns: sku,name,department,aisle,stock,capacity,unit_cost");
      const { error } = await supabase.from("products").upsert(rows, { onConflict: "org_id,sku" });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["products", org.id] });
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setCsvBusy(false);
    }
  }

  return (
    <AppShell title="Settings" subtitle={org?.name}>
      <div className="flex gap-1 mb-6 border-b border-border">
        {(["products", "workspace"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
              tab === t ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Bulk import (CSV)" right={<Upload className="size-3.5 text-muted-foreground" />}>
              <div className="p-5 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Columns: <code className="font-mono text-[11px]">sku, name, department, aisle, stock, capacity, unit_cost</code>. Existing SKUs are updated.
                </p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
                  disabled={csvBusy}
                  className="block w-full text-xs file:mr-3 file:h-9 file:px-4 file:rounded-md file:border-0 file:bg-brand file:text-brand-foreground file:font-medium file:cursor-pointer"
                />
                {csvBusy && <p className="text-xs text-muted-foreground">Importing…</p>}
                {csvError && <p className="text-xs text-critical">{csvError}</p>}
              </div>
            </Panel>
            <Panel title="Demo data" right={<Sparkles className="size-3.5 text-brand" />}>
              <div className="p-5 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Load 12 sample products and 6 suppliers so buyers can see the dashboard populated.
                </p>
                <button
                  onClick={seed}
                  disabled={seedBusy}
                  className="h-9 px-4 rounded-md bg-brand text-brand-foreground text-sm font-semibold disabled:opacity-60 inline-flex items-center gap-2"
                >
                  <Database className="size-4" /> {seedBusy ? "Seeding…" : "Load demo inventory"}
                </button>
              </div>
            </Panel>
          </div>

          <Panel title="Add product" right={<Plus className="size-3.5 text-muted-foreground" />}>
            <form onSubmit={addProduct} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input required className="input" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
              <input required className="input md:col-span-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="input" placeholder="Department" value={dept} onChange={(e) => setDept(e.target.value)} />
              <input className="input" placeholder="Aisle" value={aisle} onChange={(e) => setAisle(e.target.value)} />
              <input type="number" className="input" placeholder="Stock" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
              <input type="number" className="input" placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
              <input type="number" step="0.01" className="input" placeholder="Unit cost" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
              <select className="input md:col-span-3" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Select supplier (optional)</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button className="h-10 rounded-md bg-brand text-brand-foreground text-sm font-semibold md:col-span-1">Add product</button>
            </form>
          </Panel>

          <Panel title={`Products (${products.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Dept</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Capacity</th>
                    <th className="px-5 py-3 text-right">Cost</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{p.sku}</td>
                      <td className="px-5 py-3 text-sm">{p.name}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{p.department}</td>
                      <td className="px-5 py-3 text-xs tabular">{p.stock}</td>
                      <td className="px-5 py-3 text-xs tabular">{p.capacity}</td>
                      <td className="px-5 py-3 text-xs tabular text-right">${Number(p.unit_cost).toFixed(2)}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => deleteProduct(p.id)} className="size-7 rounded grid place-items-center hover:bg-critical/10 hover:text-critical transition">
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {tab === "workspace" && (
        <Panel title="Workspace">
          <div className="p-5 space-y-4 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Company</p>
              <p className="mt-1">{org?.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Your role</p>
              <p className="mt-1 capitalize">{org?.role}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Workspace ID</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{org?.id}</p>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              Invite teammates by sharing the sign-up link — they can create their own accounts and you'll grant them access from here (coming soon).
            </p>
          </div>
        </Panel>
      )}
    </AppShell>
  );
}
```

---

## 4. Shared components

### `src/components/app-shell.tsx`

```tsx
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Boxes,
  BellRing,
  Sparkles,
  Truck,
  Activity,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  FlaskConical,
  ShieldAlert,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";
import { statusOf, hoursUntil } from "@/lib/inventory-data";
import { useSimulator } from "@/hooks/use-simulator";
import logoAsset from "@/assets/redefining-retail-logo.jpeg.asset.json";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/inventory", label: "Live Inventory", icon: Boxes },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/recommendations", label: "AI Reorders", icon: Sparkles },
  { to: "/suppliers", label: "Supplier Portal", icon: Truck },
  { to: "/simulator", label: "What-If Simulator", icon: FlaskConical },
  { to: "/stress-test", label: "Stress Test", icon: ShieldAlert },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ title, subtitle, actions, children }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { data: org } = useCurrentOrg();
  const { data: products = [] } = useProducts(org?.id);
  const { running, toggle } = useSimulator(org?.id);
  const [menuOpen, setMenuOpen] = useState(false);

  const lowCount = products.filter((p) => {
    const s = statusOf(p);
    return s === "low" || s === "critical";
  }).length;
  const expiringCount = products.filter((p) => {
    const h = hoursUntil(p.expires_at);
    return h !== null && h <= 48;
  }).length;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-panel/70 backdrop-blur-xl flex flex-col relative">
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-brand/30 to-transparent" />
        <div className="h-16 flex items-center px-5 border-b border-border">
          <div className="size-9 rounded-lg grid place-items-center overflow-hidden ring-1 ring-brand/40 glow-brand" style={{ background: "var(--gradient-brand)" }}>
            <img src={logoAsset.url} alt="Redefining Retail" className="size-9 object-cover mix-blend-luminosity opacity-90" />
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-semibold leading-none tracking-tight truncate">
              {org?.name ?? "Redefining Retail"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-brand/80 mt-1">
              {org?.role ?? "workspace"}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <p className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Operations
          </p>
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            const badge =
              item.to === "/alerts" ? lowCount + expiringCount : undefined;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  active
                    ? "text-foreground bg-gradient-to-r from-brand/25 via-brand/10 to-transparent ring-1 ring-brand/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-brand shadow-[0_0_10px_var(--brand)]" />}
                <Icon className={`size-4 shrink-0 ${active ? "text-brand" : ""}`} strokeWidth={2} />
                <span className="flex-1">{item.label}</span>
                {badge ? (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    active ? "bg-brand text-brand-foreground" : "bg-critical/20 text-critical ring-1 ring-critical/30"
                  }`}>
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-3">
          <button
            onClick={toggle}
            className={`w-full px-3 py-2 rounded-md flex items-center gap-2 text-xs font-medium transition ${
              running
                ? "bg-brand/10 text-brand"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className={`size-3.5 ${running ? "animate-pulse" : ""}`} />
            <span className="flex-1 text-left">
              {running ? "Simulating sales…" : "Simulate live sales"}
            </span>
          </button>

          <div className="px-3 py-2 rounded-md bg-muted/50 flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
              <span className="relative inline-flex rounded-full size-2 bg-success" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-medium leading-none">Realtime connected</p>
              <p className="text-[10px] text-muted-foreground mt-1">Cloud DB live</p>
            </div>
            <Activity className="size-3.5 text-muted-foreground" />
          </div>

          <UserMenu onSignOut={signOut} open={menuOpen} setOpen={setMenuOpen} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-border bg-panel/60 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight leading-none">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q");
                navigate({ to: "/inventory", search: { q: q ? String(q) : undefined } });
              }}
              className="relative hidden md:block"
            >
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                name="q"
                type="text"
                placeholder="Search SKU, product…"
                className="h-9 w-72 rounded-md border border-border bg-background/40 pl-9 pr-3 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 transition"
              />
            </form>
            <Link
              to="/alerts"
              aria-label="Alerts"
              className="relative size-9 rounded-md border border-border bg-background/40 grid place-items-center hover:bg-muted hover:border-brand/40 transition"
            >
              <Bell className="size-4" />
              {expiringCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-critical text-critical-foreground text-[9px] font-bold grid place-items-center animate-pulse">
                  {expiringCount}
                </span>
              )}
            </Link>
            {actions}
          </div>
        </header>

        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}

function UserMenu({
  onSignOut,
  open,
  setOpen,
}: {
  onSignOut: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { data: org } = useCurrentOrg();
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted transition"
      >
        <div className="size-8 rounded-full bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-brand-foreground text-xs font-semibold">
          {org?.name?.[0] ?? "U"}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-medium truncate">{org?.name ?? "Workspace"}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{org?.role ?? "member"}</p>
        </div>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 rounded-md border border-border bg-panel shadow-lg overflow-hidden">
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="w-full px-3 py-2 flex items-center gap-2 text-xs hover:bg-muted transition"
          >
            <Settings className="size-3.5" /> Workspace settings
          </Link>
          <button
            onClick={onSignOut}
            className="w-full px-3 py-2 flex items-center gap-2 text-xs hover:bg-muted transition text-critical"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
```

### `src/components/ui-parts.tsx`

```tsx
import type { ReactNode } from "react";

export function KpiTile({
  label,
  value,
  delta,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "warning" | "critical" | "success" | "brand";
  icon?: ReactNode;
}) {
  const toneClasses = {
    default: "text-foreground",
    warning: "text-warning",
    critical: "text-critical",
    success: "text-success",
    brand: "text-brand",
  }[tone];

  return (
    <div className="relative rounded-xl border border-border glass p-5 flex flex-col gap-3 hover:border-brand/50 hover:shadow-[0_0_0_1px_var(--brand),0_10px_30px_-12px_var(--brand)] transition-all overflow-hidden group">
      <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-brand/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {icon && <div className="text-brand/80">{icon}</div>}
      </div>
      <div className="relative flex items-baseline gap-2">
        <p className={`text-2xl font-semibold tabular ${toneClasses}`}>{value}</p>
        {delta && (
          <span className="text-xs font-medium text-muted-foreground">{delta}</span>
        )}
      </div>
    </div>
  );
}

export function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-border glass overflow-hidden ${className}`}>
      {(title || right) && (
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-gradient-to-r from-brand/5 to-transparent">
          {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function StockBar({ value, capacity }: { value: number; capacity: number }) {
  const pct = Math.min(100, (value / capacity) * 100);
  const color =
    pct < 10 ? "bg-critical" : pct < 30 ? "bg-warning" : pct > 95 ? "bg-brand" : "bg-success";
  return (
    <div className="flex items-center gap-2 w-full min-w-[120px]">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] tabular text-muted-foreground w-9 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export function StatusPill({ status }: { status: "optimal" | "low" | "critical" | "overstock" }) {
  const map = {
    optimal: "bg-success-soft text-success",
    low: "bg-warning-soft text-warning",
    critical: "bg-critical-soft text-critical",
    overstock: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${map[status]}`}>
      {status}
    </span>
  );
}
```

---

## 5. Hooks (auth, tenant, realtime data, simulator state)

### `src/hooks/use-auth.ts`

```ts
import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}
```

### `src/hooks/use-current-org.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CurrentOrg {
  id: string;
  name: string;
  role: "owner" | "manager" | "staff";
}

async function fetchCurrentOrg(): Promise<CurrentOrg | null> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_org_id")
    .eq("id", uid)
    .maybeSingle();

  let orgId: string | null = (profile as any)?.current_org_id ?? null;

  if (!orgId) {
    const { data: mem } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", uid)
      .limit(1)
      .maybeSingle();
    orgId = (mem as any)?.org_id ?? null;
    if (orgId) {
      await supabase.from("profiles").upsert({ id: uid, current_org_id: orgId });
    }
  }

  if (!orgId) return null;

  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from("organizations").select("id, name").eq("id", orgId).maybeSingle(),
    supabase
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", uid)
      .maybeSingle(),
  ]);
  if (!org) return null;
  return {
    id: (org as any).id,
    name: (org as any).name,
    role: ((member as any)?.role ?? "staff") as CurrentOrg["role"],
  };
}

export function useCurrentOrg() {
  return useQuery({ queryKey: ["current-org"], queryFn: fetchCurrentOrg });
}
```

### `src/hooks/use-products.ts`

```ts
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Supplier } from "@/lib/inventory-data";

export function useProducts(orgId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["products", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("org_id", orgId!)
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  });

  useEffect(() => {
    if (!orgId) return;
    // Unique channel name per hook instance — reusing `products-${orgId}` across
    // multiple mounts hits the same channel and `.on()` fails after `.subscribe()`.
    const channelName = `products-${orgId}-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products", filter: `org_id=eq.${orgId}` },
        () => qc.invalidateQueries({ queryKey: ["products", orgId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, qc]);

  return query;
}

export function useSuppliers(orgId: string | undefined) {
  return useQuery({
    queryKey: ["suppliers", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<Supplier[]> => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("org_id", orgId!)
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as Supplier[];
    },
  });
}
```

### `src/hooks/use-simulator.ts`

```ts
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Demo simulator: fires random small sales every few seconds so the
// dashboard visibly ticks during a pitch.
export function useSimulator(orgId: string | undefined) {
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running || !orgId) {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      return;
    }
    async function tick() {
      const { data: products } = await supabase
        .from("products")
        .select("id, stock")
        .eq("org_id", orgId!)
        .gt("stock", 0)
        .limit(50);
      const pool = (products ?? []) as { id: string; stock: number }[];
      if (!pool.length) return;
      const target = pool[Math.floor(Math.random() * pool.length)];
      const qty = Math.max(1, Math.min(target.stock, Math.ceil(Math.random() * 3)));
      await supabase.from("stock_movements").insert({
        org_id: orgId!,
        product_id: target.id,
        type: "sale",
        qty,
        note: "sim",
      });
    }
    timer.current = setInterval(tick, 2500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running, orgId]);

  return { running, toggle: () => setRunning((v) => !v) };
}
```

### `src/hooks/use-mobile.tsx`

```tsx
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

---

## 6. Domain logic: inventory model & simulation engine

### `src/lib/inventory-data.ts`

```ts
// Shared types + helpers. Real data lives in Supabase; this file
// keeps the shared TS types and a couple of static demo constants
// (demand forecast chart is illustrative).

export type StockStatus = "optimal" | "low" | "critical" | "overstock";

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  department: string | null;
  aisle: string | null;
  stock: number;
  capacity: number;
  velocity: "High" | "Medium" | "Low";
  demand_trend: number;
  expires_at: string | null;
  last_received: string | null;
  unit_cost: number;
  supplier_id: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  category: string | null;
  status: string;
  next_delivery: string | null;
  on_time_rate: number;
}

export function statusOf(p: Product): StockStatus {
  if (p.capacity <= 0) return "optimal";
  const pct = p.stock / p.capacity;
  if (pct < 0.1) return "critical";
  if (pct < 0.3) return "low";
  if (pct > 0.95 && p.demand_trend < 0) return "overstock";
  return "optimal";
}

export function hoursUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 3_600_000));
}

export const demandForecast = [
  { day: "Mon", actual: 420, predicted: 410 },
  { day: "Tue", actual: 385, predicted: 400 },
  { day: "Wed", actual: 445, predicted: 430 },
  { day: "Thu", actual: 510, predicted: 495 },
  { day: "Fri", actual: 620, predicted: 600 },
  { day: "Sat", actual: 780, predicted: 750 },
  { day: "Sun", actual: 690, predicted: 680 },
  { day: "Mon", actual: null, predicted: 460 },
  { day: "Tue", actual: null, predicted: 440 },
  { day: "Wed", actual: null, predicted: 520 },
  { day: "Thu", actual: null, predicted: 610 },
  { day: "Fri", actual: null, predicted: 820 },
  { day: "Sat", actual: null, predicted: 940 },
  { day: "Sun", actual: null, predicted: 870 },
];

export interface Recommendation {
  id: string;
  product: Product;
  quantity: number;
  estCost: number;
  reason: string;
  confidence: number;
  urgency: "high" | "medium" | "low";
}

// Derive AI-style recommendations from live products.
export function buildRecommendations(products: Product[]): Recommendation[] {
  return products
    .map((p) => {
      const pct = p.capacity > 0 ? p.stock / p.capacity : 1;
      const hrs = hoursUntil(p.expires_at);
      let urgency: Recommendation["urgency"] | null = null;
      let reason = "";
      let confidence = 80;
      let quantity = 0;
      if (pct < 0.1) {
        urgency = "high";
        reason = "Stockout risk within 24-48h at current velocity.";
        confidence = 92;
        quantity = Math.max(20, Math.round(p.capacity * 0.6));
      } else if (pct < 0.3 && p.demand_trend > 0) {
        urgency = "medium";
        reason = `Demand trending +${p.demand_trend}% — pre-position stock.`;
        confidence = 87;
        quantity = Math.round(p.capacity * 0.5);
      } else if (p.demand_trend > 15) {
        urgency = "medium";
        reason = `Surge detected (+${p.demand_trend}%). Meet 7-day demand.`;
        confidence = 89;
        quantity = Math.round(p.capacity * 0.4);
      } else if (pct > 0.95 && p.demand_trend < -5) {
        urgency = "low";
        reason = `Reduce next order — trailing demand ${p.demand_trend}%.`;
        confidence = 82;
        quantity = 0;
      }
      if (!urgency) return null;
      return {
        id: `rec-${p.id}`,
        product: p,
        quantity,
        estCost: +(quantity * Number(p.unit_cost)).toFixed(2),
        reason,
        confidence,
        urgency,
      } satisfies Recommendation;
    })
    .filter((r): r is Recommendation => r !== null)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.urgency] - order[b.urgency];
    });
}
```

### `src/lib/simulation.ts`

```ts
// Deterministic, read-only projection models used by the What-If Simulator
// and the Inventory Stress Test. Nothing here writes to the database —
// every function is a pure projection over the live product rows.

import type { Product } from "./inventory-data";

export const DEFAULT_MARGIN = 0.28; // retail markup over unit cost
export const STORAGE_COST_PER_UNIT_DAY = 0.35; // currency units

const VELOCITY_FACTOR: Record<Product["velocity"], number> = {
  High: 0.16,
  Medium: 0.09,
  Low: 0.04,
};

/** Baseline units sold per day for a SKU, derived from velocity + trend. */
export function dailyDemand(p: Product, demandMultiplier = 1): number {
  const base = Math.max(1, (p.capacity || 50) * VELOCITY_FACTOR[p.velocity ?? "Medium"]);
  const trend = 1 + Number(p.demand_trend ?? 0) / 100;
  return +(base * trend * demandMultiplier).toFixed(2);
}

export function daysUntilExpiry(p: Product): number | null {
  if (!p.expires_at) return null;
  const d = (new Date(p.expires_at).getTime() - Date.now()) / 86_400_000;
  return Math.max(0, +d.toFixed(1));
}

export function daysToStockout(p: Product, demandMultiplier = 1): number {
  const d = dailyDemand(p, demandMultiplier);
  if (d <= 0) return Infinity;
  return +(p.stock / d).toFixed(1);
}

export interface SimInput {
  product: Product;
  orderQty: number;
  horizonDays: number;
  margin?: number;
  demandMultiplier?: number;
  /** Days before the incoming order actually lands on the shelf. */
  leadTimeDays?: number;
  /** 0..1 reduction of usable storage capacity. */
  capacityLoss?: number;
  /** Multiplier on spoilage speed (1 = normal cold chain). */
  spoilageMultiplier?: number;
}

export interface SimResult {
  expectedDemand: number;
  unitsSold: number;
  leftover: number;
  stockoutDays: number;
  expiredUnits: number;
  expiryRisk: number; // %
  storageUtilisation: number; // % of capacity at peak
  storageDelta: number; // percentage points vs today
  storageCost: number;
  revenue: number;
  wasteCost: number;
  profit: number;
  verdict: "under" | "balanced" | "over";
  curve: { day: number; stock: number; demand: number }[];
}

export function simulate(input: SimInput): SimResult {
  const {
    product: p,
    orderQty,
    horizonDays,
    margin = DEFAULT_MARGIN,
    demandMultiplier = 1,
    leadTimeDays = 0,
    capacityLoss = 0,
    spoilageMultiplier = 1,
  } = input;

  const perDay = dailyDemand(p, demandMultiplier);
  const unitCost = Number(p.unit_cost ?? 0) || 1;
  const price = unitCost * (1 + margin);
  const usableCapacity = Math.max(1, Math.round((p.capacity || orderQty + p.stock) * (1 - capacityLoss)));
  const expiryDay = daysUntilExpiry(p);
  const effectiveExpiryDay = expiryDay === null ? null : expiryDay / Math.max(0.1, spoilageMultiplier);

  let stock = p.stock;
  let sold = 0;
  let stockoutDays = 0;
  let expired = 0;
  let peakStock = stock;
  let storageUnitDays = 0;
  const curve: SimResult["curve"] = [];

  for (let day = 1; day <= horizonDays; day++) {
    if (day === Math.max(1, Math.ceil(leadTimeDays) || 1) && orderQty > 0) {
      stock += orderQty;
    }
    // Expiry write-off: everything still on hand past the expiry point spoils.
    if (effectiveExpiryDay !== null && day > effectiveExpiryDay && stock > 0) {
      expired += stock;
      stock = 0;
    }
    const demandToday = perDay;
    const soldToday = Math.min(stock, demandToday);
    sold += soldToday;
    stock = +(stock - soldToday).toFixed(2);
    if (soldToday < demandToday - 0.01) stockoutDays++;
    peakStock = Math.max(peakStock, stock);
    storageUnitDays += Math.max(0, stock);
    curve.push({ day, stock: Math.round(stock), demand: Math.round(demandToday) });
  }

  const expectedDemand = +(perDay * horizonDays).toFixed(0);
  const leftover = Math.round(stock);
  const revenue = +(sold * price).toFixed(0);
  const wasteCost = +(expired * unitCost).toFixed(0);
  const storageCost = +(storageUnitDays * STORAGE_COST_PER_UNIT_DAY).toFixed(0);
  const cogs = +(sold * unitCost).toFixed(0);
  const profit = +(revenue - cogs - wasteCost - storageCost).toFixed(0);
  const totalUnits = p.stock + orderQty;
  const expiryRisk = totalUnits > 0 ? +((expired / totalUnits) * 100).toFixed(1) : 0;
  const storageUtilisation = +((peakStock / usableCapacity) * 100).toFixed(0);
  const todayUtilisation = p.capacity > 0 ? (p.stock / p.capacity) * 100 : 0;

  const fillRate = expectedDemand > 0 ? sold / expectedDemand : 1;
  const verdict: SimResult["verdict"] =
    fillRate < 0.92 ? "under" : leftover > expectedDemand * 0.55 || expiryRisk > 10 ? "over" : "balanced";

  return {
    expectedDemand,
    unitsSold: Math.round(sold),
    leftover,
    stockoutDays,
    expiredUnits: Math.round(expired),
    expiryRisk,
    storageUtilisation,
    storageDelta: +(storageUtilisation - todayUtilisation).toFixed(0),
    storageCost,
    revenue,
    wasteCost,
    profit,
    verdict,
    curve,
  };
}

/** Suggested order quantity that roughly covers horizon demand up to capacity. */
export function suggestedQty(p: Product, horizonDays: number): number {
  const need = dailyDemand(p) * horizonDays - p.stock;
  const cap = Math.max(0, (p.capacity || 0) - p.stock);
  return Math.max(0, Math.round(Math.min(Math.max(need, 0), cap || need)));
}

// ---------------------------------------------------------------- stress test

export type ScenarioId =
  | "demand_drop"
  | "demand_surge"
  | "supplier_delay"
  | "capacity_loss"
  | "cold_chain";

export interface ScenarioState {
  id: ScenarioId;
  enabled: boolean;
  severity: number; // 0..100, meaning depends on scenario
}

export const SCENARIOS: {
  id: ScenarioId;
  label: string;
  blurb: string;
  unit: string;
  defaultSeverity: number;
  mitigation: string;
}[] = [
  {
    id: "demand_drop",
    label: "Demand collapse",
    blurb: "Footfall falls — slow movers pile up and expiry losses spike.",
    unit: "% drop in demand",
    defaultSeverity: 30,
    mitigation: "Cut open orders, run markdowns on short-dated stock, shift to consignment where possible.",
  },
  {
    id: "demand_surge",
    label: "Demand surge",
    blurb: "Storm watch, payday or a viral item drives demand far above plan.",
    unit: "% lift in demand",
    defaultSeverity: 50,
    mitigation: "Pre-position fast movers, raise reorder points, secure a backup supplier for top SKUs.",
  },
  {
    id: "supplier_delay",
    label: "Supplier delay",
    blurb: "Deliveries land late — cover has to stretch across extra days.",
    unit: "days delayed",
    defaultSeverity: 3,
    mitigation: "Hold buffer stock on high-velocity SKUs and split volume across two suppliers.",
  },
  {
    id: "capacity_loss",
    label: "Storage capacity loss",
    blurb: "Backroom or chiller space is out of action.",
    unit: "% capacity lost",
    defaultSeverity: 20,
    mitigation: "Move to smaller, more frequent deliveries and de-list overstocked slow movers.",
  },
  {
    id: "cold_chain",
    label: "Cold-chain failure",
    blurb: "Refrigeration underperforms — perishables spoil faster.",
    unit: "× faster spoilage",
    defaultSeverity: 60,
    mitigation: "Prioritise perishables for immediate markdown and trigger maintenance escalation.",
  },
];

export interface StressFactors {
  demandMultiplier: number;
  leadTimeDays: number;
  capacityLoss: number;
  spoilageMultiplier: number;
}

export function factorsFrom(states: ScenarioState[]): StressFactors {
  const f: StressFactors = {
    demandMultiplier: 1,
    leadTimeDays: 0,
    capacityLoss: 0,
    spoilageMultiplier: 1,
  };
  for (const s of states) {
    if (!s.enabled) continue;
    if (s.id === "demand_drop") f.demandMultiplier *= 1 - s.severity / 100;
    if (s.id === "demand_surge") f.demandMultiplier *= 1 + s.severity / 100;
    if (s.id === "supplier_delay") f.leadTimeDays += s.severity;
    if (s.id === "capacity_loss") f.capacityLoss = Math.min(0.9, f.capacityLoss + s.severity / 100);
    if (s.id === "cold_chain") f.spoilageMultiplier *= 1 + s.severity / 100;
  }
  f.demandMultiplier = Math.max(0.05, +f.demandMultiplier.toFixed(3));
  return f;
}

export interface SkuImpact {
  product: Product;
  before: SimResult;
  after: SimResult;
  stockoutDays: number;
  wasteDelta: number;
  profitDelta: number;
  riskScore: number;
}

export interface StressReport {
  horizonDays: number;
  stockouts: number;
  overstocked: number;
  wasteValue: number;
  revenueAtRisk: number;
  storageOverflow: number;
  resilience: number;
  radar: { axis: string; score: number }[];
  impacts: SkuImpact[];
}

export function runStressTest(
  products: Product[],
  states: ScenarioState[],
  horizonDays = 14,
): StressReport {
  const f = factorsFrom(states);
  const impacts: SkuImpact[] = products.map((product) => {
    const qty = suggestedQty(product, horizonDays);
    const before = simulate({ product, orderQty: qty, horizonDays });
    const after = simulate({
      product,
      orderQty: qty,
      horizonDays,
      demandMultiplier: f.demandMultiplier,
      leadTimeDays: f.leadTimeDays,
      capacityLoss: f.capacityLoss,
      spoilageMultiplier: f.spoilageMultiplier,
    });
    const wasteDelta = after.wasteCost - before.wasteCost;
    const profitDelta = after.profit - before.profit;
    const riskScore =
      after.stockoutDays * 6 + after.expiryRisk * 1.5 + Math.max(0, -profitDelta) / 200;
    return { product, before, after, stockoutDays: after.stockoutDays, wasteDelta, profitDelta, riskScore };
  });

  const stockouts = impacts.filter((i) => i.after.stockoutDays > 0).length;
  const overstocked = impacts.filter((i) => i.after.storageUtilisation > 95).length;
  const wasteValue = impacts.reduce((s, i) => s + i.after.wasteCost, 0);
  const revenueAtRisk = impacts.reduce((s, i) => s + Math.max(0, i.before.revenue - i.after.revenue), 0);
  const storageOverflow = impacts.filter((i) => i.after.storageUtilisation > 100).length;

  const n = Math.max(1, impacts.length);
  const availability = clamp(100 - (stockouts / n) * 140);
  const wasteScore = clamp(100 - (impacts.reduce((s, i) => s + i.after.expiryRisk, 0) / n) * 4);
  const storageScore = clamp(100 - (overstocked / n) * 160);
  const revenueScore = clamp(
    100 - (revenueAtRisk / Math.max(1, impacts.reduce((s, i) => s + i.before.revenue, 0))) * 200,
  );
  const replenishScore = clamp(100 - f.leadTimeDays * 9 - (f.demandMultiplier > 1 ? (f.demandMultiplier - 1) * 55 : 0));

  const radar = [
    { axis: "Availability", score: availability },
    { axis: "Waste", score: wasteScore },
    { axis: "Storage", score: storageScore },
    { axis: "Revenue", score: revenueScore },
    { axis: "Replenishment", score: replenishScore },
  ];
  const resilience = Math.round(radar.reduce((s, r) => s + r.score, 0) / radar.length);

  return {
    horizonDays,
    stockouts,
    overstocked,
    wasteValue: Math.round(wasteValue),
    revenueAtRisk: Math.round(revenueAtRisk),
    storageOverflow,
    resilience,
    radar,
    impacts: impacts.sort((a, b) => b.riskScore - a.riskScore),
  };
}

function clamp(v: number): number {
  return Math.round(Math.max(0, Math.min(100, v)));
}

export function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
```

### `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
