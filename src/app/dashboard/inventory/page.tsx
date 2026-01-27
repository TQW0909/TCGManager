const inventory = [
  {
    name: "Pikachu (SV 001/198)",
    type: "Single",
    qty: 18,
    costBasis: "$270",
  },
  {
    name: "Scarlet & Violet booster box",
    type: "Sealed",
    qty: 2,
    costBasis: "$220",
  },
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Inventory</h2>
        <p className="text-sm text-slate-300">
          Snapshot of products with on-hand quantity and cost basis from purchase
          lots.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-50">
            Products & quantities
          </p>
          <p className="text-sm text-slate-300">
            Backed by `products` + aggregated `inventory_lots`.
          </p>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 bg-slate-900/60 text-sm">
            <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">On hand</th>
                <th className="px-4 py-3 font-semibold">Cost basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-100">
              {inventory.map((item) => (
                <tr key={item.name}>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-slate-300">{item.type}</td>
                  <td className="px-4 py-3">{item.qty}</td>
                  <td className="px-4 py-3">{item.costBasis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
