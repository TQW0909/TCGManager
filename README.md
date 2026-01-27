## TCG Manager (Next.js + Supabase)

Dashboard for TCG sellers to track inventory, purchases, sales, fees, shipping, and profit/loss with Supabase as the backend.

### Stack
- Next.js (App Router) + React + TypeScript
- Tailwind (v4) styling
- Supabase (Postgres + Auth + RLS)

### Local setup
1) Install deps
```bash
npm install
```
2) Configure environment
```bash
cp .env.local.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```
3) Run dev server
```bash
npm run dev
```
4) Open http://localhost:3000

### Supabase schema
Run `supabase/schema.sql` in the Supabase SQL editor or CLI to create tables, enums, views, and RLS policies for:
- profiles, products, inventory_lots, sales_orders, sales_order_items, cash_flows
- analytics views: v_sales_profit_by_day, v_top_products_by_profit

### Project structure
- `src/app` – marketing landing + dashboard routes
- `src/lib/supabase` – client/server helpers
- `src/lib/types/db.ts` – typed shapes for tables
- `supabase/schema.sql` – database schema and RLS

### Next steps
- Wire Supabase auth flows (email/password or OAuth).
- Implement CRUD for purchases, sales, inventory.
- Connect dashboard cards/charts to Supabase queries/views.
