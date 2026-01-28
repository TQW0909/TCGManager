import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Currency = "USD" | "CNY";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

function makePair(base: Currency, quote: Currency) {
  return `${base}_${quote}`;
}

async function fetchRateExternal(base: Currency, quote: Currency): Promise<number> {
  // Prefer a no-auth endpoint.
  // 1) open.er-api.com
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      // Next.js server fetch cache: allow revalidation; DB caching is handled separately.
      next: { revalidate: 60 * 60 },
    });
    if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
    const json: unknown = await res.json();
    const rate = (json as { rates?: Record<string, unknown> })?.rates?.[quote];
    if (typeof rate !== "number") throw new Error("FX rate missing");
    return rate;
  } catch {
    // 2) exchangerate.host (may be rate-limited / key-gated, but try)
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=${base}&symbols=${quote}`,
      { next: { revalidate: 60 * 60 } }
    );
    if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
    const json: unknown = await res.json();
    const rate = (json as { rates?: Record<string, unknown> })?.rates?.[quote];
    if (typeof rate !== "number") throw new Error("FX rate missing");
    return rate;
  }
}

export async function getFxRateCached(base: Currency, quote: Currency) {
  if (base === quote) {
    return { rate: 1, fetchedAt: new Date().toISOString(), cached: true };
  }

  const supabase = await createSupabaseServerClient();
  const pair = makePair(base, quote);

  const { data: existing } = await supabase
    .from("fx_rates")
    .select("rate,fetched_at")
    .eq("pair", pair)
    .maybeSingle();

  const fetchedAtIso = existing?.fetched_at as string | undefined;
  const fetchedAt = fetchedAtIso ? new Date(fetchedAtIso).getTime() : 0;
  const isFresh = fetchedAt && Date.now() - fetchedAt < TWELVE_HOURS_MS;

  if (existing?.rate != null && isFresh) {
    return { rate: Number(existing.rate), fetchedAt: fetchedAtIso!, cached: true };
  }

  const rate = await fetchRateExternal(base, quote);

  const nowIso = new Date().toISOString();
  await supabase.from("fx_rates").upsert(
    {
      pair,
      base_currency: base,
      quote_currency: quote,
      rate,
      fetched_at: nowIso,
    },
    { onConflict: "pair" }
  );

  return { rate, fetchedAt: nowIso, cached: false };
}
