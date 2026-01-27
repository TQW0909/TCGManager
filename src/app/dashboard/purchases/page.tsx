const lots = [
  {
    name: "Scarlet & Violet booster box",
    qty: 3,
    cost: "$330",
    unit: "$110",
    date: "2024-12-12",
  },
  {
    name: "Charizard EX singles lot (NM)",
    qty: 12,
    cost: "$180",
    unit: "$15",
    date: "2024-12-10",
  },
];

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Purchases</h2>
        <p className="text-sm text-slate-300">
          Capture purchase lots to set cost basis and available quantity for every
          product.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-50">New purchase</p>
            <p className="text-sm text-slate-300">
              Tie purchases to products and track fees + shipping on the buy side.
            </p>
          </div>
          <button className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Add lot
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Product
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="Scarlet & Violet booster box"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Quantity
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Total cost (with fees/shipping)
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="330.00"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-50">Recent lots</p>
          <p className="text-sm text-slate-300">
            Pull from `inventory_lots` joined to `products` to show quantities and
            unit cost.
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {lots.map((lot) => (
            <div
              key={lot.name}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-50">{lot.name}</p>
                  <p className="text-xs text-slate-400">
                    Purchased {lot.date} · Qty {lot.qty}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-200">
                  <p>Total {lot.cost}</p>
                  <p className="text-xs text-slate-400">Unit {lot.unit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
