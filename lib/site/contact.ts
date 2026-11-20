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
