import { airportShortLabel } from "../airports";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

export function formatConnectingDuration(hours: number) {
  const h = Math.max(0, Math.min(72, Math.floor(hours) || 0));
  if (h === 0) return "";
  return `${h}h`;
}

export function parseConnectingDuration(value: string): { hours: number } {
  const text = asString(value).toLowerCase();
  if (!text) return { hours: 0 };
  const hoursMatch = text.match(/(\d+)\s*h/);
  if (hoursMatch) return { hours: Number(hoursMatch[1]) };
  if (/^\d+$/.test(text)) return { hours: Number(text) };
  return { hours: 0 };
}

export function formatConnectingStay(airport: string, duration: string) {
  const code = asString(airport).toUpperCase();
  const layover = asString(duration);
  if (!code && !layover) return "";
  if (code && layover) return `via ${airportShortLabel(code)} · ${layover}`;
  if (code) return `via ${airportShortLabel(code)}`;
  return `layover ${layover}`;
}

function parseTimeToMinutes(time: string): number | null {
  const text = asString(time);
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Arrival at connection + stay hours → departure from connection */
export function addHoursToTime(time: string, hours: number): string {
  const minutes = parseTimeToMinutes(time);
  if (minutes == null || hours < 0) return "";
  return minutesToTime(minutes + hours * 60);
}

/** Departure − arrival → stay hours (supports overnight wrap) */
export function hoursBetweenTimes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start == null || end == null) return 0;
  let diff = end - start;
  if (diff < 0) diff += 24 * 60;
  return Math.round(diff / 60);
}
