const demoItems = [
  {
    order: "Whatnot stream #122",
    buyer: "@collector42",
    lines: "Charmander NM x2, Booster Box x1",
    revenue: "$180",
    fees: "$24",
    shipping: "$8",
    profit: "$82",
  },
  {
    order: "Whatnot stream #121",
    buyer: "@foilfan",
    lines: "Gengar EX x1",
    revenue: "$95",
    fees: "$12",
    shipping: "$6",
    profit: "$52",
  },
];

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Sales</h2>
        <p className="text-sm text-slate-300">
          Record orders with platform fees, shipping charged vs cost, and attach
          items to purchase lots for accurate COGS.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-50">Quick capture</p>
            <p className="text-sm text-slate-300">
              Next step: wire this form to Supabase insert mutations.
            </p>
          </div>
          <button className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            New sale
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Session / Order name
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="Whatnot stream #123"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Buyer handle
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="@handle"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Platform fees
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="12.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Shipping (charged / cost)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                placeholder="Charged: 8.00"
              />
              <input
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                placeholder="Cost: 6.00"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-50">Recent sales</p>
          <p className="text-sm text-slate-300">
            Replace with a table sourced from `sales_orders` + `sales_order_items`.
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {demoItems.map((item) => (
            <div
              key={item.order}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-50">{item.order}</p>
                  <p className="text-xs text-slate-400">{item.lines}</p>
                </div>
                <p className="text-xs text-slate-400">{item.buyer}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-300">
                <span>Revenue {item.revenue}</span>
                <span>Fees {item.fees}</span>
                <span>Shipping {item.shipping}</span>
                <span className="font-semibold text-sky-300">
                  Profit {item.profit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
