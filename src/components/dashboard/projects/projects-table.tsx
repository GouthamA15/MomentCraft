"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProjectListRow } from "@/types/project";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils/date-format";

function getRelationField<T extends Record<string, unknown>>(
  relation: T | T[] | null | undefined,
  field: keyof T,
): string | undefined {
  if (!relation) return undefined;
  if (Array.isArray(relation)) {
    const first = relation[0];
    const value = first?.[field];
    return typeof value === "string" ? value : undefined;
  }
  const value = relation[field];
  return typeof value === "string" ? value : undefined;
}

type PublishAction = "publish" | "unpublish" | "archive" | "restore";

function getPublicPath(slug: string) {
  return `/site/${slug}`;
}

function getPublicUrl(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = siteUrl ? siteUrl.replace(/\/$/, "") : window.location.origin;
  return `${baseUrl}${getPublicPath(slug)}`;
}

export function ProjectsTable({ initialProjects }: { initialProjects: ProjectListRow[] }) {
  const [projects, setProjects] = useState<ProjectListRow[]>(initialProjects);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const [confirm, setConfirm] = useState<{
    open: boolean;
    action: PublishAction | null;
    projectId: string | null;
  }>({ open: false, action: null, projectId: null });

  const openConfirm = (projectId: string, action: PublishAction) => {
    setConfirm({ open: true, action, projectId });
  };

  const closeConfirm = () => {
    setConfirm({ open: false, action: null, projectId: null });
  };

  const runPublishAction = async (projectId: string, action: PublishAction) => {
    setBusyId(projectId);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update publish state.");

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                status: result.status ?? p.status,
                publish_status: result.publish_status ?? p.publish_status,
                published_at:
                  Object.prototype.hasOwnProperty.call(result, "published_at") ? result.published_at : p.published_at,
              }
            : p,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyLink = async (slug: string) => {
    try {
      const url = getPublicUrl(slug);
      await navigator.clipboard.writeText(url);
    } catch {
      setError("Copy failed. Your browser may block clipboard access.");
    }
  };

  const handleDelete = async (projectId: string) => {
    const ok = window.confirm("Delete this project? This will remove all related content, gallery, and assets.");
    if (!ok) return;

    setBusyId(projectId);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete project.");

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="glass overflow-x-auto rounded-xl p-2">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="text-xs uppercase tracking-[0.15em] text-slate-300">
            <tr>
              <th className="px-3 py-2">Project</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Template</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Updated</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-300" colSpan={7}>
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="border-t border-white/10">
                  <td className="px-3 py-2">{project.project_name}</td>
                  <td className="px-3 py-2">
                    {getRelationField(project.clients, "client_name") ?? "-"}
                  </td>
                  <td className="px-3 py-2">
                    {getRelationField(project.vendors, "business_name") ?? "-"}
                  </td>
                  <td className="px-3 py-2">
                    {getRelationField(project.templates, "template_name") ?? "-"}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-white/10 px-2 py-1 text-xs">{project.status}</span>
                  </td>
                  <td className="px-3 py-2">{formatDisplayDate(project.updated_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Link
                        href={`/dashboard/projects/edit/${project.id}`}
                        className="rounded border border-white/20 px-2 py-1 hover:bg-white/10"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/projects/preview/${project.id}`}
                        className="rounded border border-white/20 px-2 py-1 hover:bg-white/10"
                      >
                        Preview
                      </Link>

                      {project.status === "published" && project.publish_status ? (
                        <>
                          <a
                            href={getPublicPath(project.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-cyan-300/40 bg-cyan-300/10 px-2 py-1 text-cyan-100 hover:bg-cyan-300/20"
                          >
                            Open Live
                          </a>
                          <a
                            href={`/api/qr?path=${encodeURIComponent(getPublicPath(project.slug))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-white/20 bg-white/5 px-2 py-1 text-slate-100 hover:bg-white/10"
                          >
                            QR
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleCopyLink(project.slug)}
                            className="h-auto rounded border-cyan-300/40 px-2 py-1 text-xs text-cyan-100 hover:bg-cyan-300/10"
                          >
                            Copy Link
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busyId === project.id}
                            onClick={() => openConfirm(project.id, "unpublish")}
                            className="h-auto rounded border-white/20 px-2 py-1 text-xs text-slate-100 hover:bg-white/10"
                          >
                            Unpublish
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busyId === project.id}
                            onClick={() => openConfirm(project.id, "archive")}
                            className="h-auto rounded border-amber-300/40 px-2 py-1 text-xs text-amber-100 hover:bg-amber-500/10"
                          >
                            Archive
                          </Button>
                        </>
                      ) : project.status === "archived" ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busyId === project.id}
                          onClick={() => openConfirm(project.id, "restore")}
                          className="h-auto rounded border-white/20 px-2 py-1 text-xs text-slate-100 hover:bg-white/10"
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busyId === project.id}
                          onClick={() => openConfirm(project.id, "publish")}
                          className="h-auto rounded border-emerald-300/40 px-2 py-1 text-xs text-emerald-100 hover:bg-emerald-500/10"
                        >
                          Publish
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === project.id}
                        onClick={() => handleDelete(project.id)}
                        className="h-auto rounded border-red-300/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
                      >
                        {busyId === project.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>

                    {project.status === "published" && project.publish_status ? (
                      <div className="mt-1 text-[11px] text-slate-400">{getPublicPath(project.slug)}</div>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirm.open && confirm.projectId && confirm.action ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass w-full max-w-md rounded-xl border border-white/10 p-4">
            <h3 className="text-base font-semibold text-white">
              {confirm.action === "publish"
                ? "Publish project?"
                : confirm.action === "unpublish"
                  ? "Unpublish project?"
                  : confirm.action === "archive"
                    ? "Archive project?"
                    : "Restore project to draft?"}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              {confirm.action === "publish"
                ? "This will make the project publicly accessible via its shareable URL."
                : confirm.action === "unpublish"
                  ? "This will disable the public URL and return the project to draft state."
                  : confirm.action === "archive"
                    ? "This will disable the public URL and hide the project from delivery."
                    : "This will move the project back to draft (not public)."}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeConfirm}
                className="h-auto rounded border-white/20 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={busyId === confirm.projectId}
                onClick={async () => {
                  const { projectId, action } = confirm;
                  if (!projectId || !action) return;
                  closeConfirm();
                  await runPublishAction(projectId, action);
                }}
                className="h-auto rounded bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
              >
                {busyId === confirm.projectId ? "Working..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
