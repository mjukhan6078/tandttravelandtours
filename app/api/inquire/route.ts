import { NextResponse } from "next/server";
import { appendInquiry } from "@/lib/inquire/store";
import { emailInquiry, isEmailConfigured } from "@/lib/inquire/mailer";
import type { InquiryChannel, InquiryRecord, InquiryType } from "@/lib/inquire/types";

const TYPES: InquiryType[] = ["contact", "quote", "inquire"];

/** Max characters per field. The Umrah builder's summary is the longest message. */
const LIMITS = { name: 100, email: 200, phone: 30, interest: 100, message: 5000 };

const rateMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 10;
  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  // Prefer X-Real-IP: the nginx proxy sets it from the connection, whereas the
  // first X-Forwarded-For entry is whatever the client sent.
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  // Single-line fields end up in email headers, so line breaks are collapsed.
  const line = (v: unknown) => String(v ?? "").replace(/[\r\n]+/g, " ").trim();
  const type = String(data.type || "");
  const channel: InquiryChannel = data.channel === "email" ? "email" : "whatsapp";
  const name = line(data.name);
  const email = line(data.email);
  const phone = line(data.phone);
  const message = String(data.message || "").trim();
  const interest = data.interest ? line(data.interest) || undefined : undefined;

  if (!TYPES.includes(type as InquiryType)) {
    return NextResponse.json({ error: "Invalid inquiry type." }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (email && !isEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (!phone || phone.length < 7) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  if (!message || message.length < 5) {
    return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
  }
  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    phone.length > LIMITS.phone ||
    message.length > LIMITS.message ||
    (interest?.length ?? 0) > LIMITS.interest
  ) {
    return NextResponse.json(
      { error: "Some details are too long. Please shorten your message and try again." },
      { status: 400 }
    );
  }

  if (channel === "email" && !isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email isn't available right now. Please send your query on WhatsApp." },
      { status: 503 }
    );
  }

  let record: InquiryRecord;
  try {
    record = await appendInquiry({
      type: type as InquiryType,
      channel,
      name,
      email: email || undefined,
      phone,
      message,
      interest,
    });
  } catch (err) {
    console.error("[inquire] could not save inquiry", err);
    if (channel === "whatsapp") {
      return NextResponse.json({ error: "Could not save a copy." }, { status: 500 });
    }
    // Still try to email it: the inbox matters more than the backup file.
    record = {
      id: `unsaved_${Date.now()}`,
      createdAt: new Date().toISOString(),
      type: type as InquiryType,
      channel,
      name,
      email: email || undefined,
      phone,
      message,
      interest,
    };
  }

  if (channel === "email") {
    try {
      await emailInquiry(record);
    } catch (err) {
      console.error("[inquire] could not email inquiry", record.id, err);
      return NextResponse.json(
        { error: "We couldn't send your query by email. Please send it on WhatsApp instead." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ ok: true, id: record.id });
}
