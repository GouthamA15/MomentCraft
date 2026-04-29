import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const authRoutes = ["/login"];
const protectedRoutes = ["/dashboard", "/preview"];
const DEV_AUTH_COOKIE = "dev_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const fallbackEnabled =
    process.env.NEXT_PUBLIC_DEV_FALLBACK_AUTH_ENABLED === "true";
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasDevSession = request.cookies.get(DEV_AUTH_COOKIE)?.value === "1";

  let response = NextResponse.next({ request });
  let user: unknown = null;

  if (hasSupabaseEnv) {
    const session = await updateSession(request);
    response = session.response;
    user = session.user;
  }

  const isAuthenticated = Boolean(user) || (fallbackEnabled && hasDevSession);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/preview/:path*", "/login"],
};
