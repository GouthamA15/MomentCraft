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

  if (!user) {
    throw new Error("Unauthorized");
  }
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

export async function GET() {
  try {
    await requireDashboardAuth();
    const supabase = serviceClient();

    const { data, error } = await supabase
      .from("revisions")
      .select("id,project_id,requested_by,revision_note,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ revisions: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireDashboardAuth();
    const supabase = serviceClient();

    const body = (await request.json()) as {
      projectId?: string;
      requestedBy?: string;
      revisionNote?: string;
    };

    const projectId = body.projectId?.trim();
    const revisionNote = body.revisionNote?.trim();
    const requestedBy = body.requestedBy?.trim() || null;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    if (!revisionNote) {
      return NextResponse.json({ error: "revisionNote is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("revisions")
      .insert({
        project_id: projectId,
        requested_by: requestedBy,
        revision_note: revisionNote,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
