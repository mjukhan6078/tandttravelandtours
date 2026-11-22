import crypto from "crypto";
import { whatsappConfig } from "./config";

/**
 * The bits of the WhatsApp Cloud API (Meta Graph API) the auto-responder uses:
 * checking webhook signatures, reading incoming messages, and sending replies.
 */

/** WhatsApp caps a text message at 4096 characters. */
const MAX_TEXT = 4000;

/** Checks Meta's X-Hub-Signature-256 header against the raw request body. */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = whatsappConfig.appSecret();
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const given = header.slice("sha256=".length);
  if (given.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
}

/* ───────────── incoming webhook ───────────── */

type WebhookMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  button?: { text: string };
  interactive?: { button_reply?: { title: string }; list_reply?: { title: string } };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  image?: { caption?: string };
  video?: { caption?: string };
  document?: { caption?: string; filename?: string };
};

type WebhookPayload = {
  object?: string;
  entry?: {
    changes?: {
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: { wa_id: string; profile?: { name?: string } }[];
        messages?: WebhookMessage[];
      };
    }[];
  }[];
};

export type IncomingMessage = {
  id: string;
  /** The customer's WhatsApp ID: their number in international format, digits only. */
  waId: string;
  name?: string;
  /** What the customer sent, as text the assistant can read. */
  text: string;
  receivedAt: Date;
};

/** What a non-text message becomes, so the assistant knows something arrived. */
function describe(m: WebhookMessage): string | null {
  switch (m.type) {
    case "text":
      return m.text?.body?.trim() || null;
    case "button":
      return m.button?.text ?? null;
    case "interactive":
      return m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? null;
    case "location": {
      const l = m.location;
      return l ? `[Shared a location: ${[l.name, l.address].filter(Boolean).join(", ") || `${l.latitude}, ${l.longitude}`}]` : null;
    }
    case "image":
    case "video":
    case "document": {
      const caption = m[m.type]?.caption;
      return `[Sent a ${m.type}, which the assistant can't open${caption ? `, with the caption: "${caption}"` : ""}]`;
    }
    case "audio":
      return "[Sent a voice note, which the assistant can't listen to]";
    case "sticker":
    case "reaction":
      return null;
    default:
      return `[Sent a ${m.type} message, which the assistant can't open]`;
  }
}

/** Customer messages in a webhook call. Delivery and read receipts are skipped. */
export function parseIncoming(body: unknown): IncomingMessage[] {
  const payload = body as WebhookPayload;
  if (payload?.object !== "whatsapp_business_account") return [];
  const ownNumberId = whatsappConfig.phoneNumberId();
  const out: IncomingMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (change.field !== "messages" || !value?.messages) continue;
      // One Meta app can serve several numbers; answer only for ours.
      if (ownNumberId && value.metadata?.phone_number_id !== ownNumberId) continue;
      for (const m of value.messages) {
        const text = describe(m);
        if (!text) continue;
        out.push({
          id: m.id,
          waId: m.from.replace(/\D/g, ""),
          name: value.contacts?.find((c) => c.wa_id === m.from)?.profile?.name,
          text,
          receivedAt: new Date(Number(m.timestamp) * 1000 || Date.now()),
        });
      }
    }
  }
  return out;
}

/* ───────────── outgoing ───────────── */

async function graph(body: Record<string, unknown>): Promise<void> {
  const url = `https://graph.facebook.com/${whatsappConfig.graphVersion()}/${whatsappConfig.phoneNumberId()}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${whatsappConfig.accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
  });
  if (!res.ok) {
    throw new Error(`WhatsApp API ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
}

/** Marks the customer's message as read (blue ticks) and shows "typing…" while the reply is written. */
export async function markReadWithTyping(messageId: string): Promise<void> {
  await graph({ status: "read", message_id: messageId, typing_indicator: { type: "text" } });
}

/** Splits a long reply at paragraph or line breaks so each part fits in one message. */
function split(text: string): string[] {
  const parts: string[] = [];
  let rest = text.trim();
  while (rest.length > MAX_TEXT) {
    const cut = Math.max(rest.lastIndexOf("\n\n", MAX_TEXT), rest.lastIndexOf("\n", MAX_TEXT));
    const at = cut > MAX_TEXT / 2 ? cut : MAX_TEXT;
    parts.push(rest.slice(0, at).trim());
    rest = rest.slice(at).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

export async function sendText(to: string, text: string): Promise<void> {
  for (const part of split(text)) {
    await graph({ recipient_type: "individual", to, type: "text", text: { body: part, preview_url: false } });
  }
}
