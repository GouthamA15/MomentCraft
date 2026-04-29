import { createClient } from "@/lib/supabase/server";
import { VendorsManager } from "@/components/dashboard/vendors/vendors-manager";
import type { VendorDetailRow } from "@/types/project";

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("id,business_name,owner_name,phone,email,address,notes,is_active,created_at,updated_at")
    .order("created_at", { ascending: false });

  const vendors = (data ?? []) as VendorDetailRow[];

  return <VendorsManager initialVendors={vendors} />;
}
