"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { slugifyProjectName } from "@/lib/utils/slug";
import type { ClientRow, TemplateRow, VendorRow } from "@/types/project";
import {
  TEMPLATE_FIELD_KEYS,
  type TemplateFieldKey,
  TEMPLATE_LANGUAGE_CODES,
  type TemplateLanguageCode,
} from "@/constants/template-fields";
import { getTemplateConfig } from "@/constants/template-config";
import { AssetUploader } from "@/components/dashboard/asset-uploader";
import { GalleryManager } from "@/components/dashboard/gallery-manager";

type ProjectEditInitialData = {
  project_name: string;
  event_date: string | null;
  vendor_id: string;
  client_id: string;
  template_id: string;
  delivery_status?: string | null;
  theme_color: string | null;
  font_family: string | null;
  background_music: string | null;
  cover_image: string | null;
  gallery_images: string[];
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  translations: Partial<
    Record<TemplateLanguageCode, Partial<Record<TemplateFieldKey, string | null>>>
  >;
};

type TranslationsState = Record<TemplateLanguageCode, Record<TemplateFieldKey, string>>;

const FIELD_DEFS: Array<{ key: TemplateFieldKey; label: string; multiline?: boolean }>= [
  { key: "title", label: "Title" },
  { key: "subtitle", label: "Subtitle", multiline: true },
  { key: "bride_name", label: "Bride Name" },
  { key: "groom_name", label: "Groom Name" },
  { key: "welcome_message", label: "Welcome Message", multiline: true },
  { key: "story_title", label: "Story Title" },
  { key: "story_text", label: "Story Text", multiline: true },
  { key: "venue_name", label: "Venue Name" },
  { key: "venue_address", label: "Venue Address", multiline: true },
  { key: "event_time", label: "Event Time" },
  { key: "event_date_text", label: "Event Date Text" },
  { key: "rsvp_text", label: "RSVP Text", multiline: true },
  { key: "footer_message", label: "Footer Message", multiline: true },
  { key: "family_message", label: "Family Message", multiline: true },
  { key: "custom_note", label: "Custom Note", multiline: true },
];

function createEmptyTranslationsState(): TranslationsState {
  const perLang = Object.fromEntries(
    TEMPLATE_FIELD_KEYS.map((key) => [key, ""]),
  ) as Record<TemplateFieldKey, string>;

  return Object.fromEntries(
    TEMPLATE_LANGUAGE_CODES.map((lang) => [lang, { ...perLang }]),
  ) as TranslationsState;
}

function buildInitialTranslationsState(initialData?: ProjectEditInitialData): TranslationsState {
  const state = createEmptyTranslationsState();
  const source = initialData?.translations;
  if (!source) return state;

  for (const lang of TEMPLATE_LANGUAGE_CODES) {
    const row = source[lang];
    if (!row) continue;
    for (const key of TEMPLATE_FIELD_KEYS) {
      const value = row[key];
      if (typeof value === "string") {
        state[lang][key] = value;
      }
    }
  }

  return state;
}

type Props = {
  templates: TemplateRow[];
  vendors: VendorRow[];
  clients: ClientRow[];
  selectedTemplate: TemplateRow | null;
  projectId?: string;
  initialData?: ProjectEditInitialData;
};

