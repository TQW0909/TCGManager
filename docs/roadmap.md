## Implementation phases

1) Skeleton & auth
   - Supabase project + env vars wired.
   - Supabase Auth (email/password) flows in Next.js.
   - Protected dashboard routes.

2) Data model wiring
   - Apply `supabase/schema.sql`.
   - CRUD for `products` and `inventory_lots` with unit cost display.

3) Sales & profit
   - CRUD for `sales_orders` + `sales_order_items`.
   - FIFO lot selection or manual lot assignment; decrement `quantity_available`.
   - Calculate revenue, COGS, platform fees, shipping, and net profit per order.

4) Dashboard analytics
   - Query `v_sales_profit_by_day` and `v_top_products_by_profit`.
   - Charts and summary cards with date filtering.

5) UX polish + Whatnot niceties
   - Quick-add product from sales form.
   - Platform-specific fields (stream id, buyer handle).
   - Filters by game/set/platform; empty states and toasts.
