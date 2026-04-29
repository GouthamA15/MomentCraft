import { createClient } from "@/lib/supabase/server";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";
import type { ClientRow, TemplateRow, VendorRow } from "@/types/project";

type PageProps = {
  searchParams: Promise<{ templateId?: string }>;
};

export default async function CreateProjectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: templatesData } = await supabase
    .from("templates")
    .select("id,template_name,template_code,event_type,preview_image,template_path,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data: vendorsData } = await supabase
    .from("vendors")
    .select("id,business_name")
    .eq("is_active", true)
    .order("business_name", { ascending: true });

  const { data: clientsData } = await supabase
    .from("clients")
    .select("id,client_name,vendor_id")
    .order("client_name", { ascending: true });

  const templates = (templatesData ?? []) as TemplateRow[];
  const vendors = (vendorsData ?? []) as VendorRow[];
  const clients = (clientsData ?? []) as ClientRow[];
  const selectedTemplate = templates.find((t) => t.id === params.templateId) ?? null;

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Create Project</h2>
        <p className="text-sm text-slate-300">
          Create project using: {selectedTemplate?.template_name ?? "Select template first"}
        </p>
      </div>
      <CreateProjectForm
        templates={templates}
        vendors={vendors}
        clients={clients}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
}
