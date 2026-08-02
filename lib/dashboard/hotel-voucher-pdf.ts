import { randomBytes } from "crypto";
import {
  defaultHotel,
  defaultHotelPackage,
  defaultTransport,
  type TripHotel,
  type TripHotelPackage,
  type TripTransport,
} from "./types";
import { extractTextFromPdf } from "./ticket-pdf";

export type ParsedHotelVoucherResult = {
  hotelPackage: TripHotelPackage;
  hotels: TripHotel[];
  transports: TripTransport[];
  clientNameHint: string;
  summary: string;
};

function newId(prefix: string) {
  return `${prefix}_${randomBytes(4).toString("hex")}`;
}

function normalizeSpaces(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
}

/** DD-MM-YYYY or DD/MM/YYYY → YYYY-MM-DD */
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

function sliceBetween(text: string, start: RegExp, end: RegExp): string {
  const startMatch = text.match(start);
  if (!startMatch || startMatch.index === undefined) return "";
  const from = startMatch.index + startMatch[0].length;
  const rest = text.slice(from);
  const endMatch = rest.match(end);
  return endMatch?.index !== undefined ? rest.slice(0, endMatch.index) : rest;
}

function occupancyFromRoomType(roomType: string): TripHotel["occupancy"] {
  return /quint|quad|triple|twin|double|sharing/i.test(roomType) ? "sharing" : "separate";
}

function distanceFromRoomType(roomType: string): string {
  if (/haram\s*view/i.test(roomType)) return "Haram view";
  if (/haram/i.test(roomType)) return "Near Haram";
  return "";
}

function parseCity(raw: string): TripHotel["city"] {
  return /madin/i.test(raw) ? "madina" : "makkah";
}

