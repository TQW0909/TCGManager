"use client";

import { useMemo, useState } from "react";

function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function PricingCalculator() {
  const [unitCost, setUnitCost] = useState("0");
  // Whatnot-style default model (based on the breakdown Ting provided)
  // - Commission: % of sale price
  // - Processing: % of order total (sale + buyer shipping + buyer tax) + fixed fee
  const [commissionPct, setCommissionPct] = useState("8.0");
  const [processingPct, setProcessingPct] = useState("2.9");
  const [processingFixed, setProcessingFixed] = useState("0.30");
  const [taxRatePct, setTaxRatePct] = useState("0");

  const [shippingCharged, setShippingCharged] = useState("0");
  const [shippingCost, setShippingCost] = useState("0");
  const [targetProfit, setTargetProfit] = useState("5");

  const result = useMemo(() => {
    const cost = toNumber(unitCost);

    const comm = toNumber(commissionPct) / 100;
    const procPct = toNumber(processingPct) / 100;
    const procFixed = toNumber(processingFixed);
    const taxRate = toNumber(taxRatePct) / 100;

    const shipCharged = toNumber(shippingCharged);
    const shipCost = toNumber(shippingCost);
    const target = toNumber(targetProfit);

    // Model:
    // tax = price * taxRate
    // orderTotal = price + shipCharged + tax
    // commission = comm * price
    // processing = procPct * orderTotal + procFixed
    // net = price - commission - processing + shipCharged - shipCost - cost
    // Solve for price given target net:
    // net = price*(1 - comm - procPct*(1+taxRate)) - procPct*shipCharged - procFixed + shipCharged - shipCost - cost
    // target = A*price + B
    const denom = 1 - comm - procPct * (1 + taxRate);
    const safeDenom = Math.max(denom, 0.01);

    const recommended =
      (target + procPct * shipCharged + procFixed + shipCost + cost - shipCharged) /
      safeDenom;

    const compute = (price: number) => {
      const tax = price * taxRate;
      const orderTotal = price + shipCharged + tax;
      const commission = comm * price;
      const processing = procPct * orderTotal + procFixed;
      const net = price - commission - processing + shipCharged - shipCost - cost;
      return { tax, orderTotal, commission, processing, net };
    };

    const computed = compute(Math.max(recommended, 0));

    return {
      recommended: Math.max(recommended, 0),
      ...computed,
      inputs: { comm, procPct, procFixed, taxRate, shipCharged, shipCost, cost },
    };
  }, [
    unitCost,
    commissionPct,
    processingPct,
    processingFixed,
    taxRatePct,
    shippingCharged,
    shippingCost,
    targetProfit,
  ]);

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
            Commission % (of sale price)
          </label>
          <input
            value={commissionPct}
            onChange={(e) => setCommissionPct(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 8.0"
            inputMode="decimal"
          />
          <p className="text-xs text-slate-500">
            Example: 8% commission on the item sale price.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Processing % (of order total)
          </label>
          <input
            value={processingPct}
            onChange={(e) => setProcessingPct(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 2.9"
            inputMode="decimal"
          />
          <p className="text-xs text-slate-500">
            Applied to (sale price + buyer shipping + buyer tax).
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Processing fixed fee
          </label>
          <input
            value={processingFixed}
            onChange={(e) => setProcessingFixed(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 0.30"
            inputMode="decimal"
          />
          <p className="text-xs text-slate-500">Example: +$0.30 per transaction.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Buyer tax rate % (approx)
          </label>
          <input
            value={taxRatePct}
            onChange={(e) => setTaxRatePct(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., 9.25"
            inputMode="decimal"
          />
          <p className="text-xs text-slate-500">
            Only matters because processing is calculated on order total. If you
            don’t know, leave 0.
          </p>
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
            <span className="text-slate-300">Recommended sale price</span>
            <span className="font-semibold text-sky-300">
              ${result.recommended.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Buyer tax (est.)</span>
            <span>${result.tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Order total (est.)</span>
            <span>${result.orderTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Commission</span>
            <span>-${result.commission.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Payment processing</span>
            <span>-${result.processing.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Net profit (est.)</span>
            <span className="font-semibold text-sky-300">
              ${result.net.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Modeled after Whatnot’s breakdown: commission = % of sale price; payment
          processing = (% of order total) + fixed fee; order total includes buyer
          shipping + tax.
        </p>
      </div>
    </div>
  );
}
