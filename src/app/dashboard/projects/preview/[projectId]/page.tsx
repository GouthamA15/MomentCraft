import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resolveTemplateComponent } from "@/lib/template-registry";
import type { ProjectTemplateData } from "@/lib/template-registry";
import { isTemplateFieldKey, isTemplateLanguageCode } from "@/constants/template-fields";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPreviewPage({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      "id,project_name,slug,status,event_date,template_id,theme_color,font_family,background_music,seo_title,seo_description,og_image",
    )
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return (
      <div className="p-4">
        <div className="glass mx-auto max-w-xl rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Project not found</h2>
          <p className="mt-1 text-sm text-slate-300">Unable to load project preview.</p>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-100">
            {JSON.stringify(projectError, null, 2)}
          </pre>
          <Link
            href="/dashboard/projects"
            className="mt-3 inline-flex rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const [{ data: template }, { data: translationsRows }, { data: gallery }, { data: assets }] = await Promise.all([
    supabase
      .from("templates")
      .select("template_code,is_active")
      .eq("id", project.template_id)
      .maybeSingle(),
    supabase
      .from("project_translations")
      .select("field_key,language_code,field_value")
      .eq("project_id", projectId),
    supabase
      .from("project_gallery")
      .select("image_url,sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_assets")
      .select("asset_type,file_url,file_name")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
  ]);

  const templateCode = template?.is_active ? template.template_code : null;
  const TemplateComponent = resolveTemplateComponent(templateCode);

  if (!TemplateComponent) {
    return (
      <div className="p-4">
        <div className="glass mx-auto max-w-xl rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Project preview not available</h2>
          <p className="mt-1 text-sm text-slate-300">
            Template is missing, inactive, or not connected in the registry.
          </p>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-100">
            {JSON.stringify({ template }, null, 2)}
          </pre>
          <Link
            href="/dashboard/projects"
            className="mt-3 inline-flex rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const translations: ProjectTemplateData["translations"] = {};
  for (const row of (translationsRows ?? []) as Array<{ field_key: unknown; language_code: unknown; field_value: unknown }>) {
    if (!isTemplateFieldKey(row.field_key) || !isTemplateLanguageCode(row.language_code)) continue;
    const value = typeof row.field_value === "string" ? row.field_value : null;
    const byLanguage = (translations[row.field_key] ??= {});
    byLanguage[row.language_code] = value;
  }

  const projectData: ProjectTemplateData = {
    project: {
      id: project.id,
      project_name: project.project_name,
      slug: project.slug,
      status: project.status,
      event_date: project.event_date,
      template_id: project.template_id,
      theme_color: project.theme_color,
      font_family: project.font_family,
      background_music: project.background_music,
      seo_title: project.seo_title,
      seo_description: project.seo_description,
      og_image: project.og_image,
    },
    translations,
    gallery: (gallery ?? []) as Array<{ image_url: string; sort_order: number }>,
    assets: (assets ?? []) as Array<{ asset_type: string | null; file_url: string; file_name: string | null }>,
  };

  return <TemplateComponent projectData={projectData} />;
}
