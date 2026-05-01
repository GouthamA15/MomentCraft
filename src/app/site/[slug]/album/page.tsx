import { notFound } from "next/navigation";
import { resolveTemplateComponents } from "@/lib/template-registry";
import { fetchPublishedProjectBySlug } from "@/services/project-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicAlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await fetchPublishedProjectBySlug(slug);

  if (!result) notFound();

  const { templateCode } = result;
  const components = resolveTemplateComponents(templateCode);
  if (!components) notFound();

  const { Album } = components;

  if (result.projectData.project.album_enabled === false) {
    notFound();
  }

  return <Album />;
}
