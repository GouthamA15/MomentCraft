import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ProjectListRow } from "@/types/project";
import { ProjectsTable } from "@/components/dashboard/projects/projects-table";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(
      "id,project_name,slug,status,publish_status,published_at,updated_at,clients(client_name),vendors(business_name),templates(template_name)",
    )
    .order("updated_at", { ascending: false });

  if (process.env.NODE_ENV === "development") {
    console.log("[ProjectsPage] first row:", data?.[0]);
  }

  const projects = (data ?? []) as ProjectListRow[];

  return (
    <div className="space-y-4">
      <div className="glass flex items-center justify-between rounded-xl p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <p className="text-sm text-slate-300">Saved draft projects</p>
        </div>
        <Link
          href="/dashboard/projects/create"
          className="rounded-md border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-100"
        >
          Create Project
        </Link>
      </div>

      <ProjectsTable initialProjects={projects} />
    </div>
  );
}
