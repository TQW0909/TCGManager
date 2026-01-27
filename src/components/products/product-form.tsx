"use client";

import { useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { ProductType, ConditionCode } from "@/lib/types/db";

const productTypes: Array<{ value: ProductType; label: string }> = [
  { value: "single_card", label: "Single card" },
  { value: "sealed_product", label: "Sealed product" },
];

const conditions: Array<{ value: Exclude<ConditionCode, null>; label: string }> =
  [
    { value: "NM", label: "NM" },
    { value: "LP", label: "LP" },
    { value: "MP", label: "MP" },
    { value: "HP", label: "HP" },
    { value: "DMG", label: "DMG" },
    { value: "SEALED", label: "SEALED" },
  ];

export function ProductForm() {
  const [type, setType] = useState<ProductType>("single_card");
  const [name, setName] = useState("");
  const [game, setGame] = useState("One Piece");
  const [setNameValue, setSetNameValue] = useState("");
  const [setCode, setSetCode] = useState("");
  const [condition, setCondition] = useState<string>("NM");
  const [sku, setSku] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = useMemo(() => name.trim().length > 0 && !loading, [name, loading]);

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
      type,
      name: name.trim(),
      game: game.trim() || null,
      set_name: setNameValue.trim() || null,
      set_code: setCode.trim() || null,
      condition: (condition || null) as ConditionCode,
      sku: sku.trim() || null,
    };

    const { error: insertErr } = await supabase.from("products").insert(payload);

    setLoading(false);

    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    setOk("Product added.");
    setName("");
    setSetNameValue("");
    setSetCode("");
    setSku("");
    // simplest: reload to refresh server list
    window.location.reload();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-50">Add product</p>
        <p className="text-sm text-slate-300">
          Keep it lightweight. You can refine later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProductType)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
          >
            {productTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Game
          </label>
          <input
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="One Piece / Pokemon"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder='e.g., "OP-13 JP Booster Box" or "Luffy (ST01-001)"'
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Set name
          </label>
          <input
            value={setNameValue}
            onChange={(e) => setSetNameValue(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="OP-13"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Set code
          </label>
          <input
            value={setCode}
            onChange={(e) => setSetCode(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="OP13"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Condition
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
          >
            {conditions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
            <option value="">—</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            SKU (optional)
          </label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            placeholder="internal sku"
          />
        </div>

        {error ? (
          <p className="text-sm text-rose-300 md:col-span-2" role="alert">
            {error}
          </p>
        ) : null}
        {ok ? (
          <p className="text-sm text-emerald-300 md:col-span-2">{ok}</p>
        ) : null}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}
