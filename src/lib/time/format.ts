import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * Format a UTC ISO timestamp in the given IANA timezone, e.g. "Fri 1 May, 5:00 PM PDT".
 */
export function formatInLocationTz(
  utcIso: string,
  timezone: string,
  pattern = "EEE d MMM, h:mm a zzz",
): string {
  return formatInTimeZone(new Date(utcIso), timezone, pattern);
}

/**
 * Convert a naive local-datetime string (e.g. "2026-05-01T17:00") interpreted in
 * the given timezone into a UTC ISO timestamp suitable for the API.
 */
export function localInputToUtcIso(
  localDatetime: string,
  timezone: string,
): string {
  return fromZonedTime(localDatetime, timezone).toISOString();
}
