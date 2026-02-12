import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExpenseForm } from "@/components/spending/expense-form";
import { ProductCostForm } from "@/components/spending/product-cost-form";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SpendingPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch ALL expenses for accurate totals
  const { data: allExpenses, error: allExpensesError } = await supabase
    .from("expenses")
    .select("amount,category");

  if (allExpensesError) throw new Error(allExpensesError.message);

  // Fetch recent 50 for display
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .limit(50);

  if (expensesError) throw new Error(expensesError.message);

  // Fetch ALL inventory lots for accurate totals
  const { data: allLots, error: allLotsError } = await supabase
    .from("inventory_lots")
    .select("purchase_price_total_usd,purchase_price_total");

  if (allLotsError) throw new Error(allLotsError.message);

  // Fetch recent 50 lots for display
  const { data: lots, error: lotsError } = await supabase
    .from("inventory_lots")
    .select("id,quantity_total,purchase_price_total_usd,purchase_price_total,purchase_date,created_at, product:products(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (lotsError) throw new Error(lotsError.message);

  // Calculate totals from ALL data
  const productCosts = (allExpenses ?? []).filter((e) => e.category === "product_cost");
  const operationalCosts = (allExpenses ?? []).filter((e) => e.category === "operational");

  const totalProductCosts = productCosts.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalOperationalCosts = operationalCosts.reduce((sum, e) => sum + Number(e.amount), 0);
  
  // Sum ALL inventory lot costs
  const totalInventoryCosts = (allLots ?? []).reduce((sum, lot) => {
    const usdTotal = Number(lot.purchase_price_total_usd ?? lot.purchase_price_total ?? 0);
    return sum + usdTotal;
  }, 0);
  
  const totalProductCount = allLots?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Spending</h2>
        <p className="text-sm text-slate-300">
          Track your product costs and operational expenses.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Product Inventory Costs
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-400">
            {formatMoney(totalInventoryCosts, "USD")}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Other Product Costs
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {formatMoney(totalProductCosts, "USD")}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Operational Costs
          </p>
          <p className="mt-2 text-2xl font-semibold text-purple-400">
            {formatMoney(totalOperationalCosts, "USD")}
          </p>
        </div>
      </div>

      {/* Add Product with Cost */}
      <ProductCostForm />

      {/* Other Product Costs Form */}
      <ExpenseForm
        category="product_cost"
        title="Other Product Costs"
        description="Additional costs like import fees, customs, etc."
        placeholder="e.g., 50.00"
      />

      {/* Operational Costs Form */}
      <ExpenseForm
        category="operational"
        title="Operational Costs"
        description="Business expenses like shipping supplies, storage, software subscriptions, etc."
        placeholder="e.g., 25.00"
      />

      {/* Recent Products Added */}
      {lots && lots.length > 0 ? (
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-slate-50">Recent Products</p>
            <p className="text-sm text-slate-300">
              Showing latest 50 of {totalProductCount} products.
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            {lots.map((lot) => {
              const product = lot.product as unknown as { name: string } | null;
              const usdTotal = Number(lot.purchase_price_total_usd ?? lot.purchase_price_total ?? 0);
              const unitCost = lot.quantity_total > 0 ? usdTotal / lot.quantity_total : 0;
              return (
                <div
                  key={lot.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-50">
                        {product?.name || "(Unknown product)"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lot.purchase_date} · Qty: {lot.quantity_total} · Unit: {formatMoney(unitCost, "USD")}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-amber-400">{formatMoney(usdTotal, "USD")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Recent Expenses */}
      {expenses && expenses.length > 0 ? (
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-slate-50">Recent Expenses</p>
            <p className="text-sm text-slate-300">Other costs you&apos;ve logged.</p>
          </div>
          <div className="mt-4 grid gap-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-50">
                      {expense.description || "(No description)"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {expense.expense_date} ·{" "}
                      <span
                        className={
                          expense.category === "product_cost"
                            ? "text-amber-400"
                            : "text-purple-400"
                        }
                      >
                        {expense.category === "product_cost"
                          ? "Product Cost"
                          : "Operational"}
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-200">
                    <p>{formatMoney(Number(expense.amount), "USD")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
