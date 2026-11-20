import { waLink } from "@/lib/site/contact";
import type { InquiryChannel, InquiryType } from "./types";

export type InquiryPayload = {
  type: InquiryType;
  name: string;
  phone: string;
  message: string;
  email?: string;
  interest?: string;
};

/** The WhatsApp message a visitor sends to the T&T agent for a website query. */
export function inquiryWhatsAppText(p: InquiryPayload): string {
  return [
    `Assalam o Alaikum, I'm ${p.name.trim()}. I'm contacting you from the T&T website.`,
    p.interest ? `\nInterested in: ${p.interest}` : "",
    // Prefilled messages start with their own greeting; drop it so it isn't said twice.
    `\n${p.message.trim().replace(/^assalam[ -]?o[ -]?alaikum[,.!]?\s*/i, "")}`,
    `\nPhone: ${p.phone.trim()}`,
    p.email?.trim() ? `Email: ${p.email.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function post(payload: InquiryPayload, channel: InquiryChannel, keepalive = false) {
  return fetch("/api/inquire", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, email: payload.email || undefined, channel }),
    keepalive,
  });
}

/**
 * "Send on WhatsApp": opens a WhatsApp chat to the T&T agent with the details
 * filled in (the visitor taps Send there) and saves a backup copy on the server.
 * Call it straight from the click/submit handler, before any await, so the
 * browser treats opening WhatsApp as part of the click and doesn't block it.
 */
export function openWhatsAppInquiry(payload: InquiryPayload): { waUrl: string; opened: boolean } {
  const waUrl = waLink(inquiryWhatsAppText(payload));
  const win = window.open(waUrl, "_blank");
  if (win) win.opener = null;
  post(payload, "whatsapp", true).catch(() => undefined);
  return { waUrl, opened: !!win };
}

/** "Send query": emails the query to the T&T inbox. Resolves to an error message, or null on success. */
export async function emailInquiry(payload: InquiryPayload): Promise<string | null> {
  try {
    const res = await post(payload, "email");
    if (res.ok) return null;
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return data.error || "Something went wrong. Please try again or send it on WhatsApp.";
  } catch {
    return "Network error. Please try again or send it on WhatsApp.";
  }
}
