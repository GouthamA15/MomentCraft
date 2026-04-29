import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SupabaseTestClient } from "@/app/dashboard/debug/supabase-test/supabase-test-client";

function decodeJwtPayload(token: string | null | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function SupabaseDebugTestPage() {
  const cookieStore = await cookies();

  const fallbackEnabled = process.env.NEXT_PUBLIC_DEV_FALLBACK_AUTH_ENABLED === "true";
  const hasDevSession = cookieStore.get("dev_admin_session")?.value === "1";
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const jwtPayload = decodeJwtPayload(session?.access_token);

  const selectResult = await supabase.from("vendors").select("*").limit(5);

  const insertPayload = {
    business_name: `Debug Test Vendor ${new Date().toISOString()}`,
    is_active: true,
  };

  // This insert is intentionally executed server-side to reveal whether
  // the current request is using an authenticated session or anon role.
  const insertResult = await supabase
    .from("vendors")
    .insert(insertPayload)
    .select("id,business_name,is_active,created_at")
    .single();

  console.log("[supabase-test][server] env", { hasSupabaseEnv, fallbackEnabled, hasDevSession });
  console.log("[supabase-test][server] user", { user, userError });
  console.log("[supabase-test][server] session", {
    hasSession: Boolean(session),
    sessionError,
    hasAccessToken: Boolean(session?.access_token),
    hasRefreshToken: Boolean(session?.refresh_token),
    jwtPayload,
  });
  console.log("[supabase-test][server] select vendors", {
    count: selectResult.data?.length ?? 0,
    error: selectResult.error,
  });
  console.log("[supabase-test][server] insert vendors", {
    payload: insertPayload,
    data: insertResult.data,
    error: insertResult.error,
  });

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Supabase Auth + RLS Debug</h2>
        <p className="text-sm text-slate-300">Runtime verification of auth/session and vendors table access.</p>
      </div>

      <section className="glass rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">Environment</h3>
        <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-100">
          {JSON.stringify(
            { hasSupabaseEnv, fallbackEnabled, hasDevSession, note: "If hasDevSession=true without a Supabase session, RLS will behave like anon." },
            null,
            2,
          )}
        </pre>
      </section>

      <section className="glass rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">Check 1 — Current Auth User (server)</h3>
        <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-100">
          {JSON.stringify(
            {
              userExists: Boolean(user),
              user: user ? { id: user.id, email: user.email, app_metadata: user.app_metadata, user_metadata: user.user_metadata } : null,
              error: userError,
            },
            null,
            2,
          )}
        </pre>

        <h3 className="text-sm font-semibold text-white">Check 2 — Current Session (server)</h3>
        <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-100">
          {JSON.stringify(
            {
              sessionExists: Boolean(session),
              hasAccessToken: Boolean(session?.access_token),
              hasRefreshToken: Boolean(session?.refresh_token),
              expires_at: session?.expires_at ?? null,
              jwtPayload,
              error: sessionError,
            },
            null,
            2,
          )}
        </pre>
      </section>

      <section className="glass rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">Check 3 — SELECT vendors (server)</h3>
        <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-100">
          {JSON.stringify(
            {
              ok: !selectResult.error,
              rows: selectResult.data?.length ?? 0,
              error: selectResult.error,
            },
            null,
            2,
          )}
        </pre>

        <h3 className="text-sm font-semibold text-white">Check 4 — INSERT vendors (server)</h3>
        <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-100">
          {JSON.stringify(
            {
              payload: insertPayload,
              ok: !insertResult.error,
              data: insertResult.data,
              error: insertResult.error,
            },
            null,
            2,
          )}
        </pre>
      </section>

      <SupabaseTestClient />
    </div>
  );
}
