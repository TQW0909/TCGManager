import Link from "next/link";

const cards = [
  {
    title: "Track every sale",
    body: "Log orders, fees, and shipping to see true profit per sale and per stream.",
  },
  {
    title: "Know your cost basis",
    body: "Attach sales to purchase lots so COGS and remaining inventory are always accurate.",
  },
  {
    title: "Whatnot friendly",
    body: "Fields for buyer handles, platform fees, shipping, and session-level summaries.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-16 sm:px-12 lg:px-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_30%_20%,_rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-16">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
              TCG Manager
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
              Inventory & Profit Dashboard for Whatnot sellers
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Track cards, sealed product, purchases, and every fee to know
              exactly what you made per sale and over time.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
            >
              Sign in to dashboard
            </Link>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-sky-500/60"
            >
              Powered by Supabase
            </a>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-50">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{card.body}</p>
            </div>
          ))}
        </section>

        <section className="glass rounded-2xl p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-200">MVP focus</p>
              <h2 className="text-2xl font-semibold text-slate-50">
                Sales, fees, and true profit
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Log purchases by lot, attach sales to lots with FIFO, track
                platform fees and shipping, and monitor profit over any date
                range.
              </p>
            </div>
            <Link
              href="/dashboard/sales"
              className="rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-sky-100"
            >
              Record a sale
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
