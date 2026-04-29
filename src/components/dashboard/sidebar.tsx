"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  UserCircle2,
  FolderKanban,
  GitPullRequestArrow,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/templates", label: "Templates", icon: Layers },
  { href: "/dashboard/vendors", label: "Vendors", icon: Users },
  { href: "/dashboard/clients", label: "Clients", icon: UserCircle2 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/revisions", label: "Revisions", icon: GitPullRequestArrow },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass h-full w-64 rounded-2xl p-3">
      <p className="mb-3 px-2 text-xs uppercase tracking-[0.2em] text-cyan-100">Admin Panel</p>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10",
                pathname === item.href && "bg-cyan-400/20 text-cyan-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action="/api/logout" method="post" className="mt-4 border-t border-white/10 pt-3">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </form>
    </aside>
  );
}
