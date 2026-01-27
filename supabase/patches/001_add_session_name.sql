-- Add session_name to sales_orders (treat sales_orders as stream/session container for MVP)
alter table public.sales_orders add column if not exists session_name text;

-- Optional: backfill from existing data if you were using platform/order naming
-- update public.sales_orders set session_name = coalesce(session_name, platform);
