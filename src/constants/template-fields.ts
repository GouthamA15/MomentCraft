export const TEMPLATE_FIELD_KEYS = [
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
] as const;

export type TemplateFieldKey = (typeof TEMPLATE_FIELD_KEYS)[number];

export const TEMPLATE_LANGUAGE_CODES = ["en", "te", "hi"] as const;
export type TemplateLanguageCode = (typeof TEMPLATE_LANGUAGE_CODES)[number];

export function isTemplateFieldKey(value: unknown): value is TemplateFieldKey {
  return (
    typeof value === "string" &&
    (TEMPLATE_FIELD_KEYS as readonly string[]).includes(value)
  );
}

export function isTemplateLanguageCode(value: unknown): value is TemplateLanguageCode {
  return (
    typeof value === "string" &&
    (TEMPLATE_LANGUAGE_CODES as readonly string[]).includes(value)
  );
}
