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
