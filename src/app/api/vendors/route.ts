import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const businessName: string = body.business_name?.trim();
    if (!businessName) {
      return NextResponse.json({ error: "Business Name is required." }, { status: 400 });
    }

    const vendorInsert = {
      business_name: businessName,
      owner_name: body.owner_name?.trim() || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
      is_active: typeof body.is_active === "boolean" ? body.is_active : true,
    };

    const { data: vendor, error } = await supabase
      .from("vendors")
      .insert(vendorInsert)
      .select("id,business_name,owner_name,phone,email,address,notes,is_active,created_at,updated_at")
      .single();

    if (error || !vendor) {
      return NextResponse.json({ error: error?.message || "Failed to create vendor." }, { status: 500 });
    }

    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
