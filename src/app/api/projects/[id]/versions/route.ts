import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const DEV_AUTH_COOKIE = "dev_admin_session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireDashboardAuth();
    const { id: projectId } = await context.params;
    const supabase = serviceClient();

    const { data, error } = await supabase
      .from("project_versions")
      .select("id,project_id,version_number,change_notes,created_at")
      .eq("project_id", projectId)
      .order("version_number", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ versions: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireDashboardAuth();
    const { id: projectId } = await context.params;
    const supabase = serviceClient();

    const body = (await request.json()) as { changeNotes?: string };
    const changeNotes = body.changeNotes?.trim() || null;

    const [{ data: project, error: projectError }, { data: existingVersions, error: versionsError }] =
      await Promise.all([
        supabase
          .from("projects")
          .select(
            "id,project_name,slug,status,publish_status,published_at,event_date,vendor_id,client_id,template_id,theme_color,font_family,background_music,seo_title,seo_description,og_image,created_at,updated_at",
          )
          .eq("id", projectId)
          .single(),
        supabase
          .from("project_versions")
          .select("version_number")
          .eq("project_id", projectId)
          .order("version_number", { ascending: false })
          .limit(1),
      ]);

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (versionsError) {
      return NextResponse.json({ error: versionsError.message }, { status: 500 });
    }

    const lastVersion = existingVersions?.[0]?.version_number ?? 0;
    const nextVersion = Number.isFinite(lastVersion) ? lastVersion + 1 : 1;

    const [translationsRes, mediaRes, assetsRes] = await Promise.all([
      supabase
        .from("project_translations")
        .select("field_key,language_code,field_value")
        .eq("project_id", projectId),
      supabase
        .from("project_media")
        .select("media_url,section_key,media_type,sort_order,storage_path")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("project_assets")
        .select("asset_type,file_url,file_name")
        .eq("project_id", projectId),
    ]);

    if (translationsRes.error) {
      return NextResponse.json({ error: translationsRes.error.message }, { status: 500 });
    }
    if (mediaRes.error) {
      return NextResponse.json({ error: mediaRes.error.message }, { status: 500 });
    }
    if (assetsRes.error) {
      return NextResponse.json({ error: assetsRes.error.message }, { status: 500 });
    }

    const snapshot = {
      project,
      translations: translationsRes.data ?? [],
      media: mediaRes.data ?? [],
      assets: assetsRes.data ?? [],
      captured_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabase
      .from("project_versions")
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        change_notes: changeNotes,
        snapshot,
      })
      .select("id")
      .single();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    return NextResponse.json({ success: true, id: inserted?.id, version: nextVersion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
