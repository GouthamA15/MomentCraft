"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaPlay, FaTrash } from "react-icons/fa";
import type { ProjectMediaRow } from "@/lib/template-registry";
import { createClient } from "@/lib/supabase/client";

export type GalleryItem = {
  id: string;
  url: string;
  storagePath?: string;
  file?: File;
  sectionKey: string;
  mediaType: "image" | "video";
  isExisting: boolean;
};

type Props = {
  sections: Array<{ key: string; label: string }>;
  onPendingMediaChange?: (items: GalleryItem[]) => void;
};

export function GalleryManager({ sections, onPendingMediaChange }: Props) {
  // Initialize gallery state for pending items only
  const [galleryState, setGalleryState] = useState<Record<string, GalleryItem[]>>(() => {
    const initial: Record<string, GalleryItem[]> = {};
    sections.forEach((s) => {
      initial[s.key] = [];
    });
    return initial;
  });

  // Sync pending items to parent whenever galleryState changes
  useEffect(() => {
    const allPending = Object.values(galleryState).flat();
    onPendingMediaChange?.(allPending);
  }, [galleryState, onPendingMediaChange]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeSectionRef = useRef<string | null>(null);

  const onUploadClick = (sectionKey: string) => {
    activeSectionRef.current = sectionKey;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const sectionKey = activeSectionRef.current;
    if (!files || files.length === 0 || !sectionKey) return;

    const filesArray = Array.from(files);
    const now = Date.now();

    const newItems: GalleryItem[] = filesArray.map((file, idx) => {
      const mediaType: GalleryItem["mediaType"] = file.type.startsWith("video/") ? "video" : "image";

      return {
        id: `pending-${now}-${idx}`,
        file,
        url: URL.createObjectURL(file),
        sectionKey,
        mediaType,
        isExisting: false,
      };
    });

    // Append new files to existing state
    setGalleryState((prev) => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), ...newItems],
    }));

    activeSectionRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeItem = (sectionKey: string, id: string) => {
    const itemToRemove = galleryState[sectionKey]?.find((i) => i.id === id);
    if (!itemToRemove) return;

    URL.revokeObjectURL(itemToRemove.url);

    setGalleryState((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter((i) => i.id !== id),
    }));
  };

  return (
    <div className="space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      {sections.map((section) => (
        <div key={section.key} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-amber-100">{section.label}</h4>
            <Button
              type="button"
              variant="outline"
              className="px-3 py-1.5 text-xs"
              onClick={() => onUploadClick(section.key)}
            >
              Select Media
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {/* Condition for showing images depends on state array length for each section */}
            {galleryState[section.key]?.map((item) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-lg border aspect-square ${
                  item.isExisting
                    ? "border-white/10 bg-white/5"
                    : "border-2 border-dashed border-gold/40 bg-gold/5"
                }`}
              >
                {!item.isExisting && (
                  <div className="absolute left-1 top-1 z-10 rounded bg-gold px-1.5 py-0.5 text-[8px] font-bold uppercase text-black">
                    New
                  </div>
                )}
                {item.mediaType === "video" ? (
                  <div className="flex h-full w-full items-center justify-center bg-slate-800">
                    <FaPlay className="text-xl text-gold" />
                  </div>
                ) : (
                  // Render each item using its URL
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt="Gallery item"
                    className={`h-full w-full object-cover ${!item.isExisting ? "opacity-70" : ""}`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeItem(section.key, item.id)}
                  className="absolute right-1 top-1 z-20 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}

            {/* "No media selected" appears only if state array is empty */}
            {(!galleryState[section.key] || galleryState[section.key].length === 0) && (
              <div className="col-span-full rounded-lg border-2 border-dashed border-white/10 py-8 text-center">
                <p className="text-xs italic text-slate-400">No media selected for this section</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


