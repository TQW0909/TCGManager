"use client";

import { useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { ExpenseCategory } from "@/lib/types/db";

interface ExpenseFormProps {
  category: ExpenseCategory;
  title: string;
  description: string;
  placeholder: string;
}

export function ExpenseForm({ category, title, description, placeholder }: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const a = Number(amount);
    return a > 0 && Number.isFinite(a) && !loading;
  }, [amount, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

    const payload = {
      user_id: userRes.user.id,
      category,
      amount: Number(amount),
      description: expenseDescription || null,
      expense_date: expenseDate,
    };

    const { error: insertErr } = await supabase.from("expenses").insert(payload);

    setLoading(false);

    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    setOk("Expense added.");
    setAmount("");
    setExpenseDescription("");
    window.location.reload();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-50">{title}</p>
        <p className="text-sm text-slate-300">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Amount ($)
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder={placeholder}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Date
          </label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Description (optional)
          </label>
          <input
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="e.g., Monthly supplies"
          />
        </div>

        {error ? (
          <p className="text-sm text-rose-300 md:col-span-3" role="alert">
            {error}
          </p>
        ) : null}
        {ok ? (
          <p className="text-sm text-emerald-300 md:col-span-3">{ok}</p>
        ) : null}

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
