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

    const { mediaId, storagePath } = await request.json();

    if (!mediaId || !storagePath) {
      return NextResponse.json({ error: "mediaId and storagePath are required." }, { status: 400 });
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

    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage.from(bucket).remove([storagePath]);

    if (storageError) {
      // eslint-disable-next-line no-console
      console.error("Storage delete error:", storageError);
      // We continue even if storage delete fails to ensure DB record is cleaned up, 
      // or we can fail here. Let's fail for safety.
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    // 2. Delete from project_media
    const { error: dbError } = await supabase
      .from("project_media")
      .delete()
      .eq("id", mediaId);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
