import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SalesOrderForm } from "@/components/sales/sales-order-form";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: orders, error } = await supabase
    .from("sales_orders")
    .select(
      "id,platform,session_name,order_date,buyer_handle,shipping_charged,shipping_cost,platform_fees,other_fees, created_at, items:sales_order_items(quantity,price_each)"
    )
    .order("order_date", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Sales</h2>
        <p className="text-sm text-slate-300">
          Create a stream/session, capture fees + shipping, then (next) attach sold
          items to purchase lots.
        </p>
      </div>

      <SalesOrderForm />

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-50">Recent sessions</p>
          <p className="text-sm text-slate-300">
            This is already live from `sales_orders`. Next step is item entry + COGS.
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          {orders?.map((order) => {
            const items = (order.items as unknown as Array<{
              quantity: number;
              price_each: number;
            }> | null) ?? [];

            const revenue = items.reduce(
              (sum, it) => sum + Number(it.quantity) * Number(it.price_each),
              0
            );

            const fees = Number(order.platform_fees ?? 0) + Number(order.other_fees ?? 0);
            const shippingDelta =
              Number(order.shipping_cost ?? 0) - Number(order.shipping_charged ?? 0);
            const approxNet = revenue - fees - shippingDelta;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-50">
                      {order.session_name ?? "(Untitled session)"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(order.order_date).toLocaleString()} · {order.platform ?? "Whatnot"}
                      {order.buyer_handle ? ` · ${order.buyer_handle}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {items.length} items
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-300">
                  <span>Revenue ${revenue.toFixed(2)}</span>
                  <span>Fees ${fees.toFixed(2)}</span>
                  <span>
                    Shipping Δ ${(shippingDelta).toFixed(2)}
                  </span>
                  <span className="font-semibold text-sky-300">
                    Net (approx) ${approxNet.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}

          {orders?.length ? null : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-400">
              No sales sessions yet. Create your first one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
