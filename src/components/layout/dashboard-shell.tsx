"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/import", label: "Import" },
  { href: "/dashboard/spending", label: "Spending" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10 md:px-10">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            TCG Manager
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-800 ${
                    active ? "bg-slate-900 text-sky-200" : "text-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
                Dashboard
              </p>
              <h1 className="text-3xl font-semibold text-slate-50">
                Seller cockpit
              </h1>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
              Supabase + Next.js
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
