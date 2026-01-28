import { Card } from "@/components/ui/cards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: orders, error: ordersError } = await supabase
    .from("sales_orders")
    .select(
      "id,session_name,order_date,platform,platform_fees,other_fees,shipping_charged,shipping_cost, items:sales_order_items(quantity,price_each)"
    )
    .gte("order_date", since.toISOString())
    .order("order_date", { ascending: false })
    .limit(200);

  if (ordersError) throw new Error(ordersError.message);

  const revenue30d = (orders ?? []).reduce((sum, o) => {
    const items = (o.items as unknown as Array<{ quantity: number; price_each: number }> | null) ?? [];
    const r = items.reduce((s, it) => s + Number(it.quantity) * Number(it.price_each), 0);
    return sum + r;
  }, 0);

  const fees30d = (orders ?? []).reduce(
    (sum, o) => sum + Number(o.platform_fees ?? 0) + Number(o.other_fees ?? 0),
    0
  );

  const shippingDelta30d = (orders ?? []).reduce(
    (sum, o) =>
      sum + (Number(o.shipping_cost ?? 0) - Number(o.shipping_charged ?? 0)),
    0
  );

  const net30dApprox = revenue30d - fees30d - shippingDelta30d;

  const { data: lots, error: lotsError } = await supabase
    .from("inventory_lots")
    .select("quantity_total,quantity_available,purchase_price_total_usd,purchase_price_total")
    .limit(1000);

  if (lotsError) throw new Error(lotsError.message);

  const inventoryCostBasisRemainingUsd = (lots ?? []).reduce((sum, lot) => {
    const lotFx = lot as unknown as { purchase_price_total_usd?: number | null };
    const usdTotal = Number(lotFx.purchase_price_total_usd ?? lot.purchase_price_total);
    const unit = lot.quantity_total > 0 ? usdTotal / lot.quantity_total : 0;
    return sum + unit * Number(lot.quantity_available);
  }, 0);

  const highlights = [
    { title: "Revenue (30d)", value: formatMoney(revenue30d, "USD") },
    { title: "Fees (30d)", value: formatMoney(fees30d, "USD") },
    { title: "Shipping Δ (30d)", value: formatMoney(shippingDelta30d, "USD") },
    { title: "Net (approx, 30d)", value: formatMoney(net30dApprox, "USD") },
    {
      title: "Remaining Inventory Cost Basis",
      value: formatMoney(inventoryCostBasisRemainingUsd, "USD"),
    },
  ];

  const recent = (orders ?? []).slice(0, 6).map((o) => {
    const items = (o.items as unknown as Array<{ quantity: number; price_each: number }> | null) ?? [];
    const rev = items.reduce((s, it) => s + Number(it.quantity) * Number(it.price_each), 0);
    return {
      id: o.id,
      title: o.session_name ?? "(Untitled session)",
      detail: `${new Date(o.order_date).toLocaleString()} · ${items.length} items · $${rev.toFixed(2)} revenue`,
    };
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {highlights.map((item) => (
          <Card key={item.title} title={item.title} value={item.value} />
        ))}
      </section>

      <section className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-50">Recent sessions</p>
          <p className="text-sm text-slate-300">
            Live from Supabase. Next step: item entry + lot allocation for real COGS.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {recent.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <p className="font-medium text-slate-50">{item.title}</p>
              <p className="text-sm text-slate-300">{item.detail}</p>
            </div>
          ))}
          {recent.length ? null : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-400">
              No sales yet. Create a session in Sales.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Profit over time">
          Next: connect a chart to `v_sales_profit_by_day`.
        </Card>
        <Card title="Top products">
          Next: connect to `v_top_products_by_profit` once sales items are linked to lots.
        </Card>
      </section>
    </div>
  );
}
