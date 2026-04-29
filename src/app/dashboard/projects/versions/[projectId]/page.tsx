import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VersionsManager, type ProjectVersionRow } from "@/components/dashboard/projects/versions-manager";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectVersionsPage({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: versions }] = await Promise.all([
    supabase.from("projects").select("id,project_name").eq("id", projectId).maybeSingle(),
    supabase
      .from("project_versions")
      .select("id,project_id,version_number,change_notes,created_at")
      .eq("project_id", projectId)
      .order("version_number", { ascending: false })
      .limit(50),
  ]);

  if (!project) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Project not found</h2>
          <p className="text-sm text-slate-300">Unable to load version history.</p>
        </div>
        <Link
          href="/dashboard/projects"
          className="inline-flex w-fit rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <VersionsManager
      projectId={project.id}
      projectName={project.project_name}
      initialVersions={(versions ?? []) as ProjectVersionRow[]}
    />
  );
}
