"use client";

import { useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export function SalesOrderForm() {
  const [sessionName, setSessionName] = useState("");
  const [platform, setPlatform] = useState("Whatnot");
  const [buyerHandle, setBuyerHandle] = useState("");
  const [platformFees, setPlatformFees] = useState("");
  const [otherFees, setOtherFees] = useState("");
  const [shippingCharged, setShippingCharged] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return sessionName.trim().length > 0 && !loading;
  }, [sessionName, loading]);

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

    const payload = {
      user_id: userRes.user.id,
      platform: platform.trim() || null,
      session_name: sessionName.trim(),
      buyer_handle: buyerHandle.trim() || null,
      platform_fees: platformFees ? Number(platformFees) : null,
      other_fees: otherFees ? Number(otherFees) : null,
      shipping_charged: shippingCharged ? Number(shippingCharged) : null,
      shipping_cost: shippingCost ? Number(shippingCost) : null,
    };

    const { error: insertErr } = await supabase.from("sales_orders").insert(payload);

    setLoading(false);

    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    setOk("Session created.");
    setSessionName("");
    setBuyerHandle("");
    setPlatformFees("");
    setOtherFees("");
    setShippingCharged("");
    setShippingCost("");

    window.location.reload();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-50">New session</p>
        <p className="text-sm text-slate-300">
          Create a Whatnot stream/session container. We’ll add sold items next.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Session name
          </label>
          <input
            required
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="Whatnot stream #123"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Platform
          </label>
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="Whatnot"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Buyer handle (optional)
          </label>
          <input
            value={buyerHandle}
            onChange={(e) => setBuyerHandle(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="@handle"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Platform fees (optional)
          </label>
          <input
            value={platformFees}
            onChange={(e) => setPlatformFees(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 12.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Other fees (optional)
          </label>
          <input
            value={otherFees}
            onChange={(e) => setOtherFees(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 2.50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Shipping charged (optional)
          </label>
          <input
            value={shippingCharged}
            onChange={(e) => setShippingCharged(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 6.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Shipping cost (optional)
          </label>
          <input
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 5.25"
          />
        </div>

        {error ? (
          <p className="text-sm text-rose-300 md:col-span-2" role="alert">
            {error}
          </p>
        ) : null}
        {ok ? (
          <p className="text-sm text-emerald-300 md:col-span-2">{ok}</p>
        ) : null}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create session"}
          </button>
        </div>
      </form>
    </div>
  );
}
