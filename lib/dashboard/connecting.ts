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
  const hoursMatch = text.match(/(\d+)\s*h?/);
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
