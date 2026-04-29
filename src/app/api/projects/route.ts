import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugifyProjectName } from "@/lib/utils/slug";
import {
  TEMPLATE_FIELD_KEYS,
  TEMPLATE_LANGUAGE_CODES,
  isTemplateFieldKey,
  isTemplateLanguageCode,
} from "@/constants/template-fields";

async function generateUniqueSlug(baseSlug: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const safeBase = baseSlug || `project-${Date.now()}`;
  let slug = safeBase;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return slug;

    counter += 1;
    slug = `${safeBase}-${counter}`;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const projectName: string = body.project_name?.trim();
    if (!projectName) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    const templateId: string | null = body.template_id || null;
    const vendorId: string | null = body.vendor_id || null;
    const clientId: string | null = body.client_id || null;

    if (!templateId) {
      return NextResponse.json({ error: "Template is required." }, { status: 400 });
    }
    if (!vendorId) {
      return NextResponse.json({ error: "Vendor is required." }, { status: 400 });
    }
    if (!clientId) {
      return NextResponse.json({ error: "Client is required." }, { status: 400 });
    }

    const [{ data: template }, { data: vendor }, { data: client }] = await Promise.all([
      supabase.from("templates").select("id").eq("id", templateId).eq("is_active", true).maybeSingle(),
      supabase.from("vendors").select("id").eq("id", vendorId).eq("is_active", true).maybeSingle(),
      supabase.from("clients").select("id,vendor_id").eq("id", clientId).maybeSingle(),
    ]);

    if (!template) {
      return NextResponse.json({ error: "Selected template does not exist or is inactive." }, { status: 400 });
    }
    if (!vendor) {
      return NextResponse.json({ error: "Selected vendor does not exist or is inactive." }, { status: 400 });
    }
    if (!client) {
      return NextResponse.json({ error: "Selected client does not exist." }, { status: 400 });
    }
    if (client.vendor_id && client.vendor_id !== vendorId) {
      return NextResponse.json({ error: "Selected client does not belong to selected vendor." }, { status: 400 });
    }

    const requestedSlug = slugifyProjectName(projectName);
    const slug = await generateUniqueSlug(requestedSlug, supabase);

    const projectInsert = {
      vendor_id: vendorId,
      client_id: clientId,
      template_id: templateId,
      project_name: projectName,
      slug,
      status: body.status || "draft",
      event_date: body.event_date || null,
      theme_color: body.theme_color || null,
      font_family: body.font_family || null,
      background_music: body.background_music || null,
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      og_image: body.og_image || null,
    };

    const { data: createdProject, error: projectError } = await supabase
      .from("projects")
      .insert(projectInsert)
      .select("id")
      .single();

    if (projectError || !createdProject) {
      return NextResponse.json({ error: projectError?.message || "Failed to create project." }, { status: 500 });
    }

    const projectId = createdProject.id;

    const translationsInput = body.translations as unknown;
    const translationRows: Array<{
      project_id: string;
      field_key: string;
      language_code: string;
      field_value: string;
    }> = [];

    if (translationsInput && typeof translationsInput === "object") {
      for (const language_code of TEMPLATE_LANGUAGE_CODES) {
        const langObj = (translationsInput as any)[language_code];
        if (!langObj || typeof langObj !== "object") continue;

        for (const field_key of TEMPLATE_FIELD_KEYS) {
          const raw = (langObj as any)[field_key];
          if (typeof raw !== "string") continue;
          const field_value = raw.trim();
          if (!field_value) continue;
          if (!isTemplateFieldKey(field_key) || !isTemplateLanguageCode(language_code)) continue;

          translationRows.push({ project_id: projectId, field_key, language_code, field_value });
        }
      }
    }

    if (translationRows.length > 0) {
      const { error: translationsError } = await supabase.from("project_translations").insert(translationRows);
      if (translationsError) {
        await supabase.from("projects").delete().eq("id", projectId);
        return NextResponse.json({ error: translationsError.message }, { status: 500 });
      }
    }

    const galleryItems: string[] = Array.isArray(body.gallery_images)
      ? body.gallery_images.filter(Boolean)
      : [];

    if (galleryItems.length > 0) {
      const { error: galleryError } = await supabase.from("project_gallery").insert(
        galleryItems.map((url, idx) => ({
          project_id: projectId,
          image_url: url,
          sort_order: idx,
        })),
      );
      if (galleryError) {
        await supabase.from("projects").delete().eq("id", projectId);
        return NextResponse.json({ error: galleryError.message }, { status: 500 });
      }
    }

    const assetRows: Array<{ project_id: string; asset_type: string; file_url: string; file_name: string | null }> = [];
    if (body.cover_image) {
      assetRows.push({
        project_id: projectId,
        asset_type: "cover_image",
        file_url: body.cover_image,
        file_name: null,
      });
    }
    if (body.background_music) {
      assetRows.push({
        project_id: projectId,
        asset_type: "background_music",
        file_url: body.background_music,
        file_name: null,
      });
    }
    if (body.og_image) {
      assetRows.push({
        project_id: projectId,
        asset_type: "og_image",
        file_url: body.og_image,
        file_name: null,
      });
    }

    if (assetRows.length > 0) {
      const { error: assetsError } = await supabase.from("project_assets").insert(assetRows);
      if (assetsError) {
        await supabase.from("projects").delete().eq("id", projectId);
        return NextResponse.json({ error: assetsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, project_id: projectId, slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
