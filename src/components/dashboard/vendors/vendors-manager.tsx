"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { VendorDetailRow } from "@/types/project";

type VendorDraft = {
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  is_active: boolean;
};

const emptyDraft: VendorDraft = {
  business_name: "",
  owner_name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  is_active: true,
};

export function VendorsManager({
  initialVendors,
}: {
  initialVendors: VendorDetailRow[];
}) {
  const [vendors, setVendors] = useState<VendorDetailRow[]>(initialVendors);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<VendorDraft>(emptyDraft);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => {
      const haystack = [
        v.business_name,
        v.owner_name,
        v.phone,
        v.email,
        v.address,
        v.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [vendors, query]);

  const resetForm = () => {
    setMode("create");
    setEditingId(null);
    setDraft(emptyDraft);
    setError("");
  };

  const startEdit = (vendor: VendorDetailRow) => {
    setMode("edit");
    setEditingId(vendor.id);
    setDraft({
      business_name: vendor.business_name ?? "",
      owner_name: vendor.owner_name ?? "",
      phone: vendor.phone ?? "",
      email: vendor.email ?? "",
      address: vendor.address ?? "",
      notes: vendor.notes ?? "",
      is_active: vendor.is_active,
    });
    setError("");
  };

  const handleSave = async () => {
    setError("");

    if (!draft.business_name.trim()) {
      setError("Business Name is required.");
      return;
    }

    setSaving(true);

    try {
      if (mode === "create") {
        const response = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to create vendor.");

        setVendors((prev) => [result.vendor as VendorDetailRow, ...prev]);
        resetForm();
      } else {
        if (!editingId) return;
        const response = await fetch(`/api/vendors/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to update vendor.");

        setVendors((prev) =>
          prev.map((v) => (v.id === editingId ? (result.vendor as VendorDetailRow) : v)),
        );
        resetForm();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vendorId: string) => {
    const ok = window.confirm(
      "Delete this vendor? This will also delete its clients (database cascade).",
    );
    if (!ok) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/vendors/${vendorId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete vendor.");

      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
      if (editingId === vendorId) resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Vendors</h2>
        <p className="text-sm text-slate-300">Create, manage and search vendors.</p>
      </div>

      <section className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">
            {mode === "create" ? "Create Vendor" : "Edit Vendor"}
          </h3>
          {mode === "edit" ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel Edit
            </Button>
          ) : null}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-slate-300">Business Name</p>
            <Input
              value={draft.business_name}
              onChange={(e) => setDraft((d) => ({ ...d, business_name: e.target.value }))}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Owner Name</p>
            <Input
              value={draft.owner_name}
              onChange={(e) => setDraft((d) => ({ ...d, owner_name: e.target.value }))}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Phone</p>
            <Input
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-300">Email</p>
            <Input
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <p className="mb-1 text-xs text-slate-300">Address</p>
            <Input
              value={draft.address}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
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
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
            />
            Active
          </label>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-3 flex gap-2">
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : mode === "create" ? "Create Vendor" : "Save Changes"}
          </Button>
        </div>
      </section>

      <section className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Vendor List</h3>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search vendors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <th className="px-3">Business</th>
                <th className="px-3">Owner</th>
                <th className="px-3">Phone</th>
                <th className="px-3">Email</th>
                <th className="px-3">Status</th>
                <th className="px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-slate-300">
                    No vendors found.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="glass">
                    <td className="rounded-l-xl px-3 py-3 font-medium text-white">
                      {v.business_name}
                    </td>
                    <td className="px-3 py-3 text-slate-200">{v.owner_name || "—"}</td>
                    <td className="px-3 py-3 text-slate-200">{v.phone || "—"}</td>
                    <td className="px-3 py-3 text-slate-200">{v.email || "—"}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          v.is_active
                            ? "rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200"
                            : "rounded-full border border-slate-300/20 bg-white/5 px-2 py-1 text-xs text-slate-300"
                        }
                      >
                        {v.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="rounded-r-xl px-3 py-3">
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => startEdit(v)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDelete(v.id)}
                        >
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
