import { after, NextResponse } from "next/server";
import { handleIncoming } from "@/lib/whatsapp/agent";
import { parseIncoming, verifySignature } from "@/lib/whatsapp/cloud-api";
import { isWhatsAppConfigured, whatsappConfig } from "@/lib/whatsapp/config";

/**
 * Webhook for the WhatsApp Cloud API. In the Meta app, set the callback URL to
 * https://www.tandttravelandtours.com/api/whatsapp/webhook, the verify token
 * to WHATSAPP_VERIFY_TOKEN, and subscribe to the "messages" field.
 */

/** Meta's one-time check when the webhook is saved. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token = whatsappConfig.verifyToken();
  if (params.get("hub.mode") === "subscribe" && token && params.get("hub.verify_token") === token) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();

  if (!isWhatsAppConfigured()) {
    console.warn("[whatsapp] webhook called but WHATSAPP_* settings are missing");
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  if (!verifySignature(raw, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Answer Meta straight away (it retries slow webhooks) and write replies afterwards.
  const messages = parseIncoming(body);
  if (messages.length) {
    after(() => Promise.all(messages.map(handleIncoming)));
  }
  return NextResponse.json({ ok: true });
}
