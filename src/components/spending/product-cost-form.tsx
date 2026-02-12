"use client";

import { useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export function ProductCostForm() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const q = Number(quantity);
    const p = Number(totalPrice);
    return name.trim().length > 0 && q > 0 && p >= 0 && !loading;
  }, [name, quantity, totalPrice, loading]);

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

    // Create product
    const productPayload = {
      user_id: userRes.user.id,
      type: "sealed_product" as const,
      name: name.trim(),
    };

    const { data: productData, error: productErr } = await supabase
      .from("products")
      .insert(productPayload)
      .select("id")
      .single();

    if (productErr) {
      setLoading(false);
      setError(productErr.message);
      return;
    }

    // Create inventory lot
    const qty = Math.floor(Number(quantity));
    const price = Number(totalPrice);
    const today = new Date().toISOString().slice(0, 10);

    const lotPayload = {
      user_id: userRes.user.id,
      product_id: productData.id,
      quantity_total: qty,
      quantity_available: qty,
      purchase_date: today,
      purchase_price_total: price,
      purchase_currency: "USD",
      fx_rate_to_usd: 1,
      purchase_price_total_native: price,
      purchase_price_total_usd: price,
    };

    const { error: lotErr } = await supabase.from("inventory_lots").insert(lotPayload);

    setLoading(false);

    if (lotErr) {
      setError(`Product created but inventory failed: ${lotErr.message}`);
      return;
    }

    setOk("Product added!");
    setName("");
    setQuantity("");
    setTotalPrice("");
    window.location.reload();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-50">Add Product</p>
        <p className="text-sm text-slate-300">
          Add a product with its cost. This tracks your inventory and cost basis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-3">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Product Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder='e.g., "OP-14 JP Booster Box"'
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Quantity
          </label>
          <input
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Total Cost ($)
          </label>
          <input
            required
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 150.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Unit Cost
          </label>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
            {Number(quantity) > 0 && Number(totalPrice) >= 0
              ? `$${(Number(totalPrice) / Number(quantity)).toFixed(2)}`
              : "—"}
          </div>
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
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
