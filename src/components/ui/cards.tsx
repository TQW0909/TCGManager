import type { ReactNode } from "react";

export function Card({
  title,
  value,
  children,
}: {
  title: string;
  value?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
        {title}
      </p>
      {value ? (
        <div className="mt-2 text-2xl font-semibold text-slate-50">{value}</div>
      ) : null}
      {children ? <div className="mt-3 text-sm text-slate-300">{children}</div> : null}
    </div>
  );
}
