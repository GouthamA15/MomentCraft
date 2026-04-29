import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="glass w-full max-w-md rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">Admin Access</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Sign in to Dashboard</h1>
        <p className="mt-1 text-sm text-slate-300">
          Authorized administrators only.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
