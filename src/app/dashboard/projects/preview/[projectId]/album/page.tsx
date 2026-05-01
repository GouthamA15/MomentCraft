import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isTemplateFieldKey, isTemplateLanguageCode } from "@/constants/template-fields";
import type { ProjectTemplateData } from "@/lib/template-registry";
import { resolveTemplateAlbumComponent } from "@/lib/template-registry";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

async function fetchProjectData(projectId: string) {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) return null;

  const [{ data: template }, translationsRes, mediaRes, assetsRes] = await Promise.all([
    supabase.from("templates").select("template_code").eq("id", project.template_id).maybeSingle(),
    supabase.from("project_translations").select("*").eq("project_id", project.id),
    supabase
      .from("project_media")
      .select("*")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true }),
  ]);

  const translations: ProjectTemplateData["translations"] = {};
  for (const row of (translationsRes.data ?? []) as Array<{ field_key: unknown; language_code: unknown; field_value: unknown }>) {
    if (!isTemplateFieldKey(row.field_key) || !isTemplateLanguageCode(row.language_code)) continue;
    const value = typeof row.field_value === "string" ? row.field_value : null;
    const byLanguage = (translations[row.field_key] ??= {});
    byLanguage[row.language_code] = value;
  }

  return {
    projectData: {
      project,
      translations,
      media: mediaRes.data ?? [],
      assets: assetsRes.data ?? [],
    } as ProjectTemplateData,
    templateCode: template?.template_code,
  };
}

export default async function ProjectAlbumPreviewPage({ params }: PageProps) {
  const { projectId } = await params;
  const result = await fetchProjectData(projectId);

  if (!result || !result.projectData) notFound();

  const AlbumComponent = resolveTemplateAlbumComponent(result.templateCode);
  if (!AlbumComponent) notFound();

  return <AlbumComponent projectData={result.projectData} isPreview={true} />;
}
