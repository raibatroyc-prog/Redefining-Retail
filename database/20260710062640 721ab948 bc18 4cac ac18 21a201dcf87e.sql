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
