"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { slugifyProjectName } from "@/lib/utils/slug";
import type { ClientRow, TemplateRow, VendorRow } from "@/types/project";
import {
  TEMPLATE_LANGUAGE_CODES,
  type TemplateLanguageCode,
} from "@/constants/template-fields";
import { FaPlay, FaTrash } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";
import { AssetUploader } from "@/components/dashboard/asset-uploader";
import { GalleryManager, type GalleryItem } from "@/components/dashboard/gallery-manager";
import { type ProjectMediaRow, resolveTemplateComponents } from "@/lib/template-registry";

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
  album_enabled?: boolean;
  media?: ProjectMediaRow[];
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  translations: Partial<
    Record<TemplateLanguageCode, Partial<Record<string, string | null>>>
  >;
};

type TranslationsState = Record<TemplateLanguageCode, Record<string, string>>;

function createEmptyTranslationsState(): TranslationsState {
  return Object.fromEntries(
    TEMPLATE_LANGUAGE_CODES.map((lang) => [lang, {}]),
  ) as TranslationsState;
}

function buildInitialTranslationsState(initialData?: ProjectEditInitialData): TranslationsState {
  const state = createEmptyTranslationsState();
  const source = initialData?.translations;
  if (!source) return state;

  for (const lang of TEMPLATE_LANGUAGE_CODES) {
    const row = source[lang];
    if (!row) continue;
    for (const [key, value] of Object.entries(row)) {
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
  
  // Basic Info States
  const [projectName, setProjectName] = useState(initialData?.project_name ?? "");
  const [eventDate, setEventDate] = useState(initialData?.event_date ?? "");
  const [deliveryStatus, setDeliveryStatus] = useState(
    (initialData?.delivery_status ?? "pending") || "pending",
  );
  const [vendorId, setVendorId] = useState(initialData?.vendor_id ?? "");
  const [clientId, setClientId] = useState(initialData?.client_id ?? "");
  const [albumEnabled, setAlbumEnabled] = useState(initialData?.album_enabled ?? true);
  
  const [musicFile, setMusicFile] = useState<File | null>(null);
  
  const templateId = initialData?.template_id ?? selectedTemplate?.id ?? "";
  const currentTemplate = templates.find((t) => t.id === templateId);
  const templateCode = currentTemplate?.template_code ?? null;
  
  const templateConfig = useMemo(() => {
    const components = resolveTemplateComponents(templateCode);
    return components?.config || null;
  }, [templateCode]);

  // Generic Field States
  const [activeLanguage, setActiveLanguage] = useState<TemplateLanguageCode>("en");
  const [translations, setTranslations] = useState<TranslationsState>(() =>
    buildInitialTranslationsState(initialData),
  );
  
  // Non-translatable generic values (mapped to DB columns where appropriate)
  const [genericValues, setGenericValues] = useState<Record<string, string>>({
    theme_color: initialData?.theme_color ?? "#800000",
    font_family: initialData?.font_family ?? "Playfair Display",
    background_music: initialData?.background_music ?? "",
    og_image: initialData?.og_image ?? "",
  });

  const [pendingGalleryMedia, setPendingGalleryMedia] = useState<GalleryItem[]>([]);
  const [existingMedia, setExistingMedia] = useState<ProjectMediaRow[]>(initialData?.media ?? []);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!projectId) return;

    async function fetchMedia() {
      const supabase = createClient();
      
      // Verify session for RLS debugging
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // eslint-disable-next-line no-console
        console.warn("NO ACTIVE SESSION FOUND - RLS may block media fetch");
      }

      const { data, error } = await supabase
        .from("project_media")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching media:", error);
        return;
      }
      
      // eslint-disable-next-line no-console
      console.log("EDIT MEDIA:", data);
      
      if (data && data.length > 0) {
        setExistingMedia(data);
      }
    }

    fetchMedia();
  }, [projectId]);

  const handleDeleteExistingMedia = (mediaId: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(mediaId);
      return next;
    });
  };

  const handleUndoDelete = (mediaId: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.delete(mediaId);
      return next;
    });
  };

  const groupedExistingMedia = useMemo(() => {
    return existingMedia.reduce((acc, item) => {
      const key = item.section_key || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ProjectMediaRow[]>);
  }, [existingMedia]);

  const slugPreview = useMemo(() => slugifyProjectName(projectName), [projectName]);

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

    let finalMusicUrl = genericValues.background_music;
    const isEdit = Boolean(projectId);

    // Upload music file if selected (only when we have a projectId)
    if (musicFile && projectId) {
      setSuccess("Uploading music...");
      
      try {
        const formData = new FormData();
        formData.append("file", musicFile);
        formData.append("projectId", projectId);

        const uploadRes = await fetch("/api/uploads/music", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadResult.error || "Upload failed");
        }

        finalMusicUrl = uploadResult.publicUrl;
        
        // Update local state to show the new URL
        setGenericValues(prev => ({ ...prev, background_music: finalMusicUrl }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Music upload failed:", err);
        setError(`Music upload failed: ${err instanceof Error ? err.message : "Unexpected error"}. Project details will still be saved.`);
      }
    }

    const payload: any = {
      project_name: projectName,
      event_date: eventDate || null,
      vendor_id: vendorId,
      client_id: clientId,
      template_id: templateId,
      delivery_status: deliveryStatus,
      translations,
      theme_color: genericValues.theme_color || null,
      font_family: genericValues.font_family || null,
      background_music: finalMusicUrl || null,
      album_enabled: albumEnabled,
      seo_title: translations.en.seo_title || null,
      seo_description: translations.en.seo_description || null,
      og_image: genericValues.og_image || null,
    };

    // Only set status to draft for new projects. 
    // For edits, we preserve the existing status (e.g., "published").
    if (!isEdit) {
      payload.status = "draft";
    }

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

      const effectiveProjectId = projectId || result.project_id;

      // Process staged deletions
      if (deletedIds.size > 0) {
        setSuccess("Processing image deletions...");
        const deletionArray = Array.from(deletedIds);
        for (const mediaId of deletionArray) {
          const item = existingMedia.find((m) => m.id === mediaId);
          if (!item) continue;

          try {
            const delRes = await fetch("/api/uploads/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mediaId, storagePath: item.storage_path }),
            });
            if (!delRes.ok) {
              // eslint-disable-next-line no-console
              console.error(`Failed to delete media ${mediaId}`);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
          }
        }
        setExistingMedia((prev) => prev.filter((m) => !deletedIds.has(m.id)));
        setDeletedIds(new Set());
      }

      if (pendingGalleryMedia.length > 0 && effectiveProjectId) {
        setSuccess("Project saved. Uploading gallery media...");
        for (const item of pendingGalleryMedia) {
          if (!item.file) continue;

          const formData = new FormData();
          formData.append("file", item.file);
          formData.append("projectId", effectiveProjectId);
          formData.append("sectionKey", item.sectionKey);

          const uploadRes = await fetch("/api/uploads/gallery", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            // Partial error handling
          }
        }
      }

      setSuccess(projectId ? "Project updated successfully!" : "Project saved successfully!");
      setLoading(false);

      setTimeout(() => {
        router.push("/dashboard/projects?saved=1");
      }, 800);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  if (!templateConfig) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-slate-300">Loading template configuration...</p>
      </div>
    );
  }

  const renderField = (field: any) => {
    const isTranslatable = field.translatable;
    const value = isTranslatable 
      ? (translations[activeLanguage][field.key] || "")
      : (genericValues[field.key] || "");

    const onChange = (next: string) => {
      if (isTranslatable) {
        setTranslations((prev) => ({
          ...prev,
          [activeLanguage]: { ...prev[activeLanguage], [field.key]: next },
        }));
      } else {
        setGenericValues((prev) => ({ ...prev, [field.key]: next }));
      }
    };

    switch (field.type) {
      case "text":
        return (
          <div key={field.key} className="space-y-1">
            <p className="text-xs text-slate-300">{field.label}</p>
            <Input
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        );
      case "textarea":
        return (
          <div key={field.key} className="md:col-span-2 space-y-1">
            <p className="text-xs text-slate-300">{field.label}</p>
            <textarea
              className="min-h-24 w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-slate-100"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        );
      case "audio":
        return (
          <div key={field.key} className="md:col-span-2 space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white">{field.label}</p>
              {!projectId && <p className="text-[10px] text-amber-300">Save draft to enable upload</p>}
            </div>
            <Input
              placeholder="Direct URL"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />

            {projectId && (
              <div className="space-y-1.5 rounded-md border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] font-medium text-slate-400">Or upload a file:</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-[10px] file:font-semibold file:text-white hover:file:bg-white/20"
                />
                {musicFile && (
                  <p className="text-[10px] text-emerald-400">
                    Selected: <span className="font-mono">{musicFile.name}</span>
                  </p>
                )}
                {value && !musicFile && (
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] text-blue-400">Current:</span>
                    <span className="truncate text-[10px] text-slate-500 font-mono">{value}</span>
                  </div>
                )}
                {value && (
                  <audio className="mt-2 h-8 w-full" controls src={value} />
                )}
              </div>
            )}
          </div>
        );
      case "gallery":
        return (
          <div key={field.key} className="md:col-span-2 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{field.label}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">{albumEnabled ? "Enabled" : "Disabled"}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
                  checked={albumEnabled}
                  onChange={(e) => setAlbumEnabled(e.target.checked)}
                />
              </div>
            </div>
            {albumEnabled && (
              <div className="mt-2 pt-4 border-t border-white/10">
                {projectId ? (
                  <GalleryManager
                    onPendingMediaChange={setPendingGalleryMedia}
                    sections={templateConfig.gallery_sections || []}
                  />
                ) : (
                  <p className="text-xs italic text-amber-200">Save the project draft first to enable media uploads.</p>
                )}
              </div>
            )}
          </div>
        );
      case "cards":
        return (
          <div key={field.key} className="md:col-span-2 p-4 rounded-lg border border-dashed border-white/20 text-center">
            <p className="text-xs text-slate-400">{field.label} (Card Grouping Coming Soon)</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSaveDraft}>
      <section className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Core Project Details</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-1 text-xs text-slate-300">Project Name</p>
            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Slug Preview</p>
            <Input value={slugPreview} readOnly className="bg-white/5" />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Event Date</p>
            <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Vendor</p>
            {showCreateVendorInline ? (
              <Button type="button" variant="outline" className="w-full" disabled={inlineSaving} onClick={createVendorInline}>
                + Create Vendor
              </Button>
            ) : (
              <select
                value={vendorId}
                onChange={(e) => { setVendorId(e.target.value); setClientId(""); }}
                className="h-10 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-sm text-white"
              >
                <option value="">Select vendor</option>
                {vendorsState.map((v) => <option key={v.id} value={v.id}>{v.business_name}</option>)}
              </select>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Client</p>
            {showCreateClientInline ? (
              <Button type="button" variant="outline" className="w-full" disabled={inlineSaving} onClick={createClientInline}>
                + Create Client
              </Button>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-sm text-white"
              >
                <option value="">Select client</option>
                {clientsForSelectedVendor.map((c) => <option key={c.id} value={c.id}>{c.client_name}</option>)}
              </select>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Template</p>
            <Input value={currentTemplate?.template_name ?? ""} readOnly className="bg-white/5" />
          </div>
        </div>
      </section>

      <section className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Template Content</h3>
            <p className="text-xs text-slate-400 mt-1">Fields defined by: {templateCode}</p>
          </div>
          <div className="flex bg-white/5 rounded-lg p-1 gap-1">
            {TEMPLATE_LANGUAGE_CODES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLanguage(lang)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeLanguage === lang ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {templateConfig.fields.map((field: any) => renderField(field))}
        </div>
      </section>

      {/* Available Photos Section */}
      {projectId && existingMedia.length > 0 && (
        <section className="glass rounded-xl p-6 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-white">Available Photos</h3>
            <p className="text-xs text-slate-400">Currently uploaded media grouped by section.</p>
          </div>

          {Object.entries(groupedExistingMedia).map(([sectionKey, items]) => {
            const sectionLabel = templateConfig.gallery_sections?.find((s: any) => s.key === sectionKey)?.label || sectionKey;
            return (
              <div key={sectionKey} className="space-y-4">
                <h4 className="text-sm font-semibold text-gold capitalize">{sectionLabel}</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {items.map((item) => {
                    const isDeleted = deletedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-opacity ${
                          isDeleted ? "opacity-40 grayscale" : ""
                        }`}
                      >
                        {item.media_type === "video" ? (
                          <div className="flex h-full w-full items-center justify-center bg-slate-800">
                            <FaPlay className="text-xl text-gold" />
                          </div>
                        ) : (
                          <img
                            src={item.media_url}
                            alt="Uploaded media"
                            className="h-full w-full object-cover"
                          />
                        )}

                        {isDeleted ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-2 text-center">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-400">
                              Will be removed
                            </p>
                            <button
                              type="button"
                              onClick={() => handleUndoDelete(item.id)}
                              className="rounded bg-white/10 px-2 py-1 text-[10px] text-white hover:bg-white/20"
                            >
                              Undo
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingMedia(item.id)}
                            className="absolute right-2 top-2 z-20 rounded-full bg-red-600 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-lg"
                            title="Mark for deletion"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {projectId && existingMedia.length === 0 && (
        <section className="glass rounded-xl p-6 text-center">
          <h3 className="text-sm font-semibold text-white mb-2">Available Photos</h3>
          <p className="text-xs italic text-slate-400">No images uploaded yet.</p>
        </section>
      )}

      {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {success && <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p>}

      <div className="sticky bottom-4 flex flex-wrap gap-3 p-4 glass rounded-2xl shadow-2xl z-50">
        <Button disabled={loading || !templateId} isLoading={loading} className="min-w-[120px]">
          {projectId ? "Update Project" : "Create Project"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!templateCode}
          onClick={() => {
            if (!templateCode) return;
            router.push(`/dashboard/templates/preview/${templateCode}`);
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
