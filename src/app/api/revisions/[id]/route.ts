import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const DEV_AUTH_COOKIE = "dev_admin_session";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function requireDashboardAuth() {
  const cookieStore = await cookies();
  const fallbackEnabled = process.env.NEXT_PUBLIC_DEV_FALLBACK_AUTH_ENABLED === "true";
  const hasDevSession = cookieStore.get(DEV_AUTH_COOKIE)?.value === "1";

  if (fallbackEnabled && hasDevSession) return;

  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const authClient = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op
      },
    },
  });

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) throw new Error("Unauthorized");
}

function serviceClient() {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireDashboardAuth();
    const { id } = await ctx.params;
    const supabase = serviceClient();

    const body = (await request.json()) as { status?: string };
    const status = body.status?.trim();

    const allowed = new Set(["pending", "in_progress", "resolved", "cancelled"]);
    if (!status || !allowed.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { error } = await supabase
      .from("revisions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
