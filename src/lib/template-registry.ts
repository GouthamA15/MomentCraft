import type { ComponentType } from "react";

import WeddingTemplate1 from "@/templates/wedding/template-1";
import type {
  TemplateFieldKey,
  TemplateLanguageCode,
} from "@/constants/template-fields";

export type ProjectTemplateData = {
  project: {
    id: string;
    project_name: string;
    slug: string;
    status: string;
    event_date: string | null;
    template_id: string | null;
    theme_color: string | null;
    font_family: string | null;
    background_music: string | null;
    seo_title: string | null;
    seo_description: string | null;
    og_image: string | null;
  };
  translations: Partial<
    Record<TemplateFieldKey, Partial<Record<TemplateLanguageCode, string | null>>>
  >;
  gallery: Array<{ image_url: string; sort_order: number }>;
  assets: Array<{ asset_type: string | null; file_url: string; file_name: string | null }>;
};

export type TemplateRenderProps = {
  projectData?: ProjectTemplateData;
};

export const templateRegistry = {
  wedding_classic: WeddingTemplate1,
} as const satisfies Record<string, ComponentType<TemplateRenderProps>>;

export type TemplateRegistryCode = keyof typeof templateRegistry;

export function resolveTemplateComponent(templateCode: string | null | undefined) {
  if (!templateCode) return null;
  return (templateRegistry as Record<string, ComponentType<TemplateRenderProps>>)[templateCode] ?? null;
}
