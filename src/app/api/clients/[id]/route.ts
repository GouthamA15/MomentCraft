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

    const vendorId: string = body.vendor_id;
    const clientName: string = body.client_name?.trim();

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor Selection is required." }, { status: 400 });
    }
    if (!clientName) {
      return NextResponse.json({ error: "Client Name is required." }, { status: 400 });
    }

    const clientUpdate = {
      vendor_id: vendorId,
      client_name: clientName,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      event_type: body.event_type?.trim() || null,
      notes: body.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data: client, error } = await supabase
      .from("clients")
      .update(clientUpdate)
      .eq("id", id)
      .select("id,vendor_id,client_name,phone,email,event_type,notes,created_at,updated_at,vendors(business_name)")
      .single();

    if (error || !client) {
      return NextResponse.json({ error: error?.message || "Failed to update client." }, { status: 500 });
    }

    return NextResponse.json({ success: true, client });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to delete client." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
