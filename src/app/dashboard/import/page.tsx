import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CSVImportForm } from "@/components/import/csv-import-form";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch ALL transactions for accurate totals
  const { data: allTransactions, error: allTxError } = await supabase
    .from("whatnot_transactions")
    .select("amount,transaction_type");

  if (allTxError) throw new Error(allTxError.message);

  // Fetch recent 50 for display
  const { data: transactions, error: txError } = await supabase
    .from("whatnot_transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .limit(50);

  if (txError) throw new Error(txError.message);

  // Calculate stats from ALL transactions
  const totalSales = (allTransactions ?? [])
    .filter((tx) => tx.transaction_type === "SALES")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  const totalAdjustments = (allTransactions ?? [])
    .filter((tx) => tx.transaction_type === "ADJUSTMENT")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  const totalTransactionCount = allTransactions?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Import Whatnot Data</h2>
        <p className="text-sm text-slate-300">
          Import your Whatnot transaction history by pasting the CSV export below.
        </p>
      </div>

      {/* Summary Cards */}
      {transactions && transactions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Imported Sales
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              +{formatMoney(totalSales, "USD")}
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Imported Adjustments
            </p>
            <p className={`mt-2 text-2xl font-semibold ${totalAdjustments >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalAdjustments >= 0 ? "+" : ""}{formatMoney(totalAdjustments, "USD")}
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Net Total
            </p>
            <p className={`mt-2 text-2xl font-semibold ${(totalSales + totalAdjustments) >= 0 ? "text-sky-400" : "text-rose-400"}`}>
              {(totalSales + totalAdjustments) >= 0 ? "+" : ""}{formatMoney(totalSales + totalAdjustments, "USD")}
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Total Transactions
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              {totalTransactionCount}
            </p>
          </div>
        </div>
      ) : null}

      <CSVImportForm />

      {/* Recent Transactions */}
      {transactions && transactions.length > 0 ? (
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-slate-50">Recent imports</p>
            <p className="text-sm text-slate-300">
              Showing latest 50 of {totalTransactionCount} total transactions.
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            {transactions.map((tx) => (
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
                      {new Date(tx.transaction_date).toLocaleDateString()} ·{" "}
                      <span
                        className={
                          tx.transaction_type === "SALES"
                            ? "text-emerald-400"
                            : "text-purple-400"
                        }
                      >
                        {tx.transaction_type}
                      </span>
                      {tx.status ? ` · ${tx.status}` : null}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p
                      className={`font-medium ${
                        Number(tx.amount) >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {Number(tx.amount) >= 0 ? "+" : ""}{formatMoney(Number(tx.amount), "USD")}
                    </p>
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
