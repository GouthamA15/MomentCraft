import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveTemplateComponent } from "@/lib/template-registry";
import { LanguageProvider } from "@/templates/wedding/template-1/LanguageContext";
import { ProjectDataProvider } from "@/templates/wedding/template-1/ProjectDataContext";
import AlbumPage from "@/templates/wedding/template-1/AlbumPage";

type PageProps = {
  params: Promise<{ templateCode: string }>;
};

export default async function TemplateAlbumPreviewPage({ params }: PageProps) {
  const { templateCode } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("templates")
    .select("id,template_name,template_code,is_active")
    .eq("template_code", templateCode)
    .eq("is_active", true)
    .maybeSingle();

  if (!template) notFound();

  // In a real scenario, we might want to fetch some default/mock project data for the preview
  // For now, we'll pass null projectData which will trigger fallbacks in the template
  const projectData = null;

  return (
    <LanguageProvider projectData={projectData}>
      <ProjectDataProvider projectData={projectData} isPreview={true}>
        <AlbumPage />
      </ProjectDataProvider>
    </LanguageProvider>
  );
}