function parsePackageMeta(text: string): TripHotelPackage {
  const voucherNumber = pick(text, [
    /COMPANY\s*HV[- ]?0*(\d+)/i,
    /HOTEL\s*VOUCHER#?\s*[:\s]*HV[- ]?0*(\d+)/i,
    /\bHV[- ]?0*(\d{2,})\b/i,
  ]);

  const saudiCompany = pick(text, [
    /SAUDI\s*UMRAH\s*COMPANY[^\n]*\n[^\n]*?([A-Z][A-Z0-9 .,&'-]{6,}?)(?:\s+COMPANY|\s+HV)/i,
    /(ETLALAT[^\n]*UMRAH[^\n]*)/i,
    /([A-Z][A-Z0-9 .,&'-]{4,}FOR\s+UMRAH[^\n]*)/i,
  ]).replace(/\s+COMPANY\s*$/i, "").trim();

  const partyName = pick(text, [/PARTY\s*:\s*([A-Z][A-Z0-9 .'-]{2,})/i]);

  const packageCategory = pick(text, [
    /PKG\s*CATEGORY\s*:\s*([^\n]+?)(?:\s+PARTY|\s*$)/i,
    /PKG\s*CATEGORY\s*:\s*([^\n]+)/i,
  ]);

  const issueDate = parseDmY(
    pick(text, [
      /HV\s*ISSUE\s*DATE\s*:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
      /HV-DATE\s*:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    ])
  );

  const checkNote = pick(text, [
    /NOTE\s*:\s*(CHECK-IN[^\n]+)/i,
    /(CHECK-IN\s*TIME\s*:[^\n]+)/i,
  ]);

  return {
    ...defaultHotelPackage(),
    voucherNumber: normalizeVoucherNumber(voucherNumber),
    saudiCompany,
    partyName,
    packageCategory: packageCategory.replace(/\s+/g, " ").trim(),
    issueDate,
    notes: checkNote.replace(/\s+/g, " ").trim(),
  };
}

function normalizeVoucherNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "") || raw.replace(/\D/g, "");
  if (!digits) return "";
  return `HV-${digits}`;
}

function parseHotels(text: string, _packageMeta: TripHotelPackage): TripHotel[] {
  const section = sliceBetween(
    text,
    /A\s*C\s*C\s*O\s*M\s*M\s*O\s*D\s*A\s*T\s*I\s*O\s*N\s*D\s*E\s*T\s*A\s*I\s*L\s*S/i,
    /T\s*R\s*A\s*N\s*S\s*P\s*O\s*R\s*T\s*D\s*E\s*T\s*A\s*I\s*L\s*S|F\s*L\s*I\s*G\s*H\s*T\s*D\s*E\s*T\s*A\s*I\s*L\s*S/i
  );
  // Flatten newlines so wrapped room types stay on one logical row
  const block = (section || text).replace(/\n+/g, " ");
  const hotels: TripHotel[] = [];

  // CITY HN# HOTEL rooms roomType checkIn checkOut nights
  const rowRe =
    /\b(MADINAH|MADINA|MAKKAH)\s+(\d+)\s+([A-Z][A-Z0-9 .'-]{2,}?)\s+(\d+)\s+((?:0?\d\s+)?[A-Z][A-Z0-9 /.-]*?(?:BED\s*ROOM|BEDROOM|ROOM)(?:\s+WITH)?(?:\s+HARAM\s*VIEW)?)\s+(\d{1,2}-\d{1,2}-\d{4})\s+(\d{1,2}-\d{1,2}-\d{4})\s+(\d{1,2})\b/gi;

  let match: RegExpExecArray | null;
  const matches: Array<{
    index: number;
    end: number;
    city: string;
    hotelNumber: string;
    hotelName: string;
    rooms: number;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
  }> = [];

  while ((match = rowRe.exec(block)) !== null) {
    matches.push({
      index: match.index,
      end: match.index + match[0].length,
      city: match[1],
      hotelNumber: match[2],
      hotelName: match[3].replace(/\s+/g, " ").trim(),
      rooms: Math.max(1, Number(match[4]) || 1),
      roomType: match[5].replace(/\s+/g, " ").trim(),
      checkIn: parseDmY(match[6]),
      checkOut: parseDmY(match[7]),
      nights: Math.max(1, Number(match[8]) || 1),
    });
  }

  if (matches.length === 0) {
    const looseRe =
      /\b(MADINAH|MADINA|MAKKAH)\s+(\d+)\s+([A-Z][A-Z0-9 .'-]{2,}?)\s+(\d+)\s+(.{5,120}?)\s+(\d{1,2}-\d{1,2}-\d{4})\s+(\d{1,2}-\d{1,2}-\d{4})\s+(\d{1,2})\b/gi;
    while ((match = looseRe.exec(block)) !== null) {
      const roomType = match[5]
        .replace(/\s+/g, " ")
        .replace(/\bRESERVATION\b.*$/i, "")
        .trim();
      matches.push({
        index: match.index,
        end: match.index + match[0].length,
        city: match[1],
        hotelNumber: match[2],
        hotelName: match[3].replace(/\s+/g, " ").trim(),
        rooms: Math.max(1, Number(match[4]) || 1),
        roomType,
        checkIn: parseDmY(match[6]),
        checkOut: parseDmY(match[7]),
        nights: Math.max(1, Number(match[8]) || 1),
      });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const row = matches[i];
    const after = block.slice(row.end, matches[i + 1]?.index ?? row.end + 280);
    const reservationNumber = pick(after, [/RESERVATION\s*:\s*([A-Z0-9-]+)/i]);
    const contact = pick(after, [/CONTACT\s*:\s*(.+?)(?=\s*(?:MADINAH|MADINA|MAKKAH|NOTE\s*:|RESERVATION\s*:|$))/i])
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*$/, "")
      .trim();

    hotels.push({
      ...defaultHotel(parseCity(row.city)),
      id: newId("hotel"),
      city: parseCity(row.city),
      hotelName: row.hotelName,
      hotelNumber: row.hotelNumber,
      reservationNumber,
      rooms: row.rooms,
      roomType: row.roomType,
      nights: row.nights,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      occupancy: occupancyFromRoomType(row.roomType),
      distance: distanceFromRoomType(row.roomType),
      contact,
      breakfast: true,
      lunch: false,
      dinner: false,
      notes: "",
    });
  }

  return hotels;
}

function parseTransports(text: string): TripTransport[] {
  const section = sliceBetween(
    text,
    /T\s*R\s*A\s*N\s*S\s*P\s*O\s*R\s*T\s*D\s*E\s*T\s*A\s*I\s*L\s*S/i,
    /F\s*L\s*I\s*G\s*H\s*T\s*D\s*E\s*T\s*A\s*I\s*L\s*S|FOR\s*EMERGENCY/i
  );
  const block = section || text;
  const transports: TripTransport[] = [];

  const rowRe =
    /^\s*(\d+)\s+(\d+)\s+([A-Z0-9][A-Z0-9 .\/-]{2,}?)\s+(H\d+|BUS|CAR|VAN)\s+(\d{1,2}-\d{1,2}-\d{4})\s+(.+?)\s*$/gim;

  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(block)) !== null) {
    const contactPerson = match[6].replace(/\s+/g, " ").trim();
    transports.push({
      ...defaultTransport(),
      id: newId("transport"),
      tnNumber: match[2],
      service: match[3].replace(/\s+/g, " ").trim(),
      vehicle: match[4].trim(),
      pickupDate: parseDmY(match[5]),
      contactPerson,
      bookingRef: "",
      notes: "",
    });
  }

  // Fallback without vehicle token constraint
  if (transports.length === 0) {
    const looseRe =
      /^\s*(\d+)\s+(\d+)\s+([A-Z][A-Z0-9 .\/-]{3,}?)\s+([A-Z0-9]+)\s+(\d{1,2}-\d{1,2}-\d{4})\s+(.+)$/gim;
    while ((match = looseRe.exec(block)) !== null) {
      transports.push({
        ...defaultTransport(),
        id: newId("transport"),
        tnNumber: match[2],
        service: match[3].replace(/\s+/g, " ").trim(),
        vehicle: match[4].trim(),
        pickupDate: parseDmY(match[5]),
        contactPerson: match[6].replace(/\s+/g, " ").trim(),
        bookingRef: "",
        notes: "",
      });
    }
  }

  return transports;
}

export function parseHotelVoucherText(rawText: string): ParsedHotelVoucherResult {
  const text = normalizeSpaces(rawText);
  const hotelPackage = parsePackageMeta(text);
  hotelPackage.voucherNumber = normalizeVoucherNumber(hotelPackage.voucherNumber) || hotelPackage.voucherNumber;

  const hotels = parseHotels(text, hotelPackage);
  const transports = parseTransports(text);

  if (!hotels.length && !transports.length && !hotelPackage.voucherNumber) {
    throw new Error("No hotel or transport details found in this PDF");
  }

  const summary = [
    hotelPackage.voucherNumber,
    hotelPackage.partyName,
    hotels.length ? `${hotels.length} hotel${hotels.length === 1 ? "" : "s"}` : "",
    transports.length
      ? `${transports.length} transfer${transports.length === 1 ? "" : "s"}`
      : "",
    hotels
      .map((h) => `${h.city === "madina" ? "Madina" : "Makkah"} ${h.hotelName} ${h.nights}n`)
      .join(" · "),
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    hotelPackage,
    hotels,
    transports,
    clientNameHint: hotelPackage.partyName,
    summary: summary || "Hotel voucher loaded",
  };
}

export async function parseHotelVoucherPdf(buffer: Buffer): Promise<ParsedHotelVoucherResult> {
  const text = await extractTextFromPdf(buffer);
  if (!text.trim()) {
    throw new Error("Could not read text from PDF");
  }
  return parseHotelVoucherText(text);
}
