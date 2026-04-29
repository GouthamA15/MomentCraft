import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fallbackEnabled =
    process.env.NEXT_PUBLIC_DEV_FALLBACK_AUTH_ENABLED === "true";
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const cookieStore = await cookies();
  const hasDevSession =
    fallbackEnabled && cookieStore.get("dev_admin_session")?.value === "1";

  let hasUser = false;
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasUser = Boolean(user);
  }

  if (!hasUser && !hasDevSession) redirect("/login");

  return <DashboardShell>{children}</DashboardShell>;
}
