import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createPublicReadClient } from "@/lib/supabase/public-server";
import { resolveTemplateComponent } from "@/lib/template-registry";
import type { ProjectTemplateData } from "@/lib/template-registry";
import { isTemplateFieldKey, isTemplateLanguageCode } from "@/constants/template-fields";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function fetchPublishedProjectBySlug(slug: string) {
  const { supabase, isServiceRole } = createPublicReadClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      "id,project_name,slug,status,publish_status,published_at,event_date,template_id,theme_color,font_family,background_music,seo_title,seo_description,og_image",
    )
    .eq("slug", slug)
    .eq("publish_status", true)
    .eq("status", "published")
    .maybeSingle();

  if (process.env.NODE_ENV === "development" && projectError) {
    // eslint-disable-next-line no-console
    console.error("[PublicSite] projects select error", { slug, isServiceRole, projectError });
  }

  if (!project) return null;

  const [templateRes, translationsRes, galleryRes, assetsRes] = await Promise.all([
    supabase.from("templates").select("template_code,is_active").eq("id", project.template_id).maybeSingle(),
    supabase.from("project_translations").select("field_key,language_code,field_value").eq("project_id", project.id),
    supabase
      .from("project_gallery")
      .select("image_url,sort_order")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_assets")
      .select("asset_type,file_url,file_name")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true }),
  ]);

  if (process.env.NODE_ENV === "development") {
    const errors = {
      template: templateRes.error ?? null,
      translations: translationsRes.error ?? null,
      gallery: galleryRes.error ?? null,
      assets: assetsRes.error ?? null,
    };
    if (errors.template || errors.translations || errors.gallery || errors.assets) {
      // eslint-disable-next-line no-console
      console.error("[PublicSite] related select errors", { slug, isServiceRole, errors });
    }
  }

  const template = templateRes.data;
  const translationsRows = translationsRes.data;
  const gallery = galleryRes.data;
  const assets = assetsRes.data;

  return { project, template, translationsRows, gallery, assets };
}

async function fetchPublishedProjectMetadataBySlug(slug: string) {
  const { supabase, isServiceRole } = createPublicReadClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("project_name,seo_title,seo_description,og_image")
    .eq("slug", slug)
    .eq("publish_status", true)
    .eq("status", "published")
    .maybeSingle();

  if (process.env.NODE_ENV === "development" && error) {
    // eslint-disable-next-line no-console
    console.error("[PublicSite] metadata select error", { slug, isServiceRole, error });
  }

  return project ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchPublishedProjectMetadataBySlug(slug);
  if (!project) return {};

  const title = project.seo_title || project.project_name;
  const description = project.seo_description || undefined;

  const ogImage = typeof project.og_image === "string" && project.og_image.trim() ? project.og_image : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await fetchPublishedProjectBySlug(slug);

  if (!result) notFound();

  const { project, template, translationsRows, gallery, assets } = result;

  const templateCode = template?.is_active ? template.template_code : null;
  const TemplateComponent = resolveTemplateComponent(templateCode);
  if (!TemplateComponent) notFound();

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
