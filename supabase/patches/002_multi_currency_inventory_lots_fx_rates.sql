-- 002_multi_currency_inventory_lots_fx_rates.sql
-- Adds multi-currency purchase support (USD + CNY) and an FX rate cache.

begin;

-- FX rates cache (shared)
create table if not exists public.fx_rates (
  pair text primary key,
  base_currency text not null,
  quote_currency text not null,
  rate numeric(18,8) not null,
  fetched_at timestamptz not null default now()
);

alter table public.fx_rates enable row level security;

-- Allow any authenticated user to read/write cached rates.
-- (Rates are not user data; this keeps the cache usable from the app without a service key.)
drop policy if exists "FX rates are readable by authenticated" on public.fx_rates;
create policy "FX rates are readable by authenticated" on public.fx_rates
  for select to authenticated using (true);

drop policy if exists "FX rates are writable by authenticated" on public.fx_rates;
create policy "FX rates are writable by authenticated" on public.fx_rates
  for insert to authenticated with check (true);

drop policy if exists "FX rates are updatable by authenticated" on public.fx_rates;
create policy "FX rates are updatable by authenticated" on public.fx_rates
  for update to authenticated using (true) with check (true);

-- Inventory lots: store native currency + converted USD + fx rate used.
alter table public.inventory_lots
  add column if not exists purchase_currency text not null default 'USD',
  add column if not exists fx_rate_to_usd numeric(18,8),
  add column if not exists purchase_price_total_native numeric(12,2),
  add column if not exists purchase_price_total_usd numeric(12,2),
  add column if not exists fees_total_native numeric(12,2),
  add column if not exists fees_total_usd numeric(12,2),
  add column if not exists shipping_total_native numeric(12,2),
  add column if not exists shipping_total_usd numeric(12,2);

-- Backfill existing rows (assume USD)
update public.inventory_lots
set
  purchase_currency = coalesce(purchase_currency, 'USD'),
  fx_rate_to_usd = coalesce(fx_rate_to_usd, 1),
  purchase_price_total_native = coalesce(purchase_price_total_native, purchase_price_total),
  purchase_price_total_usd = coalesce(purchase_price_total_usd, purchase_price_total),
  fees_total_native = coalesce(fees_total_native, fees_total),
  fees_total_usd = coalesce(fees_total_usd, fees_total),
  shipping_total_native = coalesce(shipping_total_native, shipping_total),
  shipping_total_usd = coalesce(shipping_total_usd, shipping_total)
where
  purchase_price_total_native is null
  or purchase_price_total_usd is null
  or fx_rate_to_usd is null;

-- Keep legacy columns in sync for now: treat purchase_price_total/fees_total/shipping_total as USD.
update public.inventory_lots
set
  purchase_price_total = purchase_price_total_usd,
  fees_total = fees_total_usd,
  shipping_total = shipping_total_usd
where
  purchase_price_total_usd is not null;

-- Update analytics views to use USD cost basis columns.
create or replace view public.v_sales_profit_by_day as
select
  so.user_id,
  date(so.order_date) as day,
  sum(soi.quantity * soi.price_each) as revenue,
  sum(coalesce(il.purchase_price_total_usd / nullif(il.quantity_total, 0), 0) * soi.quantity) as cogs,
  sum(coalesce(so.platform_fees, 0) + coalesce(so.other_fees, 0) + coalesce(so.shipping_cost, 0) - coalesce(so.shipping_charged, 0)) as fees_shipping
from sales_orders so
join sales_order_items soi on soi.order_id = so.id
left join inventory_lots il on il.id = soi.inventory_lot_id
group by so.user_id, date(so.order_date);

create or replace view public.v_top_products_by_profit as
select
  soi.product_id,
  p.name,
  p.game,
  sum(soi.quantity * soi.price_each) as revenue,
  sum(coalesce(il.purchase_price_total_usd / nullif(il.quantity_total, 0), 0) * soi.quantity) as cogs,
  sum((soi.quantity * soi.price_each) - coalesce(il.purchase_price_total_usd / nullif(il.quantity_total, 0), 0) * soi.quantity) as gross_profit
from sales_order_items soi
join products p on p.id = soi.product_id
left join inventory_lots il on il.id = soi.inventory_lot_id
group by soi.product_id, p.name, p.game
order by gross_profit desc;

commit;
