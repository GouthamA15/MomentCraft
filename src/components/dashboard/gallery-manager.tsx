"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  projectId: string;
  value: string;
  onChange: (next: string) => void;
};

function parseLines(value: string): string[] {
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toLines(urls: string[]): string {
  return urls.join("\n");
}

export function GalleryManager({ projectId, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urls = useMemo(() => parseLines(value), [value]);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      if (!files || (Array.isArray(files) ? files.length === 0 : files.length === 0)) return;

      setIsUploading(true);
      try {
        const current = parseLines(value);
        const next = [...current];

        const list = Array.isArray(files) ? files : Array.from(files);

        for (const file of list) {
          const form = new FormData();
          form.append("file", file);
          form.append("projectId", projectId);
          form.append("kind", "gallery");

          const res = await fetch("/api/uploads", { method: "POST", body: form });
          const json = (await res.json()) as { publicUrl?: string; error?: string };
          if (!res.ok) throw new Error(json.error || "Upload failed");
          if (!json.publicUrl) throw new Error("Upload did not return a publicUrl");

          next.push(json.publicUrl);
          onChange(toLines(next));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, projectId, value]
  );

  const onPick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    async (ev: React.ChangeEvent<HTMLInputElement>) => {
      const files = ev.target.files;
      if (!files || files.length === 0) return;
      await uploadFiles(files);
      ev.target.value = "";
    },
    [uploadFiles]
  );

  const onDrop = useCallback(
    async (ev: React.DragEvent<HTMLDivElement>) => {
      ev.preventDefault();
      if (isUploading) return;
      const files = ev.dataTransfer.files;
      if (!files || files.length === 0) return;
      await uploadFiles(files);
    },
    [isUploading, uploadFiles]
  );

  const move = (from: number, to: number) => {
    const current = parseLines(value);
    if (from < 0 || from >= current.length) return;
    if (to < 0 || to >= current.length) return;

    const copy = [...current];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(toLines(copy));
  };

  const removeAt = (idx: number) => {
    const current = parseLines(value);
    const next = current.filter((_, i) => i !== idx);
    onChange(toLines(next));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Gallery Uploads</p>
          <p className="text-xs text-slate-300">Drag & drop images or upload from your device.</p>
        </div>
        <Button type="button" variant="outline" onClick={onPick} disabled={isUploading}>
          {isUploading ? "Uploading…" : "Upload images"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />

      <div
        className="rounded-lg border border-dashed border-white/20 p-4 text-sm text-slate-300"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        Drop images here to upload.
      </div>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <div className="space-y-2">
        {urls.map((url, idx) => (
          <div key={`${url}-${idx}`} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Gallery ${idx + 1}`} className="h-12 w-12 rounded-md border border-white/10 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-200">{url}</p>
              <p className="text-[11px] text-slate-400">#{idx + 1}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" variant="outline" disabled={idx === 0} onClick={() => move(idx, idx - 1)}>
                Up
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={idx === urls.length - 1}
                onClick={() => move(idx, idx + 1)}
              >
                Down
              </Button>
              <Button type="button" variant="outline" onClick={() => removeAt(idx)}>
                Remove
              </Button>
            </div>
          </div>
        ))}

        {!urls.length ? <p className="text-xs text-slate-300">No gallery images yet.</p> : null}
      </div>
    </div>
  );
}
