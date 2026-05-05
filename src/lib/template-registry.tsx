import type { ComponentType, ReactNode } from "react";

import WeddingTemplate1 from "@/templates/wedding/template-1";
import InvitationPage1 from "@/templates/wedding/template-1/InvitationPage";
import AlbumPage1 from "@/templates/wedding/template-1/AlbumPage";
import { LanguageProvider as LanguageProvider1 } from "@/templates/wedding/template-1/LanguageContext";
import { ProjectDataProvider as ProjectDataProvider1 } from "@/templates/wedding/template-1/ProjectDataContext";
import template1Config from "@/templates/wedding/template-1/template-config.json";

import type {
  TemplateFieldKey,
  TemplateLanguageCode,
} from "@/constants/template-fields";

export type ProjectMediaRow = {
  id: string;
  project_id: string;
  section_key: string;
  media_url: string;
  storage_path: string;
  media_type: string | null;
  sort_order: number | null;
  created_at: string | null;
};

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
    album_enabled?: boolean;
  };
  translations: Partial<
    Record<string, Partial<Record<TemplateLanguageCode, string | null>>>
  >;
  media: ProjectMediaRow[];
  assets: Array<{ asset_type: string | null; file_url: string; file_name: string | null }>;
};

export type TemplateRenderProps = {
  projectData?: ProjectTemplateData;
  isPreview?: boolean;
};

export type TemplateConfigField = {
  key: string;
  type: "text" | "textarea" | "audio" | "gallery" | "cards";
  label: string;
  translatable?: boolean;
  placeholder?: string;
};

export type TemplateConfig = {
  fields: TemplateConfigField[];
  gallery_sections: Array<{ key: string; label: string }>;
  media: {
    music: boolean;
    coverImage: boolean;
    ogImage: boolean;
  };
  features: {
    seo: boolean;
    qr: boolean;
  };
};

export type TemplateComponents = {
  Layout: ComponentType<{ children: ReactNode }>;
  Invitation: ComponentType<TemplateRenderProps>;
  Album: ComponentType<TemplateRenderProps>;
  Providers: ComponentType<{ children: ReactNode; projectData: ProjectTemplateData | null; isPreview?: boolean }>;
  config: TemplateConfig;
};

export const templateRegistry: Record<string, TemplateComponents> = {
  wedding_classic: {
    Layout: WeddingTemplate1,
    Invitation: InvitationPage1,
    Album: AlbumPage1,
    Providers: ({ children, projectData, isPreview }) => (
      <LanguageProvider1 projectData={projectData}>
        <ProjectDataProvider1 projectData={projectData} isPreview={isPreview}>
          {children}
        </ProjectDataProvider1>
      </LanguageProvider1>
    ),
    config: template1Config as TemplateConfig,
  },
};

export type TemplateRegistryCode = keyof typeof templateRegistry;

export function resolveTemplateComponents(templateCode: string | null | undefined): TemplateComponents | null {
  if (!templateCode) return null;
  return templateRegistry[templateCode] ?? null;
}

// Keeping this for backward compatibility (used in dashboard previews)
export function resolveTemplateComponent(templateCode: string | null | undefined) {
  const components = resolveTemplateComponents(templateCode);
  if (!components) return null;
  const { Layout, Invitation, Providers } = components;
  
  return function FullPage(props: TemplateRenderProps) {
    return (
      <Providers projectData={props.projectData ?? null} isPreview={props.isPreview}>
        <Layout>
          <Invitation {...props} />
        </Layout>
      </Providers>
    );
  };
}

export function resolveTemplateAlbumComponent(templateCode: string | null | undefined) {
  const components = resolveTemplateComponents(templateCode);
  if (!components) return null;
  const { Layout, Album, Providers } = components;
  
  return function FullAlbumPage(props: TemplateRenderProps) {
    return (
      <Providers projectData={props.projectData ?? null} isPreview={props.isPreview}>
        <Layout>
          <Album {...props} />
        </Layout>
      </Providers>
    );
  };
}
