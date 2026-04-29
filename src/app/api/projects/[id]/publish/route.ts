import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PublishAction = "publish" | "unpublish" | "archive" | "restore";

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));

    const action: PublishAction = body?.action;
    if (!action || !["publish", "unpublish", "archive", "restore"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id,slug,status,publish_status,published_at,vendor_id,client_id,template_id")
      .eq("id", id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (action === "publish") {
      if (!project.slug) return NextResponse.json({ error: "Project slug is missing." }, { status: 400 });
      if (!project.vendor_id) return NextResponse.json({ error: "Vendor is required before publishing." }, { status: 400 });
      if (!project.client_id) return NextResponse.json({ error: "Client is required before publishing." }, { status: 400 });
      if (!project.template_id)
        return NextResponse.json({ error: "Template is required before publishing." }, { status: 400 });

      const publishedAt = nowIso();
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: "published",
          publish_status: true,
          published_at: publishedAt,
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        status: "published",
        publish_status: true,
        published_at: publishedAt,
      });
    }

    if (action === "unpublish" || action === "restore") {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: "draft",
          publish_status: false,
          published_at: null,
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        status: "draft",
        publish_status: false,
        published_at: null,
      });
    }

    // archive
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        status: "archived",
        publish_status: false,
        published_at: null,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: "archived",
      publish_status: false,
      published_at: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
