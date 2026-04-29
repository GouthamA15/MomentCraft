"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function decodeJwtPayload(token: string | null | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

type TestOutput = {
  user: unknown;
  userError: unknown;
  session: {
    exists: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    expires_at: number | null;
    jwtPayload: Record<string, unknown> | null;
  };
  select: { ok: boolean; rows: number; error: unknown };
  insert: { ok: boolean; payload: unknown; data: unknown; error: unknown };
};

export function SupabaseTestClient() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<TestOutput | null>(null);

  const run = async () => {
    setRunning(true);

    const supabase = createClient();

    const userRes = await supabase.auth.getUser();
    const sessionRes = await supabase.auth.getSession();

    const session = sessionRes.data.session;
    const jwtPayload = decodeJwtPayload(session?.access_token);

    const selectRes = await supabase.from("vendors").select("*").limit(5);

    const insertPayload = {
      business_name: `Debug Test Vendor (browser) ${new Date().toISOString()}`,
      is_active: true,
    };

    const insertRes = await supabase
      .from("vendors")
      .insert(insertPayload)
      .select("id,business_name,is_active,created_at")
      .single();

    console.log("[supabase-test][browser] user", userRes);
    console.log("[supabase-test][browser] session", sessionRes, { jwtPayload });
    console.log("[supabase-test][browser] select vendors", selectRes);
    console.log("[supabase-test][browser] insert vendors", { payload: insertPayload, result: insertRes });

    setOutput({
      user: userRes.data.user
        ? {
            id: userRes.data.user.id,
            email: userRes.data.user.email,
            app_metadata: userRes.data.user.app_metadata,
            user_metadata: userRes.data.user.user_metadata,
          }
        : null,
      userError: userRes.error,
      session: {
        exists: Boolean(session),
        hasAccessToken: Boolean(session?.access_token),
        hasRefreshToken: Boolean(session?.refresh_token),
        expires_at: session?.expires_at ?? null,
        jwtPayload,
      },
      select: {
        ok: !selectRes.error,
        rows: selectRes.data?.length ?? 0,
        error: selectRes.error,
      },
      insert: {
        ok: !insertRes.error,
        payload: insertPayload,
        data: insertRes.data,
        error: insertRes.error,
      },
    });

    setRunning(false);
  };

  return (
    <section className="glass rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Browser Client Checks</h3>
        <Button type="button" variant="outline" disabled={running} onClick={run}>
          {running ? "Running..." : "Run Browser Tests"}
        </Button>
      </div>
      <p className="text-xs text-slate-300">
        Runs the same checks using the browser Supabase client. Useful to confirm whether the app is operating as
        <span className="mx-1 text-slate-100">authenticated</span>
        or
        <span className="mx-1 text-slate-100">anon</span>
        under RLS.
      </p>

      <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-100">
        {output ? JSON.stringify(output, null, 2) : "Click Run Browser Tests to execute."}
      </pre>
    </section>
  );
}
