import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const body = await request.json();

    const businessName: string = body.business_name?.trim();
    if (!businessName) {
      return NextResponse.json({ error: "Business Name is required." }, { status: 400 });
    }

    const vendorUpdate = {
      business_name: businessName,
      owner_name: body.owner_name?.trim() || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
      is_active: typeof body.is_active === "boolean" ? body.is_active : true,
      updated_at: new Date().toISOString(),
    };

    const { data: vendor, error } = await supabase
      .from("vendors")
      .update(vendorUpdate)
      .eq("id", id)
      .select("id,business_name,owner_name,phone,email,address,notes,is_active,created_at,updated_at")
      .single();

    if (error || !vendor) {
      return NextResponse.json({ error: error?.message || "Failed to update vendor." }, { status: 500 });
    }

    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { error } = await supabase.from("vendors").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to delete vendor." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
