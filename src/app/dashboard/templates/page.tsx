import Link from "next/link";
import { Eye, WandSparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { TemplateRow } from "@/types/project";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("id,template_name,template_code,event_type,preview_image,template_path,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const templates = (data ?? []) as TemplateRow[];

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Templates</h2>
        <p className="text-sm text-slate-300">
          Choose a template and preview before assignment.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.length === 0 ? (
          <article className="glass rounded-xl p-4 text-sm text-slate-300">
            No active templates found in database.
          </article>
        ) : (
          templates.map((template) => (
            <article key={template.id} className="glass rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{template.template_code}</p>
              <h3 className="mt-1 text-base font-semibold text-white">{template.template_name}</h3>
              <p className="mt-1 text-xs text-slate-300">Category: {template.event_type}</p>

              <div className="mt-3 overflow-hidden rounded-lg border border-white/15 bg-slate-900/40">
                <img
                  src={template.preview_image || "/reference.png"}
                  alt={`${template.template_name} thumbnail`}
                  className="h-36 w-full object-cover"
                />
              </div>

              <p className="mt-3 text-xs text-slate-300">
                Template deployment card with preview and project creation workflow.
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/templates/preview/${template.template_code}`}
                  className="inline-flex items-center gap-1 rounded-md border border-cyan-300/40 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:bg-cyan-300/20"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Link>
                <Link
                  href={`/dashboard/projects/create?templateId=${template.id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/10"
                >
                  <WandSparkles className="h-3.5 w-3.5" /> Use Template
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
