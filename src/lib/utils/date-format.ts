import { formatInTimeZone } from "date-fns-tz";
import { parseISO } from "date-fns";

type DateInput = string | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Date-only values (YYYY-MM-DD) must be anchored to a timezone to avoid
  // server/browser timezone differences shifting the calendar day.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return parseISO(`${trimmed}T00:00:00Z`);
  }

  const parsed = parseISO(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Deterministic display date for SSR + hydration safety.
 * Uses UTC and a fixed pattern (no locale-dependent output).
 */
export function formatDisplayDate(value: DateInput, pattern = "dd MMM yyyy") {
  const date = toDate(value);
  if (!date) return "-";
  return formatInTimeZone(date, "UTC", pattern);
}

/**
 * Deterministic display datetime for SSR + hydration safety.
 * Uses UTC and a fixed pattern (no locale-dependent output).
 */
export function formatDisplayDateTime(value: DateInput, pattern = "dd MMM yyyy HH:mm") {
  const date = toDate(value);
  if (!date) return "-";
  return formatInTimeZone(date, "UTC", pattern);
}
