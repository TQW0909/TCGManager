# TCGManager Roadmap (Whatnot seller ops)

## North star
A lightweight tool Ting uses to run a profitable Whatnot side hustle:
- inventory tracking (on-hand, cost basis)
- cost + fee + shipping analysis
- pricing calculator
- profit tracker (per stream/order/product, over time)

## MVP (Sprint 1) — “close the loop”
Ship a usable v0 where you can:
1) Log in (Supabase Auth) and have a profile.
2) Create products.
3) Add purchase lots (inventory + cost basis).
4) Create sales orders (Whatnot stream/session) and add sold items.
5) See profit + inventory updates.

### Pages
- Dashboard: KPIs + recent orders + profit over time
- Inventory: on-hand + cost basis remaining
- Purchases: add lots + list lots
- Sales: create order + add items + profit breakdown
- Pricing: quick calculator (can be stateless)
- Settings: defaults (currency, fee %, shipping assumptions)

### Acceptance criteria
- Creating a sale reduces lot `quantity_available`.
- Dashboard shows real KPIs for last 30 days.
- Inventory shows correct on-hand quantities and remaining cost basis.

## Sprint 2 — “make profit actionable”
- Fee/shipping allocation to item-level profit (view: v_sales_order_item_profit)
- Pricing presets (optional)
- Inventory adjustments (damaged/giveaways)
- Basic CSV export

## Decisions to confirm
- Stream model: treat `sales_orders` as a stream/session (add `session_name`) vs a separate `sales_sessions` table.
- Allocation method for fees: pro-rata by revenue (default) vs per-item.
