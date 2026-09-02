REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, public.org_role[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_org_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_org_role(uuid, public.org_role[]) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.current_org_id() FROM anon, authenticated;
