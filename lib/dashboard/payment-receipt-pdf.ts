import { randomBytes } from "crypto";
import { defaultPaymentTransaction, type PaymentTransaction } from "./types";
import { extractTextFromPdf } from "./ticket-pdf";
import { normalizeTicketCurrency } from "./ticket-pricing";

export type ParsedPaymentReceiptResult = {
  transaction: PaymentTransaction;
  summary: string;
};

function newId() {
  return `pay_txn_${randomBytes(4).toString("hex")}`;
}

function normalizeSpaces(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
}

function pick(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
}

function parseAmount(raw: string): string {
  const cleaned = raw.replace(/,/g, "").replace(/\s+/g, "");
  const match = cleaned.match(/(\d+(?:\.\d{1,2})?)/);
  return match?.[1] || "";
}

/** DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD → YYYY-MM-DD */
function parseDate(raw: string): string {
  const text = raw.trim();
  const iso = text.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }
  const dmy = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  return "";
}

function detectMethod(text: string): string {
  if (/jazz\s*cash/i.test(text)) return "JazzCash";
  if (/easy\s*paisa/i.test(text)) return "EasyPaisa";
  if (/raast/i.test(text)) return "Raast";
  if (/bank\s*transfer|iban|online\s*transfer/i.test(text)) return "Bank transfer";
  if (/cash/i.test(text)) return "Cash";
  if (/card|visa|mastercard/i.test(text)) return "Card";
  return "";
}

function detectCurrency(text: string): string {
  const labeled = pick(text, [
    /(?:currency|curr)\s*[:\s]*([A-Z]{3})/i,
    /\b(PKR|SAR|AED|USD|EUR|GBP|INR)\b/,
    /\b(Rs\.?|₨)\b/i,
  ]);
  if (/^rs\.?$|^₨$/i.test(labeled)) return "PKR";
  return normalizeTicketCurrency(labeled, "PKR");
}

export function parsePaymentReceiptText(rawText: string): ParsedPaymentReceiptResult {
  const text = normalizeSpaces(rawText);

  const amountRaw = pick(text, [
    /(?:amount|paid|received|debit|credit|total)\s*(?:rs\.?|pkr|sar)?\s*[:\s]*([0-9,]+\.?\d*)/i,
    /(?:rs\.?|pkr|₨)\s*([0-9,]+\.?\d*)/i,
    /([0-9,]+\.?\d*)\s*(?:pkr|rs\.?|₨)/i,
    /PKR\s*([0-9,]+\.?\d*)/i,
  ]);

  const amount = parseAmount(amountRaw);

  const paidAt = parseDate(
    pick(text, [
      /(?:date|paid\s*on|transaction\s*date|txn\s*date)\s*[:\s]*(\d{1,4}[\/\-.]\d{1,2}[\/\-.]\d{1,4})/i,
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/,
      /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
    ])
  );

  const reference = pick(text, [
    /(?:tid|txn\s*id|transaction\s*id|reference|ref\.?\s*no\.?|rrn|stan)\s*[:\s]*([A-Z0-9-]{5,})/i,
    /\b([A-Z0-9]{8,22})\b/,
  ]);

  const method = detectMethod(text);
  const currency = detectCurrency(text);

  const transaction: PaymentTransaction = {
    ...defaultPaymentTransaction(),
    id: newId(),
    amount,
    currency,
    method,
    reference,
    paidAt,
    notes: "",
    documentId: "",
    source: "receipt",
  };

  if (!amount && !reference && !paidAt && !method) {
    throw new Error("No payment details found in this receipt");
  }

  const summary = [
    amount && `${currency} ${amount}`,
    method,
    paidAt,
    reference && `Ref ${reference}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    transaction,
    summary: summary || "Payment receipt loaded",
  };
}

export async function parsePaymentReceiptPdf(
  buffer: Buffer
): Promise<ParsedPaymentReceiptResult> {
  const text = await extractTextFromPdf(buffer);
  if (!text.trim()) {
    throw new Error("Could not read text from receipt PDF");
  }
  return parsePaymentReceiptText(text);
}

/** Build a receipt transaction when PDF text is unavailable (e.g. image upload). */
export function receiptTransactionFromHints(hints: {
  amount?: string;
  currency?: string;
  method?: string;
  reference?: string;
  paidAt?: string;
  notes?: string;
  fileName?: string;
}): PaymentTransaction {
  return {
    ...defaultPaymentTransaction(),
    id: newId(),
    amount: String(hints.amount || "").trim(),
    currency: normalizeTicketCurrency(hints.currency, "PKR"),
    method: String(hints.method || "").trim(),
    reference: String(hints.reference || "").trim(),
    paidAt: String(hints.paidAt || "").trim(),
    notes: String(hints.notes || hints.fileName || "").trim(),
    documentId: "",
    source: "receipt",
  };
}
