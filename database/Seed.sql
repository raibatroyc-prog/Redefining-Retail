-- =====================================================================
-- seed.sql
-- Smart Stock Savvy — Demo data loader
--
-- The actual seed logic lives in the public.seed_demo_data(_org UUID)
-- function (see functions.sql / migrations). It is defined as a
-- SECURITY DEFINER RPC rather than plain INSERT statements because it
-- needs to run under RLS as an owner/manager of a specific org, and it
-- populates supplier ids for you (s_midwest, s_pg, etc.) before
-- inserting products.
--
-- To seed demo data for an org after running the migrations:
--   1. Sign in as a user who belongs to the org as 'owner' or 'manager'
--   2. Run the line below from the Supabase SQL editor or psql,
--      replacing <ORG_UUID> with the target organizations.id
-- =====================================================================

SELECT public.seed_demo_data('<ORG_UUID>');
