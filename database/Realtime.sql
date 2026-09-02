-- =========================================================
-- realtime.sql
-- Supabase Realtime configuration
-- =========================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.stock_movements REPLICA IDENTITY FULL;
