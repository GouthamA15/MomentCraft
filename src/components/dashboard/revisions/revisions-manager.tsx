"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type RevisionRow = {
  id: string;
  project_id: string;
  requested_by: string | null;
  revision_note: string;
  status: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectOption = { id: string; project_name: string };

type Props = {
  projects: ProjectOption[];
  initialRevisions: RevisionRow[];
};

export function RevisionsManager({ projects, initialRevisions }: Props) {
  const router = useRouter();

  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [requestedBy, setRequestedBy] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects) map.set(p.id, p.project_name);
    return map;
  }, [projects]);

  async function createRevision() {
    setError(null);

    if (!projectId) {
      setError("Select a project.");
      return;
    }
    if (!note.trim()) {
      setError("Revision note is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          requestedBy: requestedBy.trim() || undefined,
          revisionNote: note.trim(),
        }),
      });

      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to create revision");

      setRequestedBy("");
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create revision");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setError(null);
    try {
      const res = await fetch(`/api/revisions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    }
  }

  return (
    <div className="space-y-4">
      <section className="glass rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Revisions</h2>
        <p className="text-sm text-slate-300">Track client feedback and delivery changes.</p>
      </section>

      <section className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white">Create revision</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <p className="mb-1 text-xs text-slate-300">Project</p>
            <select
              className="w-full rounded-lg border border-white/20 bg-white/5 p-2 text-sm text-slate-100"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Requested by</p>
            <Input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="Client / Vendor" />
          </div>
          <div className="md:col-span-3">
            <p className="mb-1 text-xs text-slate-300">Revision note</p>
            <textarea
              className="min-h-24 w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-slate-100"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what needs to change…"
            />
          </div>
        </div>

        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}

        <div className="mt-3">
          <Button type="button" onClick={createRevision} disabled={submitting}>
            {submitting ? "Creating…" : "Create revision"}
          </Button>
        </div>
      </section>

      <section className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white">Recent revisions</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-300">
                <th className="py-2">Project</th>
                <th className="py-2">Requested By</th>
                <th className="py-2">Note</th>
                <th className="py-2">Status</th>
                <th className="py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {initialRevisions.map((r) => (
                <tr key={r.id} className="border-t border-white/10 align-top">
                  <td className="py-3 pr-3 text-slate-100">
                    {projectsById.get(r.project_id) ?? r.project_id}
                  </td>
                  <td className="py-3 pr-3 text-slate-200">{r.requested_by ?? "-"}</td>
                  <td className="py-3 pr-3 text-slate-200">{r.revision_note}</td>
                  <td className="py-3 pr-3">
                    <select
                      className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-xs text-slate-100"
                      value={r.status ?? "pending"}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                    >
                      <option value="pending" className="bg-slate-900">
                        Pending
                      </option>
                      <option value="in_progress" className="bg-slate-900">
                        In Progress
                      </option>
                      <option value="resolved" className="bg-slate-900">
                        Resolved
                      </option>
                      <option value="cancelled" className="bg-slate-900">
                        Cancelled
                      </option>
                    </select>
                  </td>
                  <td className="py-3 text-slate-300">
                    {new Date(r.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!initialRevisions.length ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-300">
                    No revisions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
