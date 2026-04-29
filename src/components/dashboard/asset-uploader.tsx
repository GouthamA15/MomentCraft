"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type UploadKind = "cover_image" | "og_image" | "background_music" | "gallery" | "video";

type Props = {
  projectId: string;
  kind: UploadKind;
  label: string;
  accept?: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
};

export function AssetUploader({
  projectId,
  kind,
  label,
  accept,
  value,
  onChange,
  helperText,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const form = new FormData();
        form.append("file", file);
        form.append("projectId", projectId);
        form.append("kind", kind);

        const res = await fetch("/api/uploads", {
          method: "POST",
          body: form,
        });

        const json = (await res.json()) as { publicUrl?: string; error?: string };

        if (!res.ok) {
          throw new Error(json.error || "Upload failed");
        }

        if (!json.publicUrl) {
          throw new Error("Upload did not return a publicUrl");
        }

        onChange(json.publicUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [kind, onChange, projectId]
  );

  const onDrop = useCallback(
    async (ev: React.DragEvent<HTMLDivElement>) => {
      ev.preventDefault();
      if (isUploading) return;
      const file = ev.dataTransfer.files?.[0];
      if (!file) return;
      await startUpload(file);
    },
    [isUploading, startUpload]
  );

  const onPick = useCallback(async () => {
    inputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    async (ev: React.ChangeEvent<HTMLInputElement>) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      await startUpload(file);
      ev.target.value = "";
    },
    [startUpload]
  );

  const showImagePreview = kind === "cover_image" || kind === "og_image";
  const showAudioPreview = kind === "background_music";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {helperText ? <p className="text-xs text-slate-300">{helperText}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onPick} disabled={isUploading}>
            {isUploading ? "Uploading…" : "Upload"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange("")}
              disabled={isUploading}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFileChange}
      />

      <div
        className="mt-3 rounded-lg border border-dashed border-white/20 p-4 text-sm text-slate-300"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        Drag & drop a file here, or click Upload.
      </div>

      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}

      {value ? (
        <div className="mt-3">
          <p className="text-xs text-slate-300 break-all">{value}</p>
          {showImagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={label} src={value} className="mt-2 h-32 w-auto rounded-lg border border-white/10" />
          ) : null}
          {showAudioPreview ? (
            <audio className="mt-2 w-full" controls src={value} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
