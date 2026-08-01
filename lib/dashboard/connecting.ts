import { airportShortLabel } from "../airports";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

export function formatConnectingDuration(hours: number, minutes: number) {
  const h = Math.max(0, Math.min(72, Math.floor(hours) || 0));
  const m = Math.max(0, Math.min(59, Math.floor(minutes) || 0));
  if (h === 0 && m === 0) return "";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function parseConnectingDuration(value: string): { hours: number; minutes: number } {
  const text = asString(value).toLowerCase();
  if (!text) return { hours: 0, minutes: 0 };
  const hoursMatch = text.match(/(\d+)\s*h/);
  const minutesMatch = text.match(/(\d+)\s*m/);
  if (hoursMatch || minutesMatch) {
    return {
      hours: hoursMatch ? Number(hoursMatch[1]) : 0,
      minutes: minutesMatch ? Number(minutesMatch[1]) : 0,
    };
  }
  if (/^\d+(\.\d+)?$/.test(text)) {
    const total = Number(text);
    return { hours: Math.floor(total), minutes: Math.round((total % 1) * 60) };
  }
  return { hours: 0, minutes: 0 };
}

export function formatConnectingStay(airport: string, duration: string) {
  const code = asString(airport).toUpperCase();
  const layover = asString(duration);
  if (!code && !layover) return "";
  if (code && layover) return `via ${airportShortLabel(code)} · ${layover}`;
  if (code) return `via ${airportShortLabel(code)}`;
  return `layover ${layover}`;
}
