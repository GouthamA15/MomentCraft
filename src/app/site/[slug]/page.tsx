import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createPublicReadClient } from "@/lib/supabase/public-server";
import { resolveTemplateComponents } from "@/lib/template-registry";
import { fetchPublishedProjectBySlug } from "@/services/project-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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

  const { templateCode } = result;
  const components = resolveTemplateComponents(templateCode);
  if (!components) notFound();

  const { Invitation } = components;

  return <Invitation />;
}
