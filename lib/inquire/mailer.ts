import nodemailer, { type Transporter } from "nodemailer";
import type { InquiryRecord } from "./types";

/**
 * Emails a website query to the T&T inbox. SMTP settings come from the
 * environment (on the server: /opt/tandt-site/mail.env, sending through
 * Mailcow as website@tandttravelandtours.com).
 *
 * Without SMTP_HOST, development logs the email instead of sending it, and
 * production reports email as unavailable.
 */

const TYPE_LABEL: Record<InquiryRecord["type"], string> = {
  contact: "Contact form",
  quote: "Quote request",
  inquire: "Inquiry",
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST) || process.env.NODE_ENV !== "production";
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  transporter = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        requireTLS: Number(process.env.SMTP_PORT || 587) !== 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
        // Inside Docker the host is a container name; check the cert against the real mail hostname.
        tls: process.env.SMTP_TLS_SERVERNAME ? { servername: process.env.SMTP_TLS_SERVERNAME } : undefined,
      })
    : nodemailer.createTransport({ jsonTransport: true });
  return transporter;
}

export async function emailInquiry(r: InquiryRecord): Promise<void> {
  const from = process.env.MAIL_FROM || "T&T Website <website@tandttravelandtours.com>";
  const to = process.env.MAIL_TO || "info@tandttravelandtours.com";
  const firstLine = r.message.split("\n")[0].slice(0, 60);

  const text = [
    `New ${TYPE_LABEL[r.type].toLowerCase()} from the T&T website.`,
    "",
    `Name: ${r.name}`,
    `Phone / WhatsApp: ${r.phone}`,
    r.email ? `Email: ${r.email}` : null,
    r.interest ? `Interested in: ${r.interest}` : null,
    "",
    r.message,
    "",
    "—",
    `Reference: ${r.id}`,
    `Received: ${new Date(r.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Karachi" })} (Karachi time)`,
    `Reply on WhatsApp: https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0/, "92")}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const info = await getTransporter().sendMail({
    from,
    to,
    replyTo: r.email ? `${r.name} <${r.email}>` : undefined,
    subject: `${TYPE_LABEL[r.type]}: ${r.name}${r.interest ? ` (${r.interest})` : ""} — ${firstLine}`,
    text,
  });

  if (!process.env.SMTP_HOST) console.info("[inquire] email (dev, not sent):", info.message.toString());
}
