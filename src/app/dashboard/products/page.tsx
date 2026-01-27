import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/products/product-form";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id,type,name,game,set_name,set_code,condition,sku,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Products</h2>
        <p className="text-sm text-slate-300">
          Your catalog (singles + sealed). Purchases and sales link to these.
        </p>
      </div>

      <ProductForm />

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-50">All products</p>
          <p className="text-sm text-slate-300">
            Tip: keep names consistent so you can search fast during streams.
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 bg-slate-900/60 text-sm">
            <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Game</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Set</th>
                <th className="px-4 py-3 font-semibold">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-100">
              {products?.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-slate-300">{p.game ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{p.type}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {p.set_name ?? p.set_code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {p.condition ?? "—"}
                  </td>
                </tr>
              ))}
              {products?.length ? null : (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-400" colSpan={5}>
                    No products yet. Add your first product above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
