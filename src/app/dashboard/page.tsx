import { Card } from "@/components/ui/cards";

const highlights = [
  { title: "Revenue (30d)", value: "$12,430" },
  { title: "Gross Profit (30d)", value: "$4,980" },
  { title: "Net Profit (30d)", value: "$4,120" },
  { title: "Remaining Inventory Cost Basis", value: "$8,300" },
];

const recent = [
  {
    title: "Whatnot stream #122",
    detail: "12 orders · $1.1k revenue · $420 gross profit",
  },
  {
    title: "TCG singles sale",
    detail: "8 orders · $460 revenue · $180 gross profit",
  },
  {
    title: "Sealed dump",
    detail: "3 orders · $380 revenue · $120 gross profit",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <Card key={item.title} title={item.title} value={item.value} />
        ))}
      </section>

      <section className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-50">Recent sessions</p>
          <p className="text-sm text-slate-300">
            Hook this list to Supabase sales orders to show the latest streams or
            drop-off orders.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {recent.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <p className="font-medium text-slate-50">{item.title}</p>
              <p className="text-sm text-slate-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Profit over time">
          Connect this to the `v_sales_profit_by_day` view for a time-series chart
          of revenue vs profit for a selected date range.
        </Card>
        <Card title="Top products">
          Use `v_top_products_by_profit` to surface SKUs/sets that drive the most
          profit and restock opportunities.
        </Card>
      </section>
    </div>
  );
}
