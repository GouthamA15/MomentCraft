export type TemplateRow = {
  id: string;
  template_name: string;
  template_code: string;
  event_type: string;
  preview_image: string | null;
  template_path: string | null;
  is_active: boolean;
};

export type VendorRow = {
  id: string;
  business_name: string;
};

export type VendorDetailRow = {
  id: string;
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientRow = {
  id: string;
  vendor_id: string | null;
  client_name: string;
};

export type ClientDetailRow = {
  id: string;
  vendor_id: string | null;
  client_name: string;
  phone: string | null;
  email: string | null;
  event_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vendors?: { business_name: string } | { business_name: string }[] | null;
};

export type ProjectListRow = {
  id: string;
  project_name: string;
  slug: string;
  status: string;
  publish_status: boolean | null;
  published_at: string | null;
  updated_at: string;
  clients: { client_name: string } | { client_name: string }[] | null;
  vendors: { business_name: string } | { business_name: string }[] | null;
  templates: { template_name: string } | { template_name: string }[] | null;
};
