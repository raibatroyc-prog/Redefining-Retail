# Redefining Retail — Backend Code
Backend of the Smart Inventory & Expiry Management System: Supabase PostgreSQL (schema, GRANTs, Row-Level Security, functions, triggers, realtime) plus the TanStack Start server/auth integration layer.

---

## 1. Database schema, GRANTs, RLS policies, functions & triggers (SQL migrations)

### `supabase/migrations/20260710062640_721ab948-bc18-4cac-ac18-21a201dcf87e.sql`

```sql

-- ENUMS
CREATE TYPE public.org_role AS ENUM ('owner', 'manager', 'staff');
CREATE TYPE public.stock_movement_type AS ENUM ('sale', 'receipt', 'waste', 'adjustment');
CREATE TYPE public.po_status AS ENUM ('draft', 'sent', 'received', 'cancelled');
CREATE TYPE public.alert_kind AS ENUM ('low_stock', 'expiring', 'stockout');
CREATE TYPE public.velocity AS ENUM ('High', 'Medium', 'Low');

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'trial',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_orgs_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PROFILES (per-user)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  current_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ORG MEMBERSHIP (role per org)
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
GRANT ALL ON public.org_members TO service_role;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER helpers (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_org_member(_org UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members WHERE org_id = _org AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_org UUID, _roles public.org_role[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = _org AND user_id = auth.uid() AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT current_org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Orgs policies
CREATE POLICY "members view org" ON public.organizations FOR SELECT TO authenticated USING (public.is_org_member(id));
CREATE POLICY "any auth create org" ON public.organizations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "owners update org" ON public.organizations FOR UPDATE TO authenticated USING (public.has_org_role(id, ARRAY['owner']::public.org_role[]));

-- Members policies
CREATE POLICY "view own memberships" ON public.org_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_org_member(org_id));
CREATE POLICY "owners manage members" ON public.org_members FOR ALL TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner']::public.org_role[]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner']::public.org_role[]));
CREATE POLICY "self insert first membership" ON public.org_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- SUPPLIERS
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  contact_email TEXT,
  on_time_rate NUMERIC(5,2) DEFAULT 100,
  status TEXT DEFAULT 'on-time',
  next_delivery TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "members read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "managers write suppliers" ON public.suppliers FOR ALL TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','manager']::public.org_role[]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner','manager']::public.org_role[]));

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  department TEXT,
  aisle TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 0,
  velocity public.velocity DEFAULT 'Medium',
  demand_trend NUMERIC(6,2) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  last_received TIMESTAMPTZ,
  unit_cost NUMERIC(10,2) DEFAULT 0,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, sku)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "members read products" ON public.products FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "staff+ write products" ON public.products FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));
CREATE INDEX idx_products_org ON public.products(org_id);
CREATE INDEX idx_products_dept ON public.products(org_id, department);

-- STOCK MOVEMENTS
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type public.stock_movement_type NOT NULL,
  qty INTEGER NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read movements" ON public.stock_movements FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write movements" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id));
CREATE INDEX idx_movements_product ON public.stock_movements(product_id, created_at DESC);

-- Trigger: apply stock delta on movement insert
CREATE OR REPLACE FUNCTION public.apply_stock_movement() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE delta INTEGER;
BEGIN
  IF NEW.type IN ('receipt','adjustment') THEN delta := NEW.qty;
  ELSE delta := -NEW.qty;
  END IF;
  UPDATE public.products
    SET stock = GREATEST(0, stock + delta),
        last_received = CASE WHEN NEW.type = 'receipt' THEN now() ELSE last_received END
    WHERE id = NEW.product_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_apply_movement AFTER INSERT ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

-- PURCHASE ORDERS
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  status public.po_status NOT NULL DEFAULT 'draft',
  total NUMERIC(12,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_po_updated BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "members read po" ON public.purchase_orders FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "managers write po" ON public.purchase_orders FOR ALL TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','manager']::public.org_role[]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner','manager']::public.org_role[]));

CREATE TABLE public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_items TO authenticated;
GRANT ALL ON public.purchase_order_items TO service_role;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read po items" ON public.purchase_order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.purchase_orders p WHERE p.id = po_id AND public.is_org_member(p.org_id)));
CREATE POLICY "managers write po items" ON public.purchase_order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.purchase_orders p WHERE p.id = po_id AND public.has_org_role(p.org_id, ARRAY['owner','manager']::public.org_role[])))
  WITH CHECK (EXISTS (SELECT 1 FROM public.purchase_orders p WHERE p.id = po_id AND public.has_org_role(p.org_id, ARRAY['owner','manager']::public.org_role[])));

-- Handle new user: create profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC: create organization + owner membership atomically
CREATE OR REPLACE FUNCTION public.create_organization(_name TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_org UUID;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.organizations (name, created_by) VALUES (_name, auth.uid()) RETURNING id INTO new_org;
  INSERT INTO public.org_members (org_id, user_id, role) VALUES (new_org, auth.uid(), 'owner');
  UPDATE public.profiles SET current_org_id = new_org WHERE id = auth.uid();
  RETURN new_org;
END; $$;

-- RPC: seed demo data for an org
CREATE OR REPLACE FUNCTION public.seed_demo_data(_org UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s_midwest UUID; s_pg UUID; s_niagara UUID; s_fresh UUID; s_bimbo UUID; s_ocean UUID;
BEGIN
  IF NOT public.has_org_role(_org, ARRAY['owner','manager']::public.org_role[]) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO public.suppliers (org_id, name, category, status, next_delivery, on_time_rate) VALUES
    (_org,'Midwest Fresh Distribution','Dairy & Produce','on-time','Today 14:30',98) RETURNING id INTO s_midwest;
  INSERT INTO public.suppliers (org_id, name, category, status, next_delivery, on_time_rate) VALUES
    (_org,'Procter & Gamble','Household','delayed','Tomorrow 09:00 (+2h)',92) RETURNING id INTO s_pg;
  INSERT INTO public.suppliers (org_id, name, category, status, next_delivery, on_time_rate) VALUES
    (_org,'Niagara Bottling','Grocery / Beverages','pending','Awaiting confirmation',95) RETURNING id INTO s_niagara;
  INSERT INTO public.suppliers (org_id, name, category, status, next_delivery, on_time_rate) VALUES
    (_org,'Fresh Co','Produce','on-time','Today 16:00',97) RETURNING id INTO s_fresh;
  INSERT INTO public.suppliers (org_id, name, category, status, next_delivery, on_time_rate) VALUES
    (_org,'Bimbo Bakeries','Bakery','on-time','Daily 04:00',99) RETURNING id INTO s_bimbo;
  INSERT INTO public.suppliers (org_id, name, category, status, next_delivery, on_time_rate) VALUES
    (_org,'Ocean Fresh','Seafood','on-time','Tomorrow 05:30',93) RETURNING id INTO s_ocean;

  INSERT INTO public.products (org_id, sku, name, brand, department, aisle, stock, capacity, velocity, demand_trend, expires_at, unit_cost, supplier_id, last_received) VALUES
    (_org,'882-0192','Great Value Frozen Mixed Berries','Great Value','Frozen','F-3',312,400,'High',12.4,NULL,4.20,s_midwest, now() - interval '1 day'),
    (_org,'110-3942','Wonder Bread Classic White','Wonder','Bakery','B-1',18,80,'High',3.1, now() + interval '42 hours',2.10,s_bimbo, now() - interval '4 hours'),
    (_org,'554-0012','Sparkle Paper Towels (6ct)','Sparkle','Household','H-8',190,200,'Medium',-2.1,NULL,8.75,s_pg, now() - interval '3 days'),
    (_org,'829-WF-012','Organic Whole Milk (1 Gal)','Great Value Organic','Dairy','D-4',14,60,'High',8.2, now() + interval '12 hours',5.40,s_midwest, now() - interval '3 hours'),
    (_org,'104-AP-993','Honeycrisp Apples (3lb Bag)','Fresh Co','Produce','P-1',2,40,'High',15.4, now() + interval '96 hours',4.99,s_fresh, now() - interval '2 days'),
    (_org,'550-DL-701','Rotisserie Chicken (Hot)','Marketside','Deli','DL-1',8,24,'High',22.0, now() + interval '4 hours',6.98,NULL, now() - interval '1 hour'),
    (_org,'GV-BW-24','Great Value Bottled Water (24pk)','Great Value','Grocery','G-12',42,500,'High',25.0,NULL,3.98,s_niagara, now() - interval '1 day'),
    (_org,'EQ-IBU-200','Equate Ibuprofen (200ct)','Equate','Pharmacy','PH-2',12,80,'Medium',4.2,NULL,7.44,NULL, now() - interval '5 days'),
    (_org,'BOU-SA-12','Bounty Select-A-Size (12ct)','Bounty','Household','H-9',24,150,'High',6.7,NULL,22.50,s_pg, now() - interval '4 days'),
    (_org,'MK-FS-004','Fresh Atlantic Salmon Fillets','Marketside','Deli','DL-3',14,20,'Medium',-8.0, now() + interval '6 hours',12.50,s_ocean, now() - interval '2 hours'),
    (_org,'GV-EGG-DZ','Great Value Large Eggs (Dozen)','Great Value','Dairy','D-2',220,240,'High',5.5, now() + interval '10 days',3.24,s_midwest, now() - interval '1 day'),
    (_org,'PR-AVC-220','Hass Avocados (Bulk)','Fresh Co','Produce','P-2',240,300,'High',2.1, now() + interval '5 days',1.24,s_fresh, now() - interval '1 day');
END; $$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.stock_movements REPLICA IDENTITY FULL;
```