export function CreateProjectForm({
  templates,
  vendors,
  clients,
  selectedTemplate,
  projectId,
  initialData,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vendorsState, setVendorsState] = useState<VendorRow[]>(vendors);
  const [clientsState, setClientsState] = useState<ClientRow[]>(clients);
  const [projectName, setProjectName] = useState(initialData?.project_name ?? "");
  const [eventDate, setEventDate] = useState(initialData?.event_date ?? "");
  const [deliveryStatus, setDeliveryStatus] = useState(
    (initialData?.delivery_status ?? "pending") || "pending",
  );
  const [vendorId, setVendorId] = useState(initialData?.vendor_id ?? "");
  const [clientId, setClientId] = useState(initialData?.client_id ?? "");
  const templateId = initialData?.template_id ?? selectedTemplate?.id ?? "";
  const templateCode = selectedTemplate?.template_code ?? null;
  const templateConfig = useMemo(() => getTemplateConfig(templateCode), [templateCode]);
  const [activeLanguage, setActiveLanguage] = useState<TemplateLanguageCode>("en");
  const [translations, setTranslations] = useState<TranslationsState>(() =>
    buildInitialTranslationsState(initialData),
  );
  const [themeColor, setThemeColor] = useState(initialData?.theme_color ?? "#800000");
  const [fontFamily, setFontFamily] = useState(initialData?.font_family ?? "Playfair Display");
  const [backgroundMusic, setBackgroundMusic] = useState(initialData?.background_music ?? "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image ?? "");
  const [galleryInput, setGalleryInput] = useState((initialData?.gallery_images ?? []).join("\n"));
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description ?? "");
  const [ogImage, setOgImage] = useState(initialData?.og_image ?? "");

  const slugPreview = useMemo(() => slugifyProjectName(projectName), [projectName]);

  const visibleFieldDefs = useMemo(() => {
    if (!templateConfig.translationFields.length) return FIELD_DEFS;
    const allowed = new Set(templateConfig.translationFields);
    return FIELD_DEFS.filter((f) => allowed.has(f.key));
  }, [templateConfig.translationFields]);

  const clientsForSelectedVendor = useMemo(() => {
    if (!vendorId) return clientsState;
    return clientsState.filter((c) => c.vendor_id === vendorId);
  }, [clientsState, vendorId]);

  const showCreateVendorInline = vendorsState.length === 0;
  const showCreateClientInline =
    clientsState.length === 0 || (vendorId ? clientsForSelectedVendor.length === 0 : false);

  const [vendorDraft, setVendorDraft] = useState({
    business_name: "",
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    is_active: true,
  });
  const [clientDraft, setClientDraft] = useState({
    vendor_id: "",
    client_name: "",
    phone: "",
    email: "",
    event_type: "",
    notes: "",
  });
  const [inlineSaving, setInlineSaving] = useState(false);

  const createVendorInline = async () => {
    setError("");
    if (!vendorDraft.business_name.trim()) {
      setError("Business Name is required to create a vendor.");
      return;
    }

    setInlineSaving(true);
    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorDraft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create vendor.");

      const created = result.vendor as { id: string; business_name: string };
      setVendorsState((prev) => [...prev, created]);
      setVendorId(created.id);
      setVendorDraft({
        business_name: "",
        owner_name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        is_active: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setInlineSaving(false);
    }
  };

  const createClientInline = async () => {
    setError("");
    const effectiveVendorId = clientDraft.vendor_id || vendorId;
    if (!effectiveVendorId) {
      setError("Select or create a vendor first.");
      return;
    }
    if (!clientDraft.client_name.trim()) {
      setError("Client Name is required to create a client.");
      return;
    }

    setInlineSaving(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...clientDraft, vendor_id: effectiveVendorId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create client.");

      const created = result.client as { id: string; client_name: string; vendor_id: string | null };
      setClientsState((prev) => [...prev, created]);
      setClientId(created.id);
      setClientDraft({
        vendor_id: "",
        client_name: "",
        phone: "",
        email: "",
        event_type: "",
        notes: "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setInlineSaving(false);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!templateId) {
      setError("Please select a template.");
      return;
    }
    if (!vendorId) {
      setError("Vendor is required.");
      return;
    }
    if (!clientId) {
      setError("Client is required.");
      return;
    }

    const selectedClient = clientsState.find((c) => c.id === clientId) ?? null;
    if (selectedClient?.vendor_id && selectedClient.vendor_id !== vendorId) {
      setError("Selected client does not belong to the selected vendor.");
      return;
    }

    setLoading(true);

    const galleryImages = galleryInput
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      project_name: projectName,
      event_date: eventDate || null,
      vendor_id: vendorId,
      client_id: clientId,
      template_id: templateId,
      status: "draft",
      delivery_status: deliveryStatus,
      translations,
      theme_color: themeColor || null,
      font_family: fontFamily || null,
      background_music: backgroundMusic || null,
      cover_image: coverImage || null,
      gallery_images: galleryImages,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      og_image: ogImage || null,
    };

    const isEdit = Boolean(projectId);
    const endpoint = isEdit ? `/api/projects/${projectId}` : "/api/projects";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(result.error || (projectId ? "Failed to update project." : "Failed to save draft."));
        return;
      }

      // Show success message before redirecting
      setSuccess(projectId ? "Project updated successfully!" : "Project saved successfully!");
      setLoading(false);

      // Redirect after brief delay to let user see success message
      setTimeout(() => {
        router.push("/dashboard/projects?saved=1");
      }, 800);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSaveDraft}>
      <section className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white">Basic Project Info</h3>
        {!templateId ? (
          <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-500/10 p-2 text-sm text-amber-100">
            Select a template from the Templates page first.
          </p>
        ) : null}
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-slate-300">Project Name</p>
            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Auto Slug</p>
            <Input value={slugPreview} readOnly />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Event Date</p>
            <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Delivery Status</p>
            <select
              className="w-full rounded-lg border border-white/20 bg-white/5 p-2 text-sm text-slate-100"
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
            >
              <option value="pending" className="bg-slate-900">
                Pending
              </option>
              <option value="approved" className="bg-slate-900">
                Approved
              </option>
              <option value="in_progress" className="bg-slate-900">
                In Progress
              </option>
              <option value="client_review" className="bg-slate-900">
                Client Review
              </option>
              <option value="live" className="bg-slate-900">
                Live
              </option>
              <option value="completed" className="bg-slate-900">
                Completed
              </option>
              <option value="paused" className="bg-slate-900">
                Paused
              </option>
              <option value="rejected" className="bg-slate-900">
                Rejected
              </option>
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Vendor</p>
            {showCreateVendorInline ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-300">No vendors exist yet. Create one to continue.</p>
                <Input
                  placeholder="Business Name"
                  value={vendorDraft.business_name}
                  onChange={(e) => setVendorDraft((d) => ({ ...d, business_name: e.target.value }))}
                />
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    placeholder="Owner Name"
                    value={vendorDraft.owner_name}
                    onChange={(e) => setVendorDraft((d) => ({ ...d, owner_name: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={vendorDraft.phone}
                    onChange={(e) => setVendorDraft((d) => ({ ...d, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    value={vendorDraft.email}
                    onChange={(e) => setVendorDraft((d) => ({ ...d, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Address"
                    value={vendorDraft.address}
                    onChange={(e) => setVendorDraft((d) => ({ ...d, address: e.target.value }))}
                  />
                </div>
                <Button type="button" variant="outline" disabled={inlineSaving} onClick={createVendorInline}>
                  {inlineSaving ? "Creating..." : "+ Create Vendor"}
                </Button>
              </div>
            ) : (
              <select
                value={vendorId}
                onChange={(e) => {
                  setVendorId(e.target.value);
                  setClientId("");
                }}
                className="h-10 w-full rounded-lg border border-white/20 bg-white/5 px-3 text-sm"
              >
                <option value="">Select vendor</option>
                {vendorsState.map((v) => (
                  <option key={v.id} value={v.id} className="text-black">
                    {v.business_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Client</p>
            {showCreateClientInline ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-300">No clients found for this vendor. Create one to continue.</p>
                <select
                  value={clientDraft.vendor_id || vendorId}
                  onChange={(e) => setClientDraft((d) => ({ ...d, vendor_id: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-white/20 bg-white/5 px-3 text-sm"
                  disabled={vendorsState.length === 0}
                >
                  <option value="">Select vendor</option>
                  {vendorsState.map((v) => (
                    <option key={v.id} value={v.id} className="text-black">
                      {v.business_name}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Client Name"
                  value={clientDraft.client_name}
                  onChange={(e) => setClientDraft((d) => ({ ...d, client_name: e.target.value }))}
                />
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    placeholder="Phone"
                    value={clientDraft.phone}
                    onChange={(e) => setClientDraft((d) => ({ ...d, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    value={clientDraft.email}
                    onChange={(e) => setClientDraft((d) => ({ ...d, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Event Type"
                    value={clientDraft.event_type}
                    onChange={(e) => setClientDraft((d) => ({ ...d, event_type: e.target.value }))}
                  />
                </div>
                <Button type="button" variant="outline" disabled={inlineSaving} onClick={createClientInline}>
                  {inlineSaving ? "Creating..." : "+ Create Client"}
                </Button>
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/20 bg-white/5 px-3 text-sm"
              >
                <option value="">Select client</option>
                {clientsForSelectedVendor.map((c) => (
                  <option key={c.id} value={c.id} className="text-black">
                    {c.client_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Template Selected (readonly)</p>
            <Input
              value={templates.find((t) => t.id === templateId)?.template_name ?? ""}
              readOnly
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Project Status</p>
            <Input value="draft" readOnly />
          </div>
        </div>
      </section>

      <section className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Project Translations</h3>
            <p className="mt-1 text-xs text-slate-300">Fill English, Telugu, and Hindi values for each field.</p>
          </div>

          <div className="flex gap-2">
            {TEMPLATE_LANGUAGE_CODES.map((lang) => (
              <Button
                key={lang}
                type="button"
                variant={activeLanguage === lang ? "default" : "outline"}
                onClick={() => setActiveLanguage(lang)}
              >
                {lang === "en" ? "English" : lang === "te" ? "తెలుగు" : "हिंदी"}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {visibleFieldDefs.map((field) => {
            const value = translations[activeLanguage][field.key];

            if (field.multiline) {
              return (
                <div key={field.key} className="md:col-span-2">
                  <p className="mb-1 text-xs text-slate-300">{field.label}</p>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm"
                    value={value}
                    onChange={(e) => {
                      const next = e.target.value;
                      setTranslations((prev) => ({
                        ...prev,
                        [activeLanguage]: { ...prev[activeLanguage], [field.key]: next },
                      }));
                    }}
                  />
                </div>
              );
            }

            return (
              <div key={field.key}>
                <p className="mb-1 text-xs text-slate-300">{field.label}</p>
                <Input
                  value={value}
                  onChange={(e) => {
                    const next = e.target.value;
                    setTranslations((prev) => ({
                      ...prev,
                      [activeLanguage]: { ...prev[activeLanguage], [field.key]: next },
                    }));
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white">Design Settings</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input placeholder="Theme Color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
          <Input placeholder="Font Family" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} />
          {templateConfig.media.music ? (
            <Input
              placeholder="Background Music URL (upload)"
              value={backgroundMusic}
              onChange={(e) => setBackgroundMusic(e.target.value)}
            />
          ) : null}
          {templateConfig.media.coverImage ? (
            <Input
              placeholder="Cover Image URL (upload)"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          ) : null}
        </div>

        {(templateConfig.media.music || templateConfig.media.coverImage) && projectId ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {templateConfig.media.music ? (
              <AssetUploader
                projectId={projectId}
                kind="background_music"
                label="Background Music"
                accept="audio/*"
                value={backgroundMusic}
                onChange={setBackgroundMusic}
              />
            ) : null}
            {templateConfig.media.coverImage ? (
              <AssetUploader
                projectId={projectId}
                kind="cover_image"
                label="Cover Image"
                accept="image/*"
                value={coverImage}
                onChange={setCoverImage}
              />
            ) : null}
          </div>
        ) : null}

        {(templateConfig.media.music || templateConfig.media.coverImage) && !projectId ? (
          <p className="mt-3 text-xs text-slate-300">
            Save the project once to enable uploads.
          </p>
        ) : null}
      </section>

      {templateConfig.media.gallery ? (
        <section className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white">Gallery</h3>
          {projectId ? (
            <div className="mt-3">
              <GalleryManager projectId={projectId} value={galleryInput} onChange={setGalleryInput} />
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-300">Save the project once to enable uploads.</p>
          )}
        </section>
      ) : null}

      {templateConfig.features.seo ? (
        <section className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white">SEO</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input placeholder="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            {templateConfig.media.ogImage ? (
              <Input placeholder="OG Image URL (upload)" value={ogImage} onChange={(e) => setOgImage(e.target.value)} />
            ) : null}
          </div>
          <textarea
            className="mt-3 min-h-20 w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm"
            placeholder="SEO Description"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />

          {templateConfig.media.ogImage && projectId ? (
            <div className="mt-4">
              <AssetUploader
                projectId={projectId}
                kind="og_image"
                label="OG Image"
                accept="image/*"
                value={ogImage}
                onChange={setOgImage}
              />
            </div>
          ) : null}

          {templateConfig.media.ogImage && !projectId ? (
            <p className="mt-3 text-xs text-slate-300">
              Save the project once to enable uploads.
            </p>
          ) : null}
        </section>
      ) : null}

      {error ? <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-200">{error}</p> : null}
      {success ? <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-2 text-sm text-emerald-200">{success}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button disabled={loading || !templateId} isLoading={loading}>
          {projectId ? "Update Draft" : "Save Draft"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!selectedTemplate?.template_code}
          onClick={() => {
            if (!selectedTemplate?.template_code) return;
            router.push(`/dashboard/templates/preview/${selectedTemplate.template_code}`);
          }}
        >
          Preview
        </Button>
        <Button type="button" variant="outline" disabled={loading} onClick={() => router.push("/dashboard/projects")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
