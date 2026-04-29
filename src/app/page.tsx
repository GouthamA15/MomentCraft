import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-14">
      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass rounded-2xl p-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs tracking-[0.2em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" /> Template Deployment Platform
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
            Premium wedding template publishing platform for admins.
          </h1>
          <p className="mt-4 text-sm text-slate-200">
            Launch and manage curated invitation templates with secure workflows,
            protected access, and production-grade dashboard foundations.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Enter Admin Login <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        <section className="glass rounded-2xl p-8">
          <h2 className="mb-4 text-sm uppercase tracking-[0.2em] text-cyan-100">
            Product Positioning
          </h2>
          <div className="space-y-3 text-sm text-slate-200">
            <p className="rounded-xl border border-white/20 p-3">
              Agency-grade dashboard with clean operational clarity.
            </p>
            <p className="rounded-xl border border-white/20 p-3">
              Secure Supabase authentication with protected route controls.
            </p>
            <p className="rounded-xl border border-white/20 p-3">
              Template-ready architecture for controlled phased rollout.
            </p>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-cyan-300" /> Admin-only access
          </div>
        </section>
      </div>
    </main>
  );
}
