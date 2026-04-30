import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isTemplateFieldKey, isTemplateLanguageCode } from "@/constants/template-fields";
import type { ProjectTemplateData } from "@/lib/template-registry";
import { LanguageProvider } from "@/templates/wedding/template-1/LanguageContext";
import { ProjectDataProvider } from "@/templates/wedding/template-1/ProjectDataContext";
import AlbumPage from "@/templates/wedding/template-1/AlbumPage";

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

  const [translationsRes, galleryRes, assetsRes] = await Promise.all([
    supabase.from("project_translations").select("*").eq("project_id", project.id),
    supabase
      .from("project_gallery")
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
    project,
    translations,
    gallery: galleryRes.data ?? [],
    assets: assetsRes.data ?? [],
  } as ProjectTemplateData;
}

export default async function ProjectAlbumPreviewPage({ params }: PageProps) {
  const { projectId } = await params;
  const projectData = await fetchProjectData(projectId);

  if (!projectData) notFound();

  return (
    <LanguageProvider projectData={projectData}>
      <ProjectDataProvider projectData={projectData} isPreview={true}>
        <AlbumPage />
      </ProjectDataProvider>
    </LanguageProvider>
  );
}
