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

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const fallbackEnabled = process.env.NEXT_PUBLIC_DEV_FALLBACK_AUTH_ENABLED === "true";
    const hasDevSession = cookieStore.get(DEV_AUTH_COOKIE)?.value === "1";

    if (!fallbackEnabled || !hasDevSession) {
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const form = await request.formData();
    const file = form.get("file");
    const projectId = String(form.get("projectId") || "").trim();
    const sectionKey = String(form.get("sectionKey") || "").trim();

    if (!projectId || !sectionKey) {
      return NextResponse.json({ error: "projectId and sectionKey are required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const bucket = "gallery";

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const ts = Date.now();
    const name = sanitizeFilename(file.name || "upload");
    const path = `projects/${projectId}/${sectionKey}/${ts}-${name}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 2. Get Public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const mediaUrl = publicUrlData.publicUrl;

    // 3. Insert into project_media
    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    const { data: mediaRow, error: dbError } = await supabase
      .from("project_media")
      .insert({
        project_id: projectId,
        section_key: sectionKey,
        media_url: mediaUrl,
        storage_path: path,
        media_type: mediaType,
      })
      .select("*")
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      media: mediaRow,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
