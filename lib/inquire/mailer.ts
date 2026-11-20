import nodemailer, { type Transporter } from "nodemailer";
import { UMRAH_BUILDER_INTRO, type InquiryRecord } from "./types";

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

/* ───────────── parsing the query text ───────────── */

type Block =
  | { kind: "heading"; text: string }
  | { kind: "row"; label: string; value: string }
  | { kind: "text"; text: string };

/**
 * The Umrah builder sends "*HEADING*" lines and "Label: value" lines; other
 * forms send free text, which stays as paragraphs.
 */
function parseMessage(message: string, structured: boolean): Block[] {
  return message
    .split("\n")
    .map((raw): Block | null => {
      const line = raw.trim();
      if (!line || line === UMRAH_BUILDER_INTRO) return null;
      if (!structured) return { kind: "text", text: line };
      const heading = line.match(/^\*(.+)\*$/);
      if (heading) return { kind: "heading", text: heading[1] };
      const i = line.lastIndexOf(": ");
      if (i > 0) return { kind: "row", label: line.slice(0, i), value: line.slice(i + 2) };
      return { kind: "text", text: line };
    })
    .filter((b): b is Block => b !== null);
}

/** Digits for wa.me: Pakistani numbers written as 03xx… become 923xx…. */
function whatsAppNumber(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return `92${d.slice(1)}`;
  if (d.length === 10 && d.startsWith("3")) return `92${d}`;
  return d;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ───────────── email ───────────── */

export async function emailInquiry(r: InquiryRecord): Promise<void> {
  const from = process.env.MAIL_FROM || "T&T Website <website@tandttravelandtours.com>";
  const to = process.env.MAIL_TO || "info@tandttravelandtours.com";

  const isBuilder = r.message.startsWith(UMRAH_BUILDER_INTRO);
  const title = isBuilder ? "Umrah package request" : TYPE_LABEL[r.type];
  const blocks = parseMessage(r.message, isBuilder);
  const received = new Date(r.createdAt).toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const wa = `https://wa.me/${whatsAppNumber(r.phone)}`;
  const tel = `tel:${r.phone.replace(/[^\d+]/g, "")}`;
  const subject = `[Website] ${title}: ${r.name}${r.interest && !isBuilder ? ` (${r.interest})` : ""} · ${r.phone}`;
  const nextStep = isBuilder
    ? "Reply on WhatsApp, confirm hotel availability and send the final price. The estimate uses the website's rates."
    : "Reply to the customer on WhatsApp or by phone.";

  /* Plain text, for mail apps that don't show HTML. */
  const text = [
    `${title.toUpperCase()} from the T&T website`,
    `Received ${received} (Karachi time)`,
    "",
    "CUSTOMER",
    `Name: ${r.name}`,
    `Phone / WhatsApp: ${r.phone}`,
    r.email ? `Email: ${r.email}` : null,
    r.interest ? `Interested in: ${r.interest}` : null,
    `Reply on WhatsApp: ${wa}`,
    isBuilder ? null : "\nMESSAGE",
    ...blocks.map((b) =>
      b.kind === "heading" ? `\n${b.text}` : b.kind === "row" ? `${b.label}: ${b.value}` : b.text
    ),
    "",
    `Next step: ${nextStep}`,
    `Reference: ${r.id}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  /* HTML: inline styles and tables, which every mail app renders. */
  const sectionTitle = (t: string) =>
    `<tr><td colspan="2" style="padding:22px 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#f7931e;border-bottom:2px solid #eef2f9">${esc(t)}</td></tr>`;
  const row = (label: string, value: string, total = false) =>
    `<tr><td style="padding:9px 14px 9px 0;width:36%;vertical-align:top;font-size:13px;color:#5b6475;border-bottom:1px solid #f1f4f9">${esc(label)}</td><td style="padding:9px 0;vertical-align:top;color:#0a1f44;border-bottom:1px solid #f1f4f9;${total ? "font-weight:800;font-size:17px" : "font-weight:600;font-size:14px"}">${esc(value)}</td></tr>`;
  const para = (t: string) =>
    `<tr><td colspan="2" style="padding:6px 0;font-size:14px;line-height:1.6;color:#0a1f44">${esc(t)}</td></tr>`;
  const body = blocks
    .map((b) =>
      b.kind === "heading"
        ? sectionTitle(b.text)
        : b.kind === "row"
          ? row(b.label, b.value, /^total$/i.test(b.label))
          : para(b.text)
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f7fc;font-family:'Segoe UI',Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fc;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden">
  <tr><td style="background:#0a1f44;padding:22px 28px;color:#ffffff">
    <div style="font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#f7931e">New from the T&amp;T website</div>
    <div style="margin-top:4px;font-size:22px;font-weight:800;color:#ffffff">${esc(title)}</div>
    <div style="margin-top:4px;font-size:13px;color:#c9d3e6">Received ${esc(received)} (Karachi time)</div>
  </td></tr>
  <tr><td style="padding:22px 28px 6px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fc;border-radius:12px"><tr><td style="padding:16px 18px">
      <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#5b6475">Customer</div>
      <div style="margin-top:4px;font-size:20px;font-weight:800;color:#0a1f44">${esc(r.name)}</div>
      <div style="margin-top:4px;font-size:15px"><a href="${esc(tel)}" style="color:#1846a3;text-decoration:none;font-weight:700">${esc(r.phone)}</a>${
        r.email ? ` &nbsp;·&nbsp; <a href="mailto:${esc(r.email)}" style="color:#1846a3;text-decoration:none">${esc(r.email)}</a>` : ""
      }</div>
      ${r.interest ? `<div style="margin-top:4px;font-size:13px;color:#5b6475">Interested in: <b style="color:#0a1f44">${esc(r.interest)}</b></div>` : ""}
      <div style="margin-top:14px">
        <a href="${esc(wa)}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:999px">Reply on WhatsApp</a>
        &nbsp;<a href="${esc(tel)}" style="display:inline-block;background:#ffffff;color:#0a1f44;text-decoration:none;font-weight:700;font-size:14px;padding:9px 18px;border-radius:999px;border:1px solid #d6dce8">Call</a>
      </div>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:0 28px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${isBuilder ? "" : sectionTitle("Message")}
      ${body}
    </table>
  </td></tr>
  <tr><td style="padding:18px 28px 24px">
    <div style="background:#fff6ea;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.5;color:#0a1f44"><b>Next step:</b> ${esc(nextStep)}</div>
    <div style="margin-top:14px;font-size:11px;color:#8a93a6">Reference ${esc(r.id)} · Sent from the form on tandttravelandtours.com</div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  await getTransporter().sendMail({
    from,
    to,
    replyTo: r.email ? `${r.name} <${r.email}>` : undefined,
    subject,
    text,
    html,
  });

  // Dev without SMTP: keep a copy to preview the layout instead of sending.
  if (!process.env.SMTP_HOST) {
    const { promises: fs } = await import("fs");
    await fs.mkdir(".data", { recursive: true });
    await fs.writeFile(".data/last-email.html", html);
    await fs.writeFile(".data/last-email.txt", `Subject: ${subject}\n\n${text}`);
    console.info("[inquire] email (dev, not sent):", subject, "→ .data/last-email.html");
  }
}