### `supabase/migrations/20260828044544_feedb159-ab78-41bc-a07e-df2ebb6ec875.sql`

```sql
-- Lock down SECURITY DEFINER helpers that should never be callable via the API
REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, public.org_role[]) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.current_org_id() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- RPCs that must stay callable, but only by signed-in users
REVOKE ALL ON FUNCTION public.create_organization(text) FROM anon, public;
REVOKE ALL ON FUNCTION public.seed_demo_data(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_organization(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_demo_data(uuid) TO authenticated;

-- Prevent self-granted owner/manager membership in arbitrary organizations
DROP POLICY IF EXISTS "self insert first membership" ON public.org_members;
CREATE POLICY "self insert first membership"
ON public.org_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'owner'::public.org_role
  AND EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = org_members.org_id
      AND o.created_by = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.org_id = org_members.org_id
  )
);
```

### `supabase/migrations/20260828044609_1d5eb094-934e-4e83-98b8-bf7b5a55f3c5.sql`

```sql
REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, public.org_role[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_org_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, public.org_role[]) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.current_org_id() FROM anon, authenticated;
```

### `supabase/config.toml`

```toml
project_id = "lxadpcxsurpscnckuwfh"
```

---

## 2. Server runtime & auth layer

### `src/server.ts`

```ts
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
```

