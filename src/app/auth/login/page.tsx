import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
            TCG Manager
          </p>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-slate-300">
            Use the email/password you configured in Supabase Auth.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account yet? Create a user directly in your Supabase
          dashboard under <span className="font-semibold">Auth &gt; Users</span>.
        </p>
        <p className="text-center text-xs text-slate-500">
          <Link href="/" className="underline underline-offset-4">
            Back to landing page
          </Link>
        </p>
      </div>
    </main>
  );
}

