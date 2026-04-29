"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import fullConfig from "./template-config.json";
import enLabels from "./locales/en.json";
import teLabels from "./locales/te.json";
import hiLabels from "./locales/hi.json";
import type { ProjectTemplateData } from "@/lib/template-registry";
import type { TemplateFieldKey, TemplateLanguageCode } from "@/constants/template-fields";

const LOCALES = {
  en: enLabels,
  te: teLabels,
  hi: hiLabels,
} as const;

type Labels = (typeof LOCALES)["en"];

type LanguageContextValue = {
  language: TemplateLanguageCode;
  setLanguage: (lang: TemplateLanguageCode) => void;
  availableLanguages: TemplateLanguageCode[];
  labels: Labels;
  defaults: any;
  getField: (fieldKey: TemplateFieldKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const useLanguage = () => {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used within LanguageProvider");
  return value;
};

function hasAnyTranslation(projectData: ProjectTemplateData | null, language: TemplateLanguageCode) {
  if (!projectData?.translations) return false;
  for (const field of Object.values(projectData.translations)) {
    const value = field?.[language];
    if (typeof value === "string" && value.trim()) return true;
  }
  return false;
}

function getFallbackFromConfig(config: any, labels: Labels, fieldKey: TemplateFieldKey): string {
  switch (fieldKey) {
    case "bride_name":
      return config?.couple?.bride ?? "";
    case "groom_name":
      return config?.couple?.groom ?? "";
    case "title":
      return config?.hero?.title ?? "";
    case "subtitle":
      return config?.hero?.subtitle ?? "";
    case "welcome_message":
      return config?.invitation?.message ?? "";
    case "story_title":
      return labels?.ourStory?.defaultTitle ?? config?.nav?.ourStory ?? "";
    case "story_text":
      return Array.isArray(config?.ourStory?.paragraphs)
        ? config.ourStory.paragraphs.join("\n\n")
        : "";
    case "venue_name":
      return config?.events?.[0]?.venue ?? "";
    case "venue_address":
      return config?.events?.[0]?.address ?? "";
    case "event_time":
      return config?.events?.[0]?.time ?? "";
    case "event_date_text":
      return config?.events?.[0]?.date ?? "";
    case "rsvp_text":
      return config?.rsvpSubtitle ?? "";
    case "footer_message":
    case "family_message":
    case "custom_note":
      return "";
    default:
      return "";
  }
}

export const LanguageProvider = ({
  children,
  projectData,
}: {
  children: React.ReactNode;
  projectData: ProjectTemplateData | null;
}) => {
  const [language, setLanguage] = useState<TemplateLanguageCode>("en");

  const availableLanguages = useMemo(() => {
    const langs: TemplateLanguageCode[] = ["en"];

    if (projectData) {
      if (hasAnyTranslation(projectData, "te")) langs.push("te");
      if (hasAnyTranslation(projectData, "hi")) langs.push("hi");
      return langs;
    }

    if ((fullConfig as any).te) langs.push("te");
    if ((fullConfig as any).hi) langs.push("hi");
    return langs;
  }, [projectData]);

  useEffect(() => {
    if (!availableLanguages.includes(language)) {
      setLanguage("en");
    }
  }, [availableLanguages, language]);

  const labels: Labels = (LOCALES as any)[language] ?? LOCALES.en;
  const defaults: any = (fullConfig as any)[language] ?? (fullConfig as any).en;

  const getField = (fieldKey: TemplateFieldKey) => {
    const byField = projectData?.translations?.[fieldKey];
    const value = byField?.[language];
    if (typeof value === "string" && value.trim()) return value;

    const english = byField?.en;
    if (typeof english === "string" && english.trim()) return english;

    return getFallbackFromConfig(defaults, labels, fieldKey);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, availableLanguages, labels, defaults, getField }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
