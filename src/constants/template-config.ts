import type { TemplateFieldKey, TemplateLanguageCode } from "@/constants/template-fields";

export type TemplateMediaConfig = {
  gallery: boolean;
  music: boolean;
  video: boolean;
  coverImage: boolean;
  ogImage: boolean;
};

export type TemplateFeatureConfig = {
  seo: boolean;
  qr: boolean;
};

export type TemplateConfig = {
  templateCode: string;
  label: string;
  languages: TemplateLanguageCode[];
  translationFields: TemplateFieldKey[];
  media: TemplateMediaConfig;
  features: TemplateFeatureConfig;
};

const DEFAULT_CONFIG: Omit<TemplateConfig, "templateCode" | "label"> = {
  languages: ["en", "te", "hi"],
  translationFields: [],
  media: {
    gallery: false,
    music: false,
    video: false,
    coverImage: false,
    ogImage: true,
  },
  features: {
    seo: true,
    qr: true,
  },
};

/**
 * Single source of truth for template capabilities.
 * Add new templates here and the Create/Edit Project form will adapt.
 */
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  wedding_classic: {
    ...DEFAULT_CONFIG,
    templateCode: "wedding_classic",
    label: "Wedding Template 1 (Classic)",
    // Wedding template 1 uses translations heavily and supports background music.
    translationFields: [
      "title",
      "subtitle",
      "bride_name",
      "groom_name",
      "welcome_message",
      "story_title",
      "story_text",
      "venue_name",
      "venue_address",
      "event_time",
      "event_date_text",
      "rsvp_text",
      "footer_message",
      "family_message",
      "custom_note",
    ],
    media: {
      gallery: false,
      music: true,
      video: false,
      coverImage: false,
      ogImage: true,
    },
    features: {
      seo: true,
      qr: true,
    },
  },
};

export function getTemplateConfig(templateCode: string | null | undefined): TemplateConfig {
  if (templateCode && TEMPLATE_CONFIGS[templateCode]) return TEMPLATE_CONFIGS[templateCode];

  // Safe fallback: SEO + OG enabled, no media.
  return {
    ...DEFAULT_CONFIG,
    templateCode: templateCode ?? "unknown",
    label: templateCode ? `Unknown template (${templateCode})` : "Unknown template",
    translationFields: DEFAULT_CONFIG.translationFields,
  };
}
