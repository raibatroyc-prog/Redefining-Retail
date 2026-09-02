-- =====================================================================
-- policies.sql
-- Smart Stock Savvy — GRANTs & Row-Level Security policies
-- Reference copy only. The Supabase CLI applies migrations/*.sql in
-- order — this file is for readability when browsing the repo.
-- =====================================================================

-- ---------- GRANTs ----------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
GRANT ALL ON public.org_members TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_items TO authenticated;
GRANT ALL ON public.purchase_order_items TO service_role;

-- ---------- ENABLE RLS ----------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- ---------- Profiles policies ----------
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- ---------- Organizations policies ----------
CREATE POLICY "members view org" ON public.organizations FOR SELECT TO authenticated USING (public.is_org_member(id));
CREATE POLICY "any auth create org" ON public.organizations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "owners update org" ON public.organizations FOR UPDATE TO authenticated USING (public.has_org_role(id, ARRAY['owner']::public.org_role[]));

-- ---------- Members policies ----------
CREATE POLICY "view own memberships" ON public.org_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_org_member(org_id));
CREATE POLICY "owners manage members" ON public.org_members FOR ALL TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner']::public.org_role[]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner']::public.org_role[]));

-- Hardened version (final state after the 2026-08-28 migration):
-- only allow a user to insert themselves as 'owner' of an org they created,
-- and only if that org has no members yet.
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

-- ---------- Suppliers policies ----------
CREATE POLICY "members read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "managers write suppliers" ON public.suppliers FOR ALL TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','manager']::public.org_role[]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner','manager']::public.org_role[]));

-- ---------- Products policies ----------
CREATE POLICY "members read products" ON public.products FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "staff+ write products" ON public.products FOR ALL TO authenticated
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

-- ---------- Stock movements policies ----------
CREATE POLICY "members read movements" ON public.stock_movements FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members write movements" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id));

-- ---------- Purchase orders policies ----------
CREATE POLICY "members read po" ON public.purchase_orders FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "managers write po" ON public.purchase_orders FOR ALL TO authenticated
  USING (public.has_org_role(org_id, ARRAY['owner','manager']::public.org_role[]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner','manager']::public.org_role[]));

CREATE POLICY "members read po items" ON public.purchase_order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.purchase_orders p WHERE p.id = po_id AND public.is_org_member(p.org_id)));
CREATE POLICY "managers write po items" ON public.purchase_order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.purchase_orders p WHERE p.id = po_id AND public.has_org_role(p.org_id, ARRAY['owner','manager']::public.org_role[])))
  WITH CHECK (EXISTS (SELECT 1 FROM public.purchase_orders p WHERE p.id = po_id AND public.has_org_role(p.org_id, ARRAY['owner','manager']::public.org_role[])));
