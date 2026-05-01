"use client";

import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FaPlay, FaTrash } from "react-icons/fa";
import type { ProjectMediaRow } from "@/lib/template-registry";

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
  projectId: string;
  initialMedia?: ProjectMediaRow[];
  sections: Array<{ key: string; label: string }>;
  onPendingMediaChange?: (items: GalleryItem[]) => void;
};

export function GalleryManager({ projectId, initialMedia = [], sections, onPendingMediaChange }: Props) {
  // Combine into a single state for easier management, or keep separate if preferred.
  // The prompt says "Initialize your gallery state with this grouped data".
  // Let's use a flat array but with isExisting flag.
  const [items, setItems] = useState<GalleryItem[]>(() => 
    initialMedia.map(m => ({
      id: m.id,
      url: m.media_url,
      storagePath: m.storage_path,
      sectionKey: m.section_key,
      mediaType: (m.media_type as "image" | "video") || "image",
      isExisting: true
    }))
  );

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
    
    const newItems = filesArray.map((file, idx) => ({
      id: `pending-${now}-${idx}`,
      file,
      url: URL.createObjectURL(file),
      sectionKey,
      mediaType: file.type.startsWith("video/") ? "video" : "image" as const,
      isExisting: false
    }));

    const updatedItems = [...items, ...newItems];
    setItems(updatedItems);
    
    // Only notify parent of NEW items
    onPendingMediaChange?.(updatedItems.filter(i => !i.isExisting));

    activeSectionRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeItem = async (id: string) => {
    const itemToRemove = items.find(i => i.id === id);
    if (!itemToRemove) return;

    // Optimistic update
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== id);
      onPendingMediaChange?.(filtered.filter(i => !i.isExisting));
      return filtered;
    });

    if (itemToRemove.isExisting && itemToRemove.storagePath) {
      try {
        const res = await fetch("/api/uploads/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaId: itemToRemove.id,
            storagePath: itemToRemove.storagePath
          })
        });

        if (!res.ok) {
          const result = await res.json();
          throw new Error(result.error || "Delete failed");
        }
      } catch (err) {
        // Rollback on error
        // eslint-disable-next-line no-console
        console.error("Failed to delete media:", err);
        setItems(prev => [...prev, itemToRemove]);
      }
    } else if (!itemToRemove.isExisting) {
      URL.revokeObjectURL(itemToRemove.url);
    }
  };

  const groupedItems = sections.reduce((acc, section) => {
    acc[section.key] = items.filter(i => i.sectionKey === section.key);
    return acc;
  }, {} as Record<string, GalleryItem[]>);

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
              size="sm"
              onClick={() => onUploadClick(section.key)}
            >
              Select Media
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {groupedItems[section.key]?.map((item) => (
              <div 
                key={item.id} 
                className={`relative aspect-square rounded-lg overflow-hidden group border ${
                  item.isExisting ? "border-white/10 bg-white/5" : "border-2 border-dashed border-gold/40 bg-gold/5"
                }`}
              >
                {!item.isExisting && (
                  <div className="absolute top-1 left-1 z-10 rounded bg-gold px-1.5 py-0.5 text-[8px] font-bold uppercase text-black">
                    New
                  </div>
                )}
                {item.mediaType === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <FaPlay className="text-gold text-xl" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={item.url} 
                    alt="Gallery item" 
                    className={`w-full h-full object-cover ${!item.isExisting ? "opacity-70" : ""}`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}
            
            {!groupedItems[section.key]?.length && (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-white/10 rounded-lg">
                <p className="text-xs text-slate-400 italic">No media selected for this section</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