### `src/start.ts`

```ts
import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
```

### `src/integrations/supabase/auth-middleware.ts`

```ts
// This file is automatically generated. Do not edit it directly.
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'



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

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      const missing = [
        ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
        ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
      ];
      const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
      console.error(`[Supabase] ${message}`);
      throw new Error(message);
    }
    
    const request = getRequest();

    if (!request?.headers) {
      throw new Error('Unauthorized: No request headers available');
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      throw new Error('Unauthorized: No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Only Bearer tokens are supported');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    if (token.split('.').length !== 3) {
      throw new Error('Unauthorized: Invalid token');
    }

    const supabase = createClient<Database>(
      SUPABASE_URL!,
      SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY!),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Error('Unauthorized: Invalid token');
    }

    if (!data.claims.sub) {
      throw new Error('Unauthorized: No user ID found in token');
    }

    return next({
      context: {
        supabase,
        userId: data.claims.sub,
        claims: data.claims,
      },
    });
  },
);
```

### `src/integrations/supabase/auth-attacher.ts`

```ts
// This file is automatically generated. Do not edit it directly.
import { createMiddleware } from '@tanstack/react-start'
import { supabase } from './client'

// Must be registered as a global `functionMiddleware` in `src/start.ts`; otherwise
// the browser never attaches the bearer token to serverFn RPCs.
export const attachSupabaseAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },
)
```

### `src/integrations/supabase/client.server.ts`

