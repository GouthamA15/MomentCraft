import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set("dev_admin_session", "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
