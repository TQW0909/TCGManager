import { Card } from "@/components/ui/cards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch Whatnot transactions for sales data
  const { data: whatnotTx, error: whatnotError } = await supabase
    .from("whatnot_transactions")
    .select("amount,transaction_type");

  if (whatnotError) throw new Error(whatnotError.message);

  // Fetch expenses
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount,category");

  if (expensesError) throw new Error(expensesError.message);

  // Fetch inventory lots for product costs
  const { data: inventoryLots, error: lotsError } = await supabase
    .from("inventory_lots")
    .select("purchase_price_total_usd,purchase_price_total");

  if (lotsError) throw new Error(lotsError.message);

  // Calculate totals from Whatnot transactions
  const totalSales = (whatnotTx ?? [])
    .filter((tx) => tx.transaction_type === "SALES")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  // Separate positive and negative adjustments
  const adjustments = (whatnotTx ?? []).filter((tx) => tx.transaction_type === "ADJUSTMENT");
  
  const positiveAdjustments = adjustments
    .filter((tx) => Number(tx.amount) > 0)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  const negativeAdjustments = adjustments
    .filter((tx) => Number(tx.amount) < 0)
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

  // Calculate inventory costs (products added via Spending page)
  const inventoryCosts = (inventoryLots ?? []).reduce((sum, lot) => {
    const usdTotal = Number(lot.purchase_price_total_usd ?? lot.purchase_price_total ?? 0);
    return sum + usdTotal;
  }, 0);

  // Calculate other expenses by category
  const otherProductCosts = (expenses ?? [])
    .filter((e) => e.category === "product_cost")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const operationalCosts = (expenses ?? [])
    .filter((e) => e.category === "operational")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // Combined product costs = inventory + other product costs
  const productCosts = inventoryCosts + otherProductCosts;

  // Total costs = Product costs + Operational costs + Negative adjustments (promotions, etc.)
  const totalCosts = productCosts + operationalCosts + negativeAdjustments;
  
  // Net Profit = Sales + Positive Adjustments (bonuses) - Total Costs
  const netProfit = totalSales + positiveAdjustments - totalCosts;

  // Fetch recent Whatnot transactions for the list
  const { data: recentTx, error: recentError } = await supabase
    .from("whatnot_transactions")
    .select("id,transaction_date,amount,message,transaction_type")
    .order("transaction_date", { ascending: false })
    .limit(6);

  if (recentError) throw new Error(recentError.message);

  const totalRevenue = totalSales + positiveAdjustments;

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Total Revenue
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {formatMoney(totalRevenue, "USD")}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Sales + Bonuses
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Total Sales
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {formatMoney(totalSales, "USD")}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            From Whatnot imports
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Total Costs
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-400">
            {formatMoney(totalCosts, "USD")}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Products + Operations + Promotions
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Net Profit
          </p>
          <p className={`mt-2 text-3xl font-bold ${netProfit >= 0 ? "text-sky-400" : "text-rose-400"}`}>
            {formatMoney(netProfit, "USD")}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Revenue - Costs
          </p>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card title="Product Costs" value={formatMoney(productCosts, "USD")}>
          <p className="text-xs text-slate-400 mt-1">Inventory you purchased</p>
        </Card>
        <Card title="Operational Costs" value={formatMoney(operationalCosts, "USD")}>
          <p className="text-xs text-slate-400 mt-1">Supplies, software, etc.</p>
        </Card>
        <Card title="Ads Spent" value={"-" + formatMoney(negativeAdjustments, "USD")}>
          <p className="text-xs text-slate-400 mt-1">Show promotions you paid for</p>
        </Card>
        <Card title="Whatnot Bonuses" value={"+" + formatMoney(positiveAdjustments, "USD")}>
          <p className="text-xs text-slate-400 mt-1">Credits & incentives received</p>
        </Card>
      </section>

      {/* Recent Transactions */}
      <section className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-50">Recent Whatnot Transactions</p>
          <p className="text-sm text-slate-300">
            Latest imports from your Whatnot CSV data.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {(recentTx ?? []).map((tx) => (
            <div
              key={tx.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-50">
                    {tx.message || "(No description)"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(tx.transaction_date).toLocaleString()} ·{" "}
                    <span
                      className={
                        tx.transaction_type === "SALES"
                          ? "text-emerald-400"
                          : "text-purple-400"
                      }
                    >
                      {tx.transaction_type}
                    </span>
                  </p>
                </div>
                <p
                  className={`font-medium ${
                    Number(tx.amount) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatMoney(Number(tx.amount), "USD")}
                </p>
              </div>
            </div>
          ))}
          {(recentTx ?? []).length ? null : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-400">
              No transactions yet. Import your Whatnot CSV data to get started.
            </div>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Import Whatnot Data">
          <p className="text-sm text-slate-300">
            Go to <span className="text-sky-400">Import</span> to paste your Whatnot CSV export.
          </p>
        </Card>
        <Card title="Track Spending">
          <p className="text-sm text-slate-300">
            Go to <span className="text-sky-400">Spending</span> to log product and operational costs.
          </p>
        </Card>
      </section>
    </div>
  );
}
