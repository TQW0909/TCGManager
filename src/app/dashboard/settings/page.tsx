export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Settings</h2>
        <p className="text-sm text-slate-300">
          Configure default currency, platform preferences, and profile details.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Display name
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="Your seller name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Default currency
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="USD"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Preferred platform
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="Whatnot"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Notification email
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Save settings
          </button>
          <button className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-500">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
