import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PurchaseLotForm } from "@/components/purchases/purchase-lot-form";
import { formatMoney, type SupportedCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,name,game,type")
    .order("created_at", { ascending: false });

  if (productsError) throw new Error(productsError.message);

  const { data: lots, error: lotsError } = await supabase
    .from("inventory_lots")
    .select(
      "id,quantity_total,quantity_available,purchase_date,purchase_currency,fx_rate_to_usd,purchase_price_total_native,purchase_price_total_usd,purchase_price_total,fees_total,shipping_total,created_at, product:products(id,name,game,type)"
    )
    .order("purchase_date", { ascending: false })
    .limit(50);

  if (lotsError) throw new Error(lotsError.message);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Purchases</h2>
        <p className="text-sm text-slate-300">
          Capture purchase lots to set cost basis and available quantity for every
          product.
        </p>
      </div>

      <PurchaseLotForm products={products ?? []} />

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-50">Recent lots</p>
          <p className="text-sm text-slate-300">
            Your last 50 lots. Unit cost is computed as total / qty.
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {lots?.map((lot) => {
            const p = lot.product as unknown as {
              id: string;
              name: string;
              game: string | null;
              type: string;
            } | null;
            const lotFx = lot as unknown as {
              purchase_currency?: SupportedCurrency | null;
              purchase_price_total_native?: number | null;
              purchase_price_total_usd?: number | null;
            };

            const currency = (lotFx.purchase_currency ?? "USD") as SupportedCurrency;
            const nativeTotal = Number(
              lotFx.purchase_price_total_native ?? lot.purchase_price_total
            );
            const usdTotal = Number(lotFx.purchase_price_total_usd ?? lot.purchase_price_total);

            const unitUsd = lot.quantity_total > 0 ? usdTotal / lot.quantity_total : 0;
            const unitNative = lot.quantity_total > 0 ? nativeTotal / lot.quantity_total : 0;
            return (
              <div
                key={lot.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-50">
                      {p?.name ?? "(Unknown product)"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Purchased {lot.purchase_date} · Qty {lot.quantity_total} ·
                      Available {lot.quantity_available}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-200">
                    <p>
                      Total {formatMoney(nativeTotal, currency)}
                      {currency === "USD" ? null : (
                        <span className="text-slate-400">
                          {" "}(= {formatMoney(usdTotal, "USD")})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      Unit {formatMoney(unitNative, currency)}
                      {currency === "USD" ? null : (
                        <>
                          {" "}(= {formatMoney(unitUsd, "USD")})
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {lots?.length ? null : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-400">
              No lots yet. Add your first purchase above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
