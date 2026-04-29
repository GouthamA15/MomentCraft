"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ClientDetailRow, VendorRow } from "@/types/project";

type ClientDraft = {
  vendor_id: string;
  client_name: string;
  phone: string;
  email: string;
  event_type: string;
  notes: string;
};

const emptyDraft: ClientDraft = {
  vendor_id: "",
  client_name: "",
  phone: "",
  email: "",
  event_type: "",
  notes: "",
};

export function ClientsManager({
  initialClients,
  vendors,
}: {
  initialClients: ClientDetailRow[];
  vendors: VendorRow[];
}) {
  const [clients, setClients] = useState<ClientDetailRow[]>(initialClients);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ClientDraft>(emptyDraft);

  const vendorNameById = useMemo(() => {
    return new Map(vendors.map((v) => [v.id, v.business_name] as const));
  }, [vendors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;

    return clients.filter((c) => {
      const vendorFromJoin =
        c.vendors && Array.isArray(c.vendors)
          ? c.vendors[0]?.business_name
          : c.vendors?.business_name;

      const vendorName = c.vendor_id ? vendorNameById.get(c.vendor_id) : vendorFromJoin;
      const haystack = [
        vendorName,
        c.client_name,
        c.phone,
        c.email,
        c.event_type,
        c.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [clients, query, vendorNameById]);

  const resetForm = () => {
    setMode("create");
    setEditingId(null);
    setDraft(emptyDraft);
    setError("");
  };

  const startEdit = (client: ClientDetailRow) => {
    setMode("edit");
    setEditingId(client.id);
    setDraft({
      vendor_id: client.vendor_id ?? "",
      client_name: client.client_name ?? "",
      phone: client.phone ?? "",
      email: client.email ?? "",
      event_type: client.event_type ?? "",
      notes: client.notes ?? "",
    });
    setError("");
  };

  const handleSave = async () => {
    setError("");

    if (!draft.vendor_id) {
      setError("Vendor Selection is required.");
      return;
    }
    if (!draft.client_name.trim()) {
      setError("Client Name is required.");
      return;
    }

    setSaving(true);

    try {
      if (mode === "create") {
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to create client.");

        setClients((prev) => [result.client as ClientDetailRow, ...prev]);
        resetForm();
      } else {
        if (!editingId) return;
        const response = await fetch(`/api/clients/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to update client.");

        setClients((prev) =>
          prev.map((c) => (c.id === editingId ? (result.client as ClientDetailRow) : c)),
        );
        resetForm();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    const ok = window.confirm("Delete this client?");
    if (!ok) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete client.");

      setClients((prev) => prev.filter((c) => c.id !== clientId));
      if (editingId === clientId) resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Clients</h2>
        <p className="text-sm text-slate-300">Manage clients and their vendor relationship.</p>
      </div>

      <section className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">
            {mode === "create" ? "Create Client" : "Edit Client"}
          </h3>
          {mode === "edit" ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel Edit
            </Button>
          ) : null}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-slate-300">Vendor Selection</p>
            <select
              value={draft.vendor_id}
              onChange={(e) => setDraft((d) => ({ ...d, vendor_id: e.target.value }))}
              className="h-10 w-full rounded-lg border border-white/20 bg-white/5 px-3 text-sm"
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id} className="text-black">
                  {v.business_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Client Name</p>
            <Input
              value={draft.client_name}
              onChange={(e) => setDraft((d) => ({ ...d, client_name: e.target.value }))}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Phone</p>
            <Input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Email</p>
            <Input value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Event Type</p>
            <Input
              value={draft.event_type}
              onChange={(e) => setDraft((d) => ({ ...d, event_type: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <p className="mb-1 text-xs text-slate-300">Notes</p>
            <textarea
              className="min-h-20 w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm"
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            />
          </div>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-3 flex gap-2">
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : mode === "create" ? "Create Client" : "Save Changes"}
          </Button>
        </div>
      </section>

      <section className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Client List</h3>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search clients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[860px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <th className="px-3">Client</th>
                <th className="px-3">Vendor</th>
                <th className="px-3">Phone</th>
                <th className="px-3">Email</th>
                <th className="px-3">Event Type</th>
                <th className="px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-slate-300">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="glass">
                    <td className="rounded-l-xl px-3 py-3 font-medium text-white">{c.client_name}</td>
                    <td className="px-3 py-3 text-slate-200">
                      {c.vendor_id
                        ? vendorNameById.get(c.vendor_id) || "—"
                        : (c.vendors && Array.isArray(c.vendors)
                            ? c.vendors[0]?.business_name
                            : c.vendors?.business_name) || "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-200">{c.phone || "—"}</td>
                    <td className="px-3 py-3 text-slate-200">{c.email || "—"}</td>
                    <td className="px-3 py-3 text-slate-200">{c.event_type || "—"}</td>
                    <td className="rounded-r-xl px-3 py-3">
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => startEdit(c)}>
                          Edit
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleDelete(c.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
