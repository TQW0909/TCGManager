"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { parseWhatnotCSV, type ParsedWhatnotTransaction } from "@/lib/csv-parser";
import { formatMoney } from "@/lib/money";

export function CSVImportForm() {
  const [csvContent, setCsvContent] = useState("");
  const [parsedData, setParsedData] = useState<ParsedWhatnotTransaction[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function handleParse() {
    setError(null);
    setOk(null);
    setParsedData(null);
    setParseErrors([]);

    if (!csvContent.trim()) {
      setError("Please paste CSV content first.");
      return;
    }

    const result = parseWhatnotCSV(csvContent);
    
    if (!result.success) {
      setError(result.errors.join(", "));
      return;
    }

    setParsedData(result.transactions);
    setParseErrors(result.errors);
    
    if (result.skippedRows > 0) {
      setOk(`Parsed ${result.transactions.length} transactions. ${result.skippedRows} rows skipped.`);
    } else {
      setOk(`Parsed ${result.transactions.length} transactions.`);
    }
  }

  async function handleImport() {
    if (!parsedData || parsedData.length === 0) {
      setError("No data to import. Parse the CSV first.");
      return;
    }

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

    const records = parsedData.map((tx) => ({
      user_id: userRes.user.id,
      transaction_date: tx.transactionDate.toISOString(),
      amount: tx.amount,
      listing_id: tx.listingId ?? "",  // Use empty string instead of null
      order_id: tx.orderId ?? "",      // Use empty string instead of null
      message: tx.message,
      status: tx.status,
      transaction_type: tx.transactionType,
    }));

    // Use upsert to handle duplicates gracefully
    const { error: insertErr, data } = await supabase
      .from("whatnot_transactions")
      .upsert(records, { 
        onConflict: "user_id,transaction_date,listing_id,order_id,amount",
        ignoreDuplicates: true 
      })
      .select();

    setLoading(false);

    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    const importedCount = data?.length ?? records.length;
    setOk(`Imported ${importedCount} transactions successfully!`);
    setCsvContent("");
    setParsedData(null);
    window.location.reload();
  }

  // Calculate preview stats
  const previewStats = parsedData
    ? {
        totalSales: parsedData
          .filter((tx) => tx.transactionType === "SALES")
          .reduce((sum, tx) => sum + tx.amount, 0),
        totalAdjustments: parsedData
          .filter((tx) => tx.transactionType === "ADJUSTMENT")
          .reduce((sum, tx) => sum + tx.amount, 0),
        salesCount: parsedData.filter((tx) => tx.transactionType === "SALES").length,
        adjustmentCount: parsedData.filter((tx) => tx.transactionType === "ADJUSTMENT").length,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-50">Paste Whatnot CSV</p>
          <p className="text-sm text-slate-300">
            Export your transaction history from Whatnot and paste the CSV content below.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="h-48 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-50 outline-none focus:border-sky-500"
            placeholder={`Paste CSV content here...

Example format:
"Date","Amount","Listing ID","Order ID","Message","Status","Transaction Type"
"Jan 31, 2026, 11:21:45 PM","$26.25","1413081375","798710137","Earnings for selling...","processing","SALES"`}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleParse}
              disabled={!csvContent.trim()}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-50 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!parsedData || parsedData.length === 0 || loading}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Importing..." : "Import"}
            </button>
          </div>

          {error ? (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
          {ok ? <p className="text-sm text-emerald-300">{ok}</p> : null}
          {parseErrors.length > 0 ? (
            <div className="rounded-lg border border-amber-800 bg-amber-900/20 p-3">
              <p className="text-xs font-semibold text-amber-400">Warnings:</p>
              <ul className="mt-1 space-y-1 text-xs text-amber-300">
                {parseErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {parseErrors.length > 5 ? (
                  <li>...and {parseErrors.length - 5} more</li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {/* Preview Stats */}
      {previewStats ? (
        <div className="glass rounded-2xl p-6">
          <p className="text-sm font-semibold text-slate-50">Preview Summary</p>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sales</p>
              <p className="mt-1 text-xl font-semibold text-emerald-400">
                +{formatMoney(previewStats.totalSales, "USD")}
              </p>
              <p className="text-xs text-slate-400">{previewStats.salesCount} transactions</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Adjustments</p>
              <p className={`mt-1 text-xl font-semibold ${previewStats.totalAdjustments >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {previewStats.totalAdjustments >= 0 ? "+" : ""}{formatMoney(previewStats.totalAdjustments, "USD")}
              </p>
              <p className="text-xs text-slate-400">{previewStats.adjustmentCount} transactions</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Net Total</p>
              <p className={`mt-1 text-xl font-semibold ${(previewStats.totalSales + previewStats.totalAdjustments) >= 0 ? "text-sky-400" : "text-rose-400"}`}>
                {(previewStats.totalSales + previewStats.totalAdjustments) >= 0 ? "+" : ""}{formatMoney(previewStats.totalSales + previewStats.totalAdjustments, "USD")}
              </p>
              <p className="text-xs text-slate-400">Sales + Adjustments</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Records</p>
              <p className="mt-1 text-xl font-semibold text-slate-50">
                {parsedData?.length ?? 0}
              </p>
              <p className="text-xs text-slate-400">to import</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Preview Table */}
      {parsedData && parsedData.length > 0 ? (
        <div className="glass rounded-2xl p-6">
          <p className="text-sm font-semibold text-slate-50">Preview Data (first 20 rows)</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 20).map((tx, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-2 pr-4 text-slate-300">
                      {tx.transactionDate.toLocaleDateString()}
                    </td>
                    <td
                      className={`py-2 pr-4 font-medium ${
                        tx.amount >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : ""}{formatMoney(tx.amount, "USD")}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          tx.transactionType === "SALES"
                            ? "bg-emerald-900/50 text-emerald-400"
                            : "bg-purple-900/50 text-purple-400"
                        }`}
                      >
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="max-w-xs truncate py-2 text-slate-400">{tx.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedData.length > 20 ? (
            <p className="mt-3 text-xs text-slate-400">
              Showing 20 of {parsedData.length} transactions
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
