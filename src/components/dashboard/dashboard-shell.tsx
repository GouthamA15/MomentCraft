"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

function shouldHideDashboardChrome(pathname: string) {
  return (
    pathname.startsWith("/dashboard/templates/preview/") ||
    pathname.startsWith("/dashboard/projects/preview/")
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (shouldHideDashboardChrome(pathname)) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <div className="space-y-4">
        <DashboardHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
