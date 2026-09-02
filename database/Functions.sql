-- =====================================================================
-- functions.sql
-- Smart Stock Savvy — Functions, triggers & RPCs
-- Reference copy only. The Supabase CLI applies migrations/*.sql in
-- order — this file is for readability when browsing the repo.
-- =====================================================================

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_orgs_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_po_updated BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

-- Trigger: apply stock delta whenever a stock_movements row is inserted
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

-- Handle new auth user: create matching profile row
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

-- RPC: seed demo data for an org (suppliers + products)
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

-- Lock down SECURITY DEFINER helpers so they are never callable directly via the API
REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, public.org_role[]) FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.current_org_id() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- RPCs that must stay callable, but only by signed-in users
REVOKE ALL ON FUNCTION public.create_organization(text) FROM anon, public;
REVOKE ALL ON FUNCTION public.seed_demo_data(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_organization(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_demo_data(uuid) TO authenticated;
