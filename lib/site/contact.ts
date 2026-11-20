export const SITE_NAME = "T&T Travel and Tours";

export const WHATSAPP_NUMBER = "923002062324";
export const WHATSAPP_DISPLAY = "+92 300 2062324";
export const WHATSAPP_NAME = "Muhammad Irfanullah Khan";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const EMAIL = "info@tandttravelandtours.com";
export const ADDRESS =
  "Office# 18, Sohni Shopping Mall, 2nd Floor, Main Karimabad, Karachi, Pakistan";

export const PHONE_TEL = `tel:+${WHATSAPP_NUMBER}`;
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  "Sohni Shopping Mall, Karimabad, Karachi"
)}&output=embed`;

/** WhatsApp chat link with a prefilled message. */
export function waLink(text?: string) {
  return text ? `${WHATSAPP_URL}?text=${encodeURIComponent(text)}` : WHATSAPP_URL;
}

/** What the floating WhatsApp button says, by page, so the agent knows what the visitor was viewing. */
const PAGE_WHATSAPP_TOPICS: Record<string, string> = {
  "/services/umrah": "I'm interested in your Umrah packages. Please share the latest dates and prices.",
  "/services/hotels": "I'd like hotel rates in Makkah and Madinah.",
  "/services/transport": "I'd like to book transport in Saudi Arabia (airport and city transfers).",
  "/services/visa": "I'd like to ask about a Saudi visa.",
  "/services/ziaraat": "I'd like to book ziaraat in Makkah and Madinah.",
  "/services/flights": "I'd like fares for flight tickets.",
  "/umrah-planner": "I'm building an Umrah package on your website and have a question.",
  "/get-a-quote": "I'd like a quote for my trip.",
  "/services": "I'd like to know more about your services.",
  "/faq": "I have a question that isn't in your FAQ.",
};

/** Prefilled WhatsApp text for the page at `pathname`. */
export function pageWhatsAppText(pathname: string): string {
  const topic =
    PAGE_WHATSAPP_TOPICS[pathname.replace(/\/$/, "")] ??
    "I'd like to know more about your Umrah packages and travel services.";
  return `Assalam o Alaikum, ${topic}`;
}
