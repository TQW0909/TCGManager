"use client";

import { useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type ProductLite = {
  id: string;
  name: string;
  game: string | null;
  type: string;
};

export function PurchaseLotForm({ products }: { products: ProductLite[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [qty, setQty] = useState("1");
  const [priceTotal, setPriceTotal] = useState("");
  const [feesTotal, setFeesTotal] = useState("");
  const [shippingTotal, setShippingTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const q = Number(qty);
    const p = Number(priceTotal);
    return Boolean(productId) && q > 0 && Number.isFinite(q) && p >= 0 && !loading;
  }, [productId, qty, priceTotal, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setLoading(true);

    const supabase = createSupabaseClient();
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) {
      setLoading(false);
      setError("Not signed in.");
      return;
    }

    const quantityTotal = Math.floor(Number(qty));

    const payload = {
      user_id: userRes.user.id,
      product_id: productId,
      quantity_total: quantityTotal,
      quantity_available: quantityTotal,
      purchase_date: purchaseDate,
      purchase_price_total: Number(priceTotal),
      fees_total: feesTotal ? Number(feesTotal) : null,
      shipping_total: shippingTotal ? Number(shippingTotal) : null,
    };

    const { error: insertErr } = await supabase.from("inventory_lots").insert(payload);

    setLoading(false);

    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    setOk("Lot added.");
    setQty("1");
    setPriceTotal("");
    setFeesTotal("");
    setShippingTotal("");
    window.location.reload();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-50">New purchase lot</p>
        <p className="text-sm text-slate-300">
          This sets your cost basis. Track buy-side fees/shipping if you want.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Product
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.game ? `[${p.game}] ` : ""}{p.name}
              </option>
            ))}
          </select>
          {products.length === 0 ? (
            <p className="text-xs text-rose-300">
              Add a product first (Dashboard → Products).
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Purchase date
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Quantity
          </label>
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 6"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Purchase price total
          </label>
          <input
            value={priceTotal}
            onChange={(e) => setPriceTotal(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 180.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Buy-side fees (optional)
          </label>
          <input
            value={feesTotal}
            onChange={(e) => setFeesTotal(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 5.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Buy-side shipping (optional)
          </label>
          <input
            value={shippingTotal}
            onChange={(e) => setShippingTotal(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 8.00"
          />
        </div>

        {error ? (
          <p className="text-sm text-rose-300 md:col-span-3" role="alert">
            {error}
          </p>
        ) : null}
        {ok ? (
          <p className="text-sm text-emerald-300 md:col-span-3">{ok}</p>
        ) : null}

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add lot"}
          </button>
        </div>
      </form>
    </div>
  );
}
