# Migration 002 – Multi-currency purchases (USD + CNY)

## Summary
This migration adds:
- `fx_rates` table to cache FX rates (12h TTL enforced by the app)
- Multi-currency fields on `inventory_lots` so purchases can be entered in **USD or CNY** while storing:
  - native amounts
  - USD-converted amounts
  - FX rate used at time of entry

## Apply
Run in Supabase SQL editor (or via CLI):
- `supabase/patches/002_multi_currency_inventory_lots_fx_rates.sql`

## Data backfill behavior
Existing `inventory_lots` rows are assumed to be **USD** and are backfilled as:
- `purchase_currency = 'USD'`
- `fx_rate_to_usd = 1`
- `*_native = legacy value`
- `*_usd = legacy value`

Legacy columns (`purchase_price_total`, `fees_total`, `shipping_total`) are treated as USD and kept in sync.

## Notes
- Analytics views (`v_sales_profit_by_day`, `v_top_products_by_profit`) are updated to use `purchase_price_total_usd`.
- RLS policies on `fx_rates` allow any authenticated user to read/write cached rates (rates are not user data).
