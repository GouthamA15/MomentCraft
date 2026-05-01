import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveTemplateAlbumComponent } from "@/lib/template-registry";

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

  const AlbumComponent = resolveTemplateAlbumComponent(template.template_code);
  if (!AlbumComponent) notFound();

  return <AlbumComponent isPreview={true} />;
}
