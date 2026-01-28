-- Supabase schema for TCG Manager
-- Run these statements in Supabase SQL editor or CLI after creating the project.

-- Enums
create type public.product_type as enum ('single_card', 'sealed_product');
create type public.condition_code as enum ('NM', 'LP', 'MP', 'HP', 'DMG', 'SEALED');
create type public.cash_flow_type as enum ('purchase', 'sale', 'fee', 'shipping', 'other_income', 'withdrawal');

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  default_currency text,
  created_at timestamptz not null default now()
);

-- FX rates cache (shared)
create table public.fx_rates (
  pair text primary key,
  base_currency text not null,
  quote_currency text not null,
  rate numeric(18,8) not null,
  fetched_at timestamptz not null default now()
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type product_type not null,
  name text not null,
  game text,
  set_name text,
  set_code text,
  condition condition_code,
  sku text,
  external_id text,
  created_at timestamptz not null default now()
);

create index products_user_id_idx on public.products (user_id);
create index products_type_idx on public.products (type);

-- Inventory lots (purchase-level cost basis)
create table public.inventory_lots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_total integer not null check (quantity_total > 0),
  quantity_available integer not null check (quantity_available >= 0),
  purchase_date date not null,

  -- Legacy USD columns (kept for backward compatibility)
  purchase_price_total numeric(12,2) not null,
  fees_total numeric(12,2),
  shipping_total numeric(12,2),

  -- Multi-currency purchase capture
  purchase_currency text not null default 'USD',
  fx_rate_to_usd numeric(18,8),
  purchase_price_total_native numeric(12,2),
  purchase_price_total_usd numeric(12,2),
  fees_total_native numeric(12,2),
  fees_total_usd numeric(12,2),
  shipping_total_native numeric(12,2),
  shipping_total_usd numeric(12,2),

  created_at timestamptz not null default now()
);

create index inventory_lots_user_id_idx on public.inventory_lots (user_id);
create index inventory_lots_product_id_idx on public.inventory_lots (product_id);

-- Sales orders (per Whatnot session/order)
create table public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text,
  -- Whatnot sellers think in "streams/sessions". MVP uses sales_orders as the session container.
  session_name text,
  order_date timestamptz not null default now(),
  buyer_handle text,
  shipping_charged numeric(12,2),
  shipping_cost numeric(12,2),
  platform_fees numeric(12,2),
  other_fees numeric(12,2),
  created_at timestamptz not null default now()
);

create index sales_orders_user_id_idx on public.sales_orders (user_id);
create index sales_orders_order_date_idx on public.sales_orders (order_date);

-- Sales order items
create table public.sales_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.sales_orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  inventory_lot_id uuid references public.inventory_lots(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price_each numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index sales_order_items_order_id_idx on public.sales_order_items (order_id);
create index sales_order_items_product_id_idx on public.sales_order_items (product_id);
create index sales_order_items_lot_id_idx on public.sales_order_items (inventory_lot_id);

-- Cash flows (optional but useful for overall P&L)
create table public.cash_flows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type cash_flow_type not null,
  related_order_id uuid references public.sales_orders(id) on delete set null,
  related_lot_id uuid references public.inventory_lots(id) on delete set null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index cash_flows_user_id_idx on public.cash_flows (user_id);
create index cash_flows_type_idx on public.cash_flows (type);

-- Views for analytics
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

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.fx_rates enable row level security;
alter table public.products enable row level security;
alter table public.inventory_lots enable row level security;
alter table public.sales_orders enable row level security;
alter table public.sales_order_items enable row level security;
alter table public.cash_flows enable row level security;

-- Policies: user owns their rows
create policy "Users select their profile" on public.profiles
  for select using (id = auth.uid());

create policy "Users insert their profile" on public.profiles
  for insert with check (id = auth.uid());

create policy "Users update their profile" on public.profiles
  for update using (id = auth.uid());

-- FX rates are non-user data; allow authenticated users to read/write for caching.
create policy "FX rates are readable by authenticated" on public.fx_rates
  for select to authenticated using (true);

create policy "FX rates are writable by authenticated" on public.fx_rates
  for insert to authenticated with check (true);

create policy "FX rates are updatable by authenticated" on public.fx_rates
  for update to authenticated using (true) with check (true);

create policy "Products are user scoped" on public.products
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Inventory lots are user scoped" on public.inventory_lots
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Sales orders are user scoped" on public.sales_orders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Sales items follow order ownership" on public.sales_order_items
  for all using (
    exists (
      select 1 from public.sales_orders so
      where so.id = sales_order_items.order_id and so.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.sales_orders so
      where so.id = sales_order_items.order_id and so.user_id = auth.uid()
    )
  );

create policy "Cash flows are user scoped" on public.cash_flows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Helpful default profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, default_currency)
  values (new.id, new.raw_user_meta_data->>'display_name', 'USD')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
