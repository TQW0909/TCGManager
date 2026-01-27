"use client";

import { useMemo, useState } from "react";

function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function PricingCalculator() {
  const [unitCost, setUnitCost] = useState("0");
  const [platformFeePct, setPlatformFeePct] = useState("12.0");
  const [shippingCharged, setShippingCharged] = useState("0");
  const [shippingCost, setShippingCost] = useState("0");
  const [targetProfit, setTargetProfit] = useState("5");

  const result = useMemo(() => {
    const cost = toNumber(unitCost);
    const feePct = toNumber(platformFeePct) / 100;
    const shipCharged = toNumber(shippingCharged);
    const shipCost = toNumber(shippingCost);
    const target = toNumber(targetProfit);

    // Net = price*(1-feePct) + shipCharged - shipCost - cost
    // Solve for price given target net profit:
    // target = price*(1-feePct) + shipCharged - shipCost - cost
    // price = (target + cost + shipCost - shipCharged) / (1-feePct)
    const denom = Math.max(1 - feePct, 0.01);
    const recommended = (target + cost + shipCost - shipCharged) / denom;

    const netIfSold = (p: number) => p * (1 - feePct) + shipCharged - shipCost - cost;

    return {
      recommended: Math.max(recommended, 0),
      netAtRecommended: netIfSold(recommended),
      feeAtRecommended: recommended * feePct,
    };
  }, [unitCost, platformFeePct, shippingCharged, shippingCost, targetProfit]);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Unit cost
          </label>
          <input
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 7.50"
            inputMode="decimal"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Platform fee %
          </label>
          <input
            value={platformFeePct}
            onChange={(e) => setPlatformFeePct(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 12"
            inputMode="decimal"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Shipping charged
          </label>
          <input
            value={shippingCharged}
            onChange={(e) => setShippingCharged(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 4.00"
            inputMode="decimal"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Shipping cost
          </label>
          <input
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 3.75"
            inputMode="decimal"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Target profit (net)
          </label>
          <input
            value={targetProfit}
            onChange={(e) => setTargetProfit(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 5.00"
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-sm font-semibold text-slate-50">Result</p>
        <div className="mt-2 grid gap-2 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Recommended price</span>
            <span className="font-semibold text-sky-300">
              ${result.recommended.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Est. platform fee</span>
            <span>${result.feeAtRecommended.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Est. net profit</span>
            <span>${result.netAtRecommended.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          This is a quick model. Real Whatnot profit depends on actual fees,
          shipping, promos/credits, and how you allocate order-level costs.
        </p>
      </div>
    </div>
  );
}
