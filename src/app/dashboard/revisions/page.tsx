import { createClient } from "@/lib/supabase/server";
import { RevisionsManager, type RevisionRow } from "@/components/dashboard/revisions/revisions-manager";

export default async function RevisionsPage() {
  const supabase = await createClient();

  const [{ data: revisions }, { data: projects }] = await Promise.all([
    supabase
      .from("revisions")
      .select("id,project_id,requested_by,revision_note,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("projects")
      .select("id,project_name")
      .order("updated_at", { ascending: false })
      .limit(200),
  ]);

  return (
    <RevisionsManager
      projects={(projects ?? []) as Array<{ id: string; project_name: string }>}
      initialRevisions={(revisions ?? []) as RevisionRow[]}
    />
  );
}
