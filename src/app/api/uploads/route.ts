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
      // Verify authenticated admin session via Supabase auth cookie.
      const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
      const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

      const authClient = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // no-op for API route
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
    const kind = String(form.get("kind") || "").trim();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }

    const allowedKinds = new Set(["cover_image", "og_image", "background_music", "gallery", "video"]);
    if (!allowedKinds.has(kind)) {
      return NextResponse.json({ error: "Invalid kind." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const bucket = process.env.SUPABASE_ASSETS_BUCKET || "project-assets";

    const storage = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const ts = Date.now();
    const name = sanitizeFilename(file.name || "upload");
    const path = `projects/${projectId}/${kind}/${ts}-${name}`;

    const { error: uploadError } = await storage.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
      cacheControl: "3600",
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = storage.storage.from(bucket).getPublicUrl(path);
    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({
      success: true,
      bucket,
      path,
      publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
