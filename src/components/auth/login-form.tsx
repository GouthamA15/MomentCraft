"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const fallbackEnabled =
      process.env.NEXT_PUBLIC_DEV_FALLBACK_AUTH_ENABLED === "true";
    const fallbackEmail = process.env.NEXT_PUBLIC_DEV_FALLBACK_EMAIL;
    const fallbackPassword = process.env.NEXT_PUBLIC_DEV_FALLBACK_PASSWORD;

    if (fallbackEnabled && fallbackEmail && fallbackPassword) {
      const isFallbackMatch =
        email.trim().toLowerCase() === fallbackEmail.trim().toLowerCase() &&
        password === fallbackPassword;

      if (!isFallbackMatch) {
        setError("Invalid credentials.");
        return;
      }

      const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 4;
      document.cookie = `dev_admin_session=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300">Email</p>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300">Password</p>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4"
          />
          Remember me
        </label>
        <button type="button" className="text-cyan-200 hover:text-cyan-100">
          Forgot password?
        </button>
      </div>
      {error ? <p className="rounded-lg border border-red-300/30 bg-red-500/10 p-2 text-sm text-red-200">{error}</p> : null}
      <Button className="h-10 w-full" disabled={loading}>
        {loading ? "Signing in..." : "Login to Dashboard"}
      </Button>
    </form>
  );
}
