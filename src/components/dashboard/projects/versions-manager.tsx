"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProjectVersionRow = {
  id: string;
  project_id: string;
  version_number: number;
  change_notes: string | null;
  created_at: string;
};

type Props = {
  projectId: string;
  projectName: string;
  initialVersions: ProjectVersionRow[];
};

export function VersionsManager({ projectId, projectName, initialVersions }: Props) {
  const router = useRouter();
  const [changeNotes, setChangeNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createSnapshot() {
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeNotes: changeNotes.trim() || undefined }),
      });

      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to create snapshot");

      setChangeNotes("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create snapshot");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="glass rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Version History</h2>
        <p className="text-sm text-slate-300">{projectName}</p>
      </section>

      <section className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white">Create snapshot</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="Change notes (optional)"
            />
          </div>
          <div>
            <Button type="button" className="w-full" onClick={createSnapshot} disabled={submitting}>
              {submitting ? "Saving…" : "Save snapshot"}
            </Button>
          </div>
        </div>
        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      </section>

      <section className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white">Snapshots</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-300">
                <th className="py-2">Version</th>
                <th className="py-2">Notes</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {initialVersions.map((v) => (
                <tr key={v.id} className="border-t border-white/10">
                  <td className="py-3 pr-3 font-semibold text-slate-100">v{v.version_number}</td>
                  <td className="py-3 pr-3 text-slate-200">{v.change_notes ?? "-"}</td>
                  <td className="py-3 text-slate-300">{new Date(v.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!initialVersions.length ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-300">
                    No snapshots yet.
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
