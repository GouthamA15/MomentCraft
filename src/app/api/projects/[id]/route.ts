import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  TEMPLATE_FIELD_KEYS,
  TEMPLATE_LANGUAGE_CODES,
  isTemplateFieldKey,
  isTemplateLanguageCode,
} from "@/constants/template-fields";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
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
      supabase.from("templates").select("id").eq("id", templateId).maybeSingle(),
      supabase.from("vendors").select("id").eq("id", vendorId).maybeSingle(),
      supabase.from("clients").select("id,vendor_id").eq("id", clientId).maybeSingle(),
    ]);

    if (!template) {
      return NextResponse.json({ error: "Selected template does not exist." }, { status: 400 });
    }
    if (!vendor) {
      return NextResponse.json({ error: "Selected vendor does not exist." }, { status: 400 });
    }
    if (!client) {
      return NextResponse.json({ error: "Selected client does not exist." }, { status: 400 });
    }
    if (client.vendor_id && client.vendor_id !== vendorId) {
      return NextResponse.json({ error: "Selected client does not belong to selected vendor." }, { status: 400 });
    }

    const { data: existingProject, error: existingProjectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .single();

    if (existingProjectError || !existingProject) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { error: projectUpdateError } = await supabase
      .from("projects")
      .update({
        vendor_id: vendorId,
        client_id: clientId,
        template_id: templateId,
        project_name: projectName,
        status: body.status || "draft",
        event_date: body.event_date || null,
        theme_color: body.theme_color || null,
        font_family: body.font_family || null,
        background_music: body.background_music || null,
        seo_title: body.seo_title || null,
        seo_description: body.seo_description || null,
        og_image: body.og_image || null,
      })
      .eq("id", id);

    if (projectUpdateError) {
      return NextResponse.json({ error: projectUpdateError.message }, { status: 500 });
    }

    const translationsInput = body.translations as unknown;
    const toUpsert: Array<{
      project_id: string;
      field_key: string;
      language_code: string;
      field_value: string;
    }> = [];
    const deleteByLang: Record<string, string[]> = {};

    if (translationsInput && typeof translationsInput === "object") {
      for (const language_code of TEMPLATE_LANGUAGE_CODES) {
        const langObj = (translationsInput as any)[language_code];
        if (!langObj || typeof langObj !== "object") continue;

        for (const field_key of TEMPLATE_FIELD_KEYS) {
          if (!isTemplateFieldKey(field_key) || !isTemplateLanguageCode(language_code)) continue;
          const raw = (langObj as any)[field_key];
          const trimmed = typeof raw === "string" ? raw.trim() : "";

          if (!trimmed) {
            deleteByLang[language_code] = deleteByLang[language_code] ?? [];
            deleteByLang[language_code].push(field_key);
            continue;
          }

          toUpsert.push({ project_id: id, field_key, language_code, field_value: trimmed });
        }
      }
    }

    for (const [language_code, keys] of Object.entries(deleteByLang)) {
      if (keys.length === 0) continue;
      const { error: deleteError } = await supabase
        .from("project_translations")
        .delete()
        .eq("project_id", id)
        .eq("language_code", language_code)
        .in("field_key", keys);
      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    if (toUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from("project_translations")
        .upsert(toUpsert, { onConflict: "project_id,field_key,language_code" });
      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }
    }

    const galleryItems: string[] = Array.isArray(body.gallery_images)
      ? body.gallery_images.map((v: unknown) => (typeof v === "string" ? v : "")).filter(Boolean)
      : [];

    const { error: galleryDeleteError } = await supabase.from("project_gallery").delete().eq("project_id", id);
    if (galleryDeleteError) {
      return NextResponse.json({ error: galleryDeleteError.message }, { status: 500 });
    }

    if (galleryItems.length > 0) {
      const { error: galleryInsertError } = await supabase.from("project_gallery").insert(
        galleryItems.map((url, idx) => ({
          project_id: id,
          image_url: url,
          sort_order: idx,
        })),
      );

      if (galleryInsertError) {
        return NextResponse.json({ error: galleryInsertError.message }, { status: 500 });
      }
    }

    const managedAssetTypes = ["cover_image", "background_music", "og_image"];
    const { error: managedAssetsDeleteError } = await supabase
      .from("project_assets")
      .delete()
      .eq("project_id", id)
      .in("asset_type", managedAssetTypes);

    if (managedAssetsDeleteError) {
      return NextResponse.json({ error: managedAssetsDeleteError.message }, { status: 500 });
    }

    const assetRows: Array<{ project_id: string; asset_type: string; file_url: string; file_name: string | null }> = [];
    if (body.cover_image) {
      assetRows.push({ project_id: id, asset_type: "cover_image", file_url: body.cover_image, file_name: null });
    }
    if (body.background_music) {
      assetRows.push({
        project_id: id,
        asset_type: "background_music",
        file_url: body.background_music,
        file_name: null,
      });
    }
    if (body.og_image) {
      assetRows.push({ project_id: id, asset_type: "og_image", file_url: body.og_image, file_name: null });
    }

    if (assetRows.length > 0) {
      const { error: assetsInsertError } = await supabase.from("project_assets").insert(assetRows);
      if (assetsInsertError) {
        return NextResponse.json({ error: assetsInsertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: existingProject, error: existingProjectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .single();

    if (existingProjectError || !existingProject) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const [{ error: galleryError }, { error: assetsError }, { error: translationsError }] = await Promise.all([
      supabase.from("project_gallery").delete().eq("project_id", id),
      supabase.from("project_assets").delete().eq("project_id", id),
      supabase.from("project_translations").delete().eq("project_id", id),
    ]);

    if (galleryError) return NextResponse.json({ error: galleryError.message }, { status: 500 });
    if (assetsError) return NextResponse.json({ error: assetsError.message }, { status: 500 });
    if (translationsError) return NextResponse.json({ error: translationsError.message }, { status: 500 });

    const { error: projectDeleteError } = await supabase.from("projects").delete().eq("id", id);
    if (projectDeleteError) {
      return NextResponse.json({ error: projectDeleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
