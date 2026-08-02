import { defaultVisaRecord, type VisaRecord } from "./types";
import { extractTextFromPdf } from "./ticket-pdf";

export type ParsedVisaResult = {
  record: VisaRecord;
  clientNameHint: string;
  summary: string;
};

function normalizeSpaces(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
}

/** DD/MM/YYYY → YYYY-MM-DD */
function parseDmY(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (!m) return "";
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (!day || !month || month > 12 || day > 31) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function pick(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
}

function cleanBilingual(raw: string): string {
  return raw
    .replace(/\s*-\s*[\u0600-\u06FF].*$/g, "")
    .replace(/[\u0600-\u06FF]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Keep Latin agency names or readable Arabic; drop mojibake garbage. */
function cleanAgentField(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "";
  const arabic = text.match(/[\u0600-\u06FF][\u0600-\u06FF\s]{2,}/)?.[0]?.trim();
  if (arabic) return arabic;
  const latin = text.match(/[A-Za-z][A-Za-z0-9\s.&'/-]{2,}/)?.[0]?.trim();
  return latin || "";
}

function parseDuration(raw: string): string {
  const days = raw.match(/(\d+)\s*Days?/i);
  if (days) return `${days[1]} Days`;
  return cleanBilingual(raw);
}

function parseMrzFallback(text: string): Partial<VisaRecord> {
  const loose = text.match(/([A-Z]{1,2}\d{6,9})\d([A-Z]{3})(\d{2})(\d{2})(\d{2})\d/);
  if (!loose) return {};
  const yy = Number(loose[3]);
  const year = yy > 50 ? `19${loose[3]}` : `20${loose[3]}`;
  return {
    passportNumber: loose[1],
    nationality: loose[2] === "PAK" ? "Pakistan" : loose[2],
    birthDate: `${year}-${loose[4]}-${loose[5]}`,
  };
}

export function parseMofaVisaText(rawText: string): ParsedVisaResult {
  const text = normalizeSpaces(rawText);
  const mrz = parseMrzFallback(text);

  const visaNumber = pick(text, [
    /([0-9]{9,12})\s+Visa\s*No/i,
    /Visa\s*No\.?\s*[:\s]*([0-9]{6,})/i,
  ]);

  const applicationNumber = pick(text, [
    /Application\s*No\.?\s*[:\s]*([A-Z0-9]+)/i,
    /\b(E\d{6,})\b/,
  ]);

  const validFromRaw = pick(text, [
    /(\d{1,2}\/\d{1,2}\/\d{4})\s+Valid\s*From/i,
    /Valid\s*From\s*[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ]);

  const validToRaw = pick(text, [
    /(\d{1,2}\/\d{1,2}\/\d{4})\s+Valid\s*until/i,
    /Valid\s*until\s*[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ]);

  const durationRaw = pick(text, [
    /(\d+\s*Days?[^\n]*?)\s+Duration\s*of\s*Stay/i,
    /Duration\s*of\s*Stay\s*[:\s]*([^\n]+)/i,
  ]);

  const passportNumber = pick(text, [
    /([A-Z]{1,2}\d{6,9})\s+Passport\s*No/i,
    /Passport\s*No\.?\s*[:\s]*([A-Z0-9]+)/i,
  ]);

  const placeRaw = pick(text, [
    /(Saudi\s*Digital\s*Embassy[^\n]*?)\s+Place\s*of\s*issue/i,
    /Place\s*of\s*issue\s*[:\s]*([^\n]+)/i,
  ]);

  const fullName = pick(text, [
    /([A-Z][A-Z]+(?:\s+[A-Z][A-Z]+){1,6})\s+Name\b/,
    /\bName\s+([A-Z][A-Z\s.'-]{2,80}?)\s+(?:Nationality|Pakistan)/i,
  ]);

  const nationalityRaw = pick(text, [
    /\b(Pakistan|India|Bangladesh|Egypt|Indonesia|Malaysia|Nigeria|Turkey|United Kingdom|United States)\b[^\n]*Nationality/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*-\s*[\u0600-\u06FF][^\n]*Nationality/,
    /Nationality\s*[:\s]*([A-Za-z][A-Za-z\s]+)/i,
  ]);

  const birthDateRaw = pick(text, [
    /(\d{1,2}\/\d{1,2}\/\d{4})\s+Birth\s*Date/i,
    /Birth\s*Date\s*[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ]);

  const visaTypeRaw = pick(text, [
    /(Umrah|Hajj|Visit|Tourist)\s*-\s*[^\n]*?\s+Visa\s*Type/i,
    /(Umrah|Hajj|Visit|Tourist)[^\n]*?\s+Visa\s*Type/i,
    /Visa\s*Type\s*[:\s]*([A-Za-z]+)/i,
  ]);

  const umrahOperator = cleanAgentField(
    pick(text, [
      /([\u0600-\u06FF][\u0600-\u06FF\s]+|[A-Za-z][A-Za-z0-9\s.&'/-]+)\s+Umrah\s*Operator/i,
    ])
  );

  const externalAgent = cleanAgentField(
    pick(text, [
      /([\u0600-\u06FF][\u0600-\u06FF\s]+|[A-Za-z][A-Za-z0-9\s.&'/-]+)\s+External\s*Agent/i,
    ])
  );

  const borderNumber = pick(text, [
    /([A-Z0-9-]{3,})\s+Border\s*No/i,
    /Border\s*No\.?\s*[:\s]*([A-Z0-9-]+)/i,
  ]);

  const placeOfIssue = /saudi\s*digital/i.test(placeRaw || "")
    ? "Saudi Digital Embassy"
    : cleanBilingual(placeRaw) || "Saudi Digital Embassy";
  const nationality = cleanBilingual(nationalityRaw) || mrz.nationality || "";
  const visaType = cleanBilingual(visaTypeRaw) || "Umrah";

  const record: VisaRecord = {
    ...defaultVisaRecord(),
    status: visaNumber ? "approved" : "pending",
    visaNumber,
    applicationNumber,
    visaType,
    fullName: fullName.replace(/\s+/g, " "),
    passportNumber: passportNumber || mrz.passportNumber || "",
    nationality,
    birthDate: parseDmY(birthDateRaw) || mrz.birthDate || "",
    placeOfIssue,
    umrahOperator,
    externalAgent,
    borderNumber,
    durationOfStay: parseDuration(durationRaw),
    vendor: cleanBilingual(externalAgent) || "",
    validFrom: parseDmY(validFromRaw),
    validTo: parseDmY(validToRaw),
    notes: "",
  };

  const summary = [
    record.visaNumber && `Visa ${record.visaNumber}`,
    record.visaType,
    record.fullName,
    record.validFrom && record.validTo && `${record.validFrom} → ${record.validTo}`,
    record.durationOfStay,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    record,
    clientNameHint: record.fullName,
    summary: summary || "Visa details loaded",
  };
}

export async function parseVisaPdf(buffer: Buffer): Promise<ParsedVisaResult> {
  const text = await extractTextFromPdf(buffer);
  if (!text.trim()) {
    throw new Error("Could not read text from PDF");
  }
  const parsed = parseMofaVisaText(text);
  if (!parsed.record.visaNumber && !parsed.record.passportNumber && !parsed.record.fullName) {
    throw new Error("No visa details found in this PDF");
  }
  return parsed;
}
