import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";
import type { ClientRow, TemplateRow, VendorRow } from "@/types/project";
import { isTemplateFieldKey, isTemplateLanguageCode } from "@/constants/template-fields";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function EditProjectPage({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: templatesData } = await supabase
    .from("templates")
    .select("id,template_name,template_code,event_type,preview_image,template_path,is_active")
    .order("created_at", { ascending: false });

  const { data: vendorsData } = await supabase
    .from("vendors")
    .select("id,business_name")
    .order("business_name", { ascending: true });

  const { data: clientsData } = await supabase
    .from("clients")
    .select("id,client_name,vendor_id")
    .order("client_name", { ascending: true });

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      "id,project_name,event_date,vendor_id,client_id,template_id,theme_color,font_family,background_music,seo_title,seo_description,og_image,album_enabled",
    )
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    // eslint-disable-next-line no-console
    console.error("Error fetching project:", projectError);
  }

  if (!project) {
    // eslint-disable-next-line no-console
    console.warn("No project found for ID:", projectId);
    return (
      <div className="space-y-4">
        <div className="glass rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">
            {projectError ? "Error loading project" : "Project not found"}
          </h2>
          <p className="text-sm text-slate-300">
            {projectError 
              ? "A database error occurred while trying to fetch this project." 
              : "The requested project could not be found."}
          </p>
          {projectError && (
            <pre className="mt-3 overflow-auto rounded bg-black/30 p-2 text-[10px] text-red-300">
              {JSON.stringify(projectError, null, 2)}
            </pre>
          )}
        </div>
        <Link
          href="/dashboard/projects"
          className="inline-flex w-fit rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  const [{ data: translationsRows }, { data: media }, { data: assets }] = await Promise.all([
    supabase
      .from("project_translations")
      .select("field_key,language_code,field_value")
      .eq("project_id", projectId),
    supabase
      .from("project_media")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_assets")
      .select("asset_type,file_url")
      .eq("project_id", projectId),
  ]);

  const assetsList = (assets ?? []) as Array<{ asset_type: string | null; file_url: string }>;
  const coverImage = assetsList.find((a) => a.asset_type === "cover_image")?.file_url ?? null;
  const backgroundMusicAsset =
    assetsList.find((a) => a.asset_type === "background_music")?.file_url ?? null;
  const ogImageAsset = assetsList.find((a) => a.asset_type === "og_image")?.file_url ?? null;

  const templates = (templatesData ?? []) as TemplateRow[];
  const vendors = (vendorsData ?? []) as VendorRow[];
  const clients = (clientsData ?? []) as ClientRow[];

  const selectedTemplate = templates.find((t) => t.id === project.template_id) ?? null;

  const translations: Record<string, Record<string, string | null>> = {};
  for (const row of (translationsRows ?? []) as Array<{ field_key: unknown; language_code: unknown; field_value: unknown }>) {
    if (!isTemplateFieldKey(row.field_key) || !isTemplateLanguageCode(row.language_code)) continue;
    const value = typeof row.field_value === "string" ? row.field_value : null;
    translations[row.language_code] = translations[row.language_code] ?? {};
    translations[row.language_code][row.field_key] = value;
  }

  return (
    <div className="space-y-4">
      <div className="glass flex items-start justify-between gap-3 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Edit Project</h2>
          <p className="text-sm text-slate-300">Update draft content and settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/projects/versions/${project.id}`}
            className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-white/10"
          >
            Versions
          </Link>
          <Link
            href="/dashboard/projects"
            className="rounded-md border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-100"
          >
            Back
          </Link>
        </div>
      </div>

      <CreateProjectForm
        projectId={project.id}
        templates={templates}
        vendors={vendors}
        clients={clients}
        selectedTemplate={selectedTemplate}
        initialData={{
          project_name: project.project_name,
          event_date: project.event_date,
          vendor_id: project.vendor_id,
          client_id: project.client_id,
          template_id: project.template_id,
          delivery_status: null,
          theme_color: project.theme_color,
          font_family: project.font_family,
          background_music: project.background_music || backgroundMusicAsset,
          cover_image: coverImage,
          album_enabled: project.album_enabled ?? true,
          media: (media ?? []) as any[],
          seo_title: project.seo_title,
          seo_description: project.seo_description,
          og_image: project.og_image || ogImageAsset,
          translations,
        }}
      />
    </div>
  );
}
