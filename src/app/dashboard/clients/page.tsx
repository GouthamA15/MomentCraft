import { createClient } from "@/lib/supabase/server";
import { ClientsManager } from "@/components/dashboard/clients/clients-manager";
import type { ClientDetailRow, VendorRow } from "@/types/project";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: vendorsData } = await supabase
    .from("vendors")
    .select("id,business_name")
    .eq("is_active", true)
    .order("business_name", { ascending: true });

  const { data: clientsData } = await supabase
    .from("clients")
    .select("id,vendor_id,client_name,phone,email,event_type,notes,created_at,updated_at,vendors(business_name)")
    .order("created_at", { ascending: false });

  const vendors = (vendorsData ?? []) as VendorRow[];
  const clients = (clientsData ?? []) as ClientDetailRow[];

  return <ClientsManager initialClients={clients} vendors={vendors} />;
}
