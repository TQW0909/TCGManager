import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

type Row = {
  productId: string;
  name: string;
  game: string | null;
  type: string;
  onHand: number;
  costBasisRemainingUsd: number;
  costBasisRemainingCnyNative: number;
};

export default async function InventoryPage() {
  const supabase = await createSupabaseServerClient();

  const { data: lots, error } = await supabase
    .from("inventory_lots")
    .select(
      "id,quantity_total,quantity_available,purchase_currency,purchase_price_total_native,purchase_price_total_usd,purchase_price_total, product:products(id,name,game,type)"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  const map = new Map<string, Row>();

  for (const lot of lots ?? []) {
    const p = lot.product as unknown as {
      id: string;
      name: string;
      game: string | null;
      type: string;
    } | null;
    if (!p) continue;

    const lotFx = lot as unknown as {
      purchase_price_total_usd?: number | null;
      purchase_price_total_native?: number | null;
      purchase_currency?: "USD" | "CNY" | null;
    };

    const usdTotal = Number(lotFx.purchase_price_total_usd ?? lot.purchase_price_total);
    const nativeTotal = Number(
      lotFx.purchase_price_total_native ?? lot.purchase_price_total
    );
    const currency = (lotFx.purchase_currency ?? "USD") as "USD" | "CNY";

    const unitUsd = lot.quantity_total > 0 ? usdTotal / lot.quantity_total : 0;
    const addUsd = unitUsd * Number(lot.quantity_available);

    const unitNative = lot.quantity_total > 0 ? nativeTotal / lot.quantity_total : 0;
    const addCnyNative = currency === "CNY" ? unitNative * Number(lot.quantity_available) : 0;

    const existing = map.get(p.id);
    if (existing) {
      existing.onHand += Number(lot.quantity_available);
      existing.costBasisRemainingUsd += addUsd;
      existing.costBasisRemainingCnyNative += addCnyNative;
    } else {
      map.set(p.id, {
        productId: p.id,
        name: p.name,
        game: p.game,
        type: p.type,
        onHand: Number(lot.quantity_available),
        costBasisRemainingUsd: addUsd,
        costBasisRemainingCnyNative: addCnyNative,
      });
    }
  }

  const rows = Array.from(map.values()).sort(
    (a, b) => b.costBasisRemainingUsd - a.costBasisRemainingUsd
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Inventory</h2>
        <p className="text-sm text-slate-300">
          On-hand quantity and remaining cost basis (from your purchase lots).
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-50">
            Products & quantities
          </p>
          <p className="text-sm text-slate-300">
            Computed from `inventory_lots.quantity_available`.
          </p>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 bg-slate-900/60 text-sm">
            <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Game</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">On hand</th>
                <th className="px-4 py-3 font-semibold">Cost basis remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-100">
              {rows.map((item) => (
                <tr key={item.productId}>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {item.game ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.type}</td>
                  <td className="px-4 py-3">{item.onHand}</td>
                  <td className="px-4 py-3">
                    {formatMoney(item.costBasisRemainingUsd, "USD")}
                    {item.costBasisRemainingCnyNative > 0 ? (
                      <div className="text-xs text-slate-400">
                        Native {formatMoney(item.costBasisRemainingCnyNative, "CNY")}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
              {rows.length ? null : (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-400" colSpan={5}>
                    No inventory yet. Add purchase lots first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
