import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFxRateCached, type Currency } from "@/lib/fx";

function isCurrency(v: string | null): v is Currency {
  return v === "USD" || v === "CNY";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = url.searchParams.get("base");
  const quote = url.searchParams.get("quote");

  if (!isCurrency(base) || !isCurrency(quote)) {
    return NextResponse.json(
      { error: "Invalid base/quote. Supported: USD, CNY" },
      { status: 400 }
    );
  }

  // Require auth so we can use Supabase RLS-protected cache table.
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await getFxRateCached(base, quote);
    return NextResponse.json({ base, quote, ...res });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "FX lookup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
