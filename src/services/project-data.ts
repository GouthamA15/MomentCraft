import { createPublicReadClient } from "@/lib/supabase/public-server";
import { isTemplateFieldKey, isTemplateLanguageCode } from "@/constants/template-fields";
import type { ProjectTemplateData } from "@/lib/template-registry";

export async function fetchPublishedProjectBySlug(slug: string) {
  const { supabase, isServiceRole } = createPublicReadClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      "id,project_name,slug,status,publish_status,published_at,event_date,template_id,theme_color,font_family,background_music,seo_title,seo_description,og_image,album_enabled",
    )
    .eq("slug", slug)
    .eq("publish_status", true)
    .eq("status", "published")
    .maybeSingle();

  if (process.env.NODE_ENV === "development" && projectError) {
    // eslint-disable-next-line no-console
    console.error("[ProjectData] projects select error", { slug, isServiceRole, projectError });
  }

  if (!project) return null;

  const [templateRes, translationsRes, mediaRes, assetsRes] = await Promise.all([
    supabase.from("templates").select("template_code,is_active").eq("id", project.template_id).maybeSingle(),
    supabase.from("project_translations").select("field_key,language_code,field_value").eq("project_id", project.id),
    supabase
      .from("project_media")
      .select("id, project_id, section_key, media_url, storage_path, media_type, sort_order, created_at")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_assets")
      .select("asset_type,file_url,file_name")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true }),
  ]);

  const template = templateRes.data;
  const translationsRows = translationsRes.data;
  const media = mediaRes.data;
  const assets = assetsRes.data;

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
      album_enabled: project.album_enabled ?? true,
    },
    translations,
    media: (media ?? []) as ProjectTemplateData["media"],
    assets: (assets ?? []) as Array<{ asset_type: string | null; file_url: string; file_name: string | null }>,
  };

  return { projectData, templateCode: template?.is_active ? template.template_code : null };
}