```ts
// This file is automatically generated. Do not edit it directly.
// Server-side Supabase client with service role key - bypasses RLS.
// Use this for admin operations in server functions and server routes only.
// For user-authenticated queries (with RLS), use the auth middleware instead.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

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

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_SERVICE_ROLE_KEY ? ['SUPABASE_SERVICE_ROLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_SERVICE_ROLE_KEY),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

// Server-side Supabase client with service role - bypasses RLS
// SECURITY: Only use this for trusted server-side operations, never expose to client code
// Load inside server handlers: const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
// Top-level import is safe only in other .server.ts modules - route files and *.functions.ts ship to the client bundle.
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});
```

### `src/integrations/lovable/index.ts`

```ts
// This file is auto-generated by Lovable. Do not modify it.

import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "../supabase/client";
const lovableAuth = createLovableAuth();

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams,
        },
      });

      if (result.redirected) {
        return result;
      }

      if (result.error) {
        return result;
      }

      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    },
  },
};
```

---

## 3. Generated database types (contract shared with the frontend)

### `src/integrations/supabase/types.ts`

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          plan: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          plan?: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          plan?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          aisle: string | null
          brand: string | null
          capacity: number
          created_at: string
          demand_trend: number | null
          department: string | null
          expires_at: string | null
          id: string
          last_received: string | null
          name: string
          org_id: string
          sku: string
          stock: number
          supplier_id: string | null
          unit_cost: number | null
          updated_at: string
          velocity: Database["public"]["Enums"]["velocity"] | null
        }
        Insert: {
          aisle?: string | null
          brand?: string | null
          capacity?: number
          created_at?: string
          demand_trend?: number | null
          department?: string | null
          expires_at?: string | null
          id?: string
          last_received?: string | null
          name: string
          org_id: string
          sku: string
          stock?: number
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string
          velocity?: Database["public"]["Enums"]["velocity"] | null
        }
        Update: {
          aisle?: string | null
          brand?: string | null
          capacity?: number
          created_at?: string
          demand_trend?: number | null
          department?: string | null
          expires_at?: string | null
          id?: string
          last_received?: string | null
          name?: string
          org_id?: string
          sku?: string
          stock?: number
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string
          velocity?: Database["public"]["Enums"]["velocity"] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_org_id: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_org_id?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_org_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_org_id_fkey"
            columns: ["current_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          po_id: string
          product_id: string
          qty: number
          unit_cost: number
        }
        Insert: {
          id?: string
          po_id: string
          product_id: string
          qty: number
          unit_cost?: number
        }
        Update: {
          id?: string
          po_id?: string
          product_id?: string
          qty?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          org_id: string
          status: Database["public"]["Enums"]["po_status"]
          supplier_id: string | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          org_id: string
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          org_id?: string
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          note: string | null
          org_id: string
          product_id: string
          qty: number
          type: Database["public"]["Enums"]["stock_movement_type"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          org_id: string
          product_id: string
          qty: number
          type: Database["public"]["Enums"]["stock_movement_type"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          org_id?: string
          product_id?: string
          qty?: number
          type?: Database["public"]["Enums"]["stock_movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          category: string | null
          contact_email: string | null
          created_at: string
          id: string
          name: string
          next_delivery: string | null
          on_time_rate: number | null
          org_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          next_delivery?: string | null
          on_time_rate?: number | null
          org_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          next_delivery?: string | null
          on_time_rate?: number | null
          org_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization: { Args: { _name: string }; Returns: string }
      current_org_id: { Args: never; Returns: string }
      has_org_role: {
        Args: {
          _org: string
          _roles: Database["public"]["Enums"]["org_role"][]
        }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string }; Returns: boolean }
      seed_demo_data: { Args: { _org: string }; Returns: undefined }
    }
    Enums: {
      alert_kind: "low_stock" | "expiring" | "stockout"
      org_role: "owner" | "manager" | "staff"
      po_status: "draft" | "sent" | "received" | "cancelled"
      stock_movement_type: "sale" | "receipt" | "waste" | "adjustment"
      velocity: "High" | "Medium" | "Low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_kind: ["low_stock", "expiring", "stockout"],
      org_role: ["owner", "manager", "staff"],
      po_status: ["draft", "sent", "received", "cancelled"],
      stock_movement_type: ["sale", "receipt", "waste", "adjustment"],
      velocity: ["High", "Medium", "Low"],
    },
  },
} as const
```
