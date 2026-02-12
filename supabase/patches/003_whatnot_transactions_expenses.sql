-- Migration: Add whatnot_transactions and expenses tables
-- Run this in Supabase SQL editor after previous migrations

-- Whatnot transactions (imported from CSV)
create table public.whatnot_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  transaction_date timestamptz not null,
  amount numeric(12,2) not null,
  listing_id text not null default '',
  order_id text not null default '',
  message text,
  status text,
  transaction_type text not null, -- 'SALES' or 'ADJUSTMENT'
  created_at timestamptz not null default now(),
  -- Unique constraint to prevent duplicate imports
  unique(user_id, transaction_date, listing_id, order_id, amount)
);

create index whatnot_transactions_user_id_idx on public.whatnot_transactions (user_id);
create index whatnot_transactions_date_idx on public.whatnot_transactions (transaction_date);
create index whatnot_transactions_type_idx on public.whatnot_transactions (transaction_type);

-- Expenses table for operational and product costs
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null, -- 'product_cost' or 'operational'
  amount numeric(12,2) not null,
  description text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index expenses_user_id_idx on public.expenses (user_id);
create index expenses_category_idx on public.expenses (category);
create index expenses_date_idx on public.expenses (expense_date);

-- Enable RLS
alter table public.whatnot_transactions enable row level security;
alter table public.expenses enable row level security;

-- RLS policies for whatnot_transactions
create policy "Whatnot transactions are user scoped" on public.whatnot_transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- RLS policies for expenses
create policy "Expenses are user scoped" on public.expenses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
