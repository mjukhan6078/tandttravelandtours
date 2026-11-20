import { waLink } from "@/lib/site/contact";
import type { InquiryType } from "./types";

export type InquiryPayload = {
  type: InquiryType;
  name: string;
  email: string;
  phone: string;
  message: string;
  interest?: string;
};

/** The WhatsApp message a visitor sends to the T&T agent for a website inquiry. */
export function inquiryWhatsAppText(p: InquiryPayload): string {
  return [
    `Assalam o Alaikum, I'm ${p.name.trim()}. I'm contacting you from the T&T website.`,
    p.interest ? `\nInterested in: ${p.interest}` : "",
    // Prefilled messages start with their own greeting; drop it so it isn't said twice.
    `\n${p.message.trim().replace(/^assalam[ -]?o[ -]?alaikum[,.!]?\s*/i, "")}`,
    `\nPhone: ${p.phone.trim()}`,
    `Email: ${p.email.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Sends a website inquiry to the T&T WhatsApp agent: opens a WhatsApp chat with
 * the details filled in (the visitor taps Send there) and saves a copy on the
 * server. Call it straight from the submit handler, before any await, so the
 * browser treats opening WhatsApp as part of the click and doesn't block it.
 */
export function sendInquiry(payload: InquiryPayload): { waUrl: string; opened: boolean } {
  const waUrl = waLink(inquiryWhatsAppText(payload));
  const win = window.open(waUrl, "_blank");
  if (win) win.opener = null;

  // Backup copy; WhatsApp is the main channel, so a failed save doesn't block the visitor.
  fetch("/api/inquire", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);

  return { waUrl, opened: !!win };
}
