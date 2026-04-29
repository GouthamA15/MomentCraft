import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resolveTemplateComponent } from "@/lib/template-registry";

type PageProps = {
  params: Promise<{ templateCode: string }>;
};

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { templateCode } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("templates")
    .select("id,template_name,template_code,is_active")
    .eq("template_code", templateCode)
    .eq("is_active", true)
    .maybeSingle();

  if (!template) {
    return (
      <div className="p-4">
        <div className="glass mx-auto max-w-xl rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Template preview unavailable</h2>
          <p className="mt-1 text-sm text-slate-300">
            No active template found for code: <span className="text-white">{templateCode}</span>
          </p>
          <Link
            href="/dashboard/templates"
            className="mt-3 inline-flex rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
          >
            Back to templates
          </Link>
        </div>
      </div>
    );
  }

  const TemplateComponent = resolveTemplateComponent(template.template_code);

  if (!TemplateComponent) {
    return (
      <div className="p-4">
        <div className="glass mx-auto max-w-xl rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white">Template preview not connected</h2>
          <p className="mt-1 text-sm text-slate-300">
            Template exists in database, but a frontend preview component is not connected for:
            <span className="ml-1 text-white">{template.template_code}</span>
          </p>
          <Link
            href="/dashboard/templates"
            className="mt-3 inline-flex rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
          >
            Back to templates
          </Link>
        </div>
      </div>
    );
  }

  return <TemplateComponent />;
}
