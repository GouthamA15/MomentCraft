import { notFound } from "next/navigation";
import { fetchPublishedProjectBySlug } from "@/services/project-data";
import { resolveTemplateComponents } from "@/lib/template-registry";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SiteLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const result = await fetchPublishedProjectBySlug(slug);

  if (!result) notFound();

  const { projectData, templateCode } = result;
  const components = resolveTemplateComponents(templateCode);
  if (!components) notFound();

  const { Providers, Layout } = components;

  return (
    <Providers projectData={projectData}>
      <Layout>
        {children}
      </Layout>
    </Providers>
  );
}
