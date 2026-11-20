import { NextResponse } from "next/server";
import { appendInquiry } from "@/lib/inquire/store";
import type { InquiryType } from "@/lib/inquire/types";

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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
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
  const type = String(data.type || "");
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const phone = String(data.phone || "").trim();
  const message = String(data.message || "").trim();
  const interest = data.interest ? String(data.interest).trim() : undefined;

  if (!TYPES.includes(type as InquiryType)) {
    return NextResponse.json({ error: "Invalid inquiry type." }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!email || !isEmail(email)) {
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

  try {
    const record = await appendInquiry({
      type: type as InquiryType,
      name,
      email,
      phone,
      message,
      interest,
    });
    return NextResponse.json({ ok: true, id: record.id });
  } catch (err) {
    console.error("[inquire] could not save inquiry", err);
    return NextResponse.json(
      { error: "We couldn't save your message. Please try again or message us on WhatsApp." },
      { status: 500 }
    );
  }
}
