import {
  formatConnectingDuration,
  formatConnectingStay,
  hoursBetweenTimes,
} from "./connecting";
import { defaultFlightSegment, type FlightSegment, type TripTicket } from "./types";
import { syncSegmentTicketPrice } from "./ticket-pricing";

export type ParsedTicketPassenger = {
  name: string;
  ticketNo: string;
  passport: string;
};

export type ParsedTicketFlightLeg = {
  index: number;
  airlineCode: string;
  airlineName: string;
  flightNo: string;
  date: string;
  baggage: string;
  fromCode: string;
  fromName: string;
  departTime: string;
  toCode: string;
  toName: string;
  arriveTime: string;
};

export type ParsedTicketResult = {
  bookingRef: string;
  passengers: ParsedTicketPassenger[];
  legs: ParsedTicketFlightLeg[];
  ticketUnits: number;
  luggageAllowance: string;
  /** Mapped trip ticket fields ready to merge into UI state */
  ticket: TripTicket;
  clientNameHint: string;
  summary: string;
};

const AIRLINE_CODE_MAP: Record<string, string> = {
  FZ: "flydubai",
  SV: "saudia",
  XY: "flynas",
  F3: "flyadeal",
  EK: "emirates",
  EY: "etihad",
  QR: "qatar",
  PK: "pia",
  PA: "airblue",
  ER: "serene",
  TK: "turkish",
};

function normalizeSpaces(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
}

function toTime(hhmm: string): string {
  const digits = hhmm.replace(/\D/g, "").padStart(4, "0");
  if (digits.length !== 4) return "";
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function parseDateLabel(label: string): string {
  // e.g. Tue, Jul 07, 2026
  const d = new Date(label);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function parsePassengers(text: string): ParsedTicketPassenger[] {
  const passengers: ParsedTicketPassenger[] = [];
  const blocks = text.split(/Passenger:\s*/i).slice(1);
  for (const block of blocks) {
    const ticketMatch = block.match(/Ticket\s*No:\s*([0-9-]+)/i);
    const passportMatch = block.match(/Passport:\s*([A-Z0-9]+)/i);
    // Name sits before Ticket No; may span lines
    const beforeTicket = block.split(/Ticket\s*No:/i)[0] || "";
    const name = beforeTicket
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/(MR|MRS|MS|MISS|MSTR)\.?$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!name && !ticketMatch) continue;
    passengers.push({
      name: name || "Passenger",
      ticketNo: ticketMatch?.[1] || "",
      passport: passportMatch?.[1] || "",
    });
  }
  return passengers;
}

function parseLegs(text: string): ParsedTicketFlightLeg[] {
  const legs: ParsedTicketFlightLeg[] = [];
  const legRegex =
    /(\d+)\s*-\s*([A-Z0-9]{2})\s*-\s*([^-]+?)\s*-\s*Flight\s*No:\s*(\d+)[\s\S]*?Date:\s*([A-Za-z]{3},\s*[A-Za-z]{3}\s*\d{1,2},\s*\d{4})[\s\S]*?Baggage:\s*([^\n]+)[\s\S]*?Depart:\s*([A-Z]{3})\s*-\s*([^\n]*?)\s+at\s+(\d{3,4})[\s\S]*?Arrives:\s*([A-Z]{3})\s*-\s*([^\n]*?)\s+at\s+(\d{3,4})/gi;

  let match: RegExpExecArray | null;
  while ((match = legRegex.exec(text))) {
    legs.push({
      index: Number(match[1]),
      airlineCode: match[2].toUpperCase(),
      airlineName: match[3].trim(),
      flightNo: match[4],
      date: match[5].trim(),
      baggage: match[6].trim(),
      fromCode: match[7].toUpperCase(),
      fromName: match[8].trim(),
      departTime: toTime(match[9]),
      toCode: match[10].toUpperCase(),
      toName: match[11].trim(),
      arriveTime: toTime(match[12]),
    });
  }

  // Dedupe identical legs across passenger copies
  const seen = new Set<string>();
  return legs.filter((leg) => {
    const key = `${leg.index}|${leg.airlineCode}|${leg.flightNo}|${leg.date}|${leg.fromCode}|${leg.toCode}|${leg.departTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapAirline(code: string, name: string): string {
  if (AIRLINE_CODE_MAP[code]) return AIRLINE_CODE_MAP[code];
  const lower = name.toLowerCase();
  if (lower.includes("flydubai")) return "flydubai";
  if (lower.includes("saudia") || lower.includes("saudi")) return "saudia";
  if (lower.includes("emirates")) return "emirates";
  if (lower.includes("etihad")) return "etihad";
  if (lower.includes("qatar")) return "qatar";
  if (lower.includes("turkish")) return "turkish";
  if (lower.includes("pia") || lower.includes("pakistan")) return "pia";
  if (lower.includes("flynas")) return "flynas";
  if (lower.includes("flyadeal")) return "flyadeal";
  return "other";
}

function baggageLabel(raw: string): string {
  const text = raw.trim().toUpperCase();
  const kg = text.match(/(\d+)\s*K/);
  if (kg) return `${kg[1]}kg`;
  return raw.trim();
}

/** Group sequential same-day (or connected) legs into outbound / return segments */
function buildSegmentFromLegs(legs: ParsedTicketFlightLeg[]): FlightSegment {
  const base = defaultFlightSegment();
  if (legs.length === 0) return base;

  const first = legs[0];
  const last = legs[legs.length - 1];
  const airline = mapAirline(first.airlineCode, first.airlineName);
  const flightNumber = `${first.airlineCode} ${first.flightNo}`;
  const luggageAllowance = baggageLabel(first.baggage);

  if (legs.length === 1) {
    return syncSegmentTicketPrice({
      ...base,
      airline,
      flightNumber,
      departureAirport: first.fromCode,
      departureTime: first.departTime,
      arrivalAirport: first.toCode,
      arrivalTime: first.arriveTime,
      flightType: "direct",
      luggageAllowance,
      ticketUnits: 1,
    });
  }

  // Use first connection airport as via
  const via = legs[0].toCode;
  const connectingArrivalTime = first.arriveTime;
  const connectingDepartureTime = legs[1].departTime;
  const hours = hoursBetweenTimes(connectingArrivalTime, connectingDepartureTime);
  const connectingDuration = formatConnectingDuration(hours || 1);

  return syncSegmentTicketPrice({
    ...base,
    airline,
    flightNumber,
    departureAirport: first.fromCode,
    departureTime: first.departTime,
    arrivalAirport: last.toCode,
    arrivalTime: last.arriveTime,
    flightType: "connecting",
    connectingAirport: via,
    connectingArrivalTime,
    connectingDepartureTime,
    connectingDuration,
    connectingStay: formatConnectingStay(via, connectingDuration),
    luggageAllowance,
    ticketUnits: 1,
  });
}

function splitOutboundReturn(legs: ParsedTicketFlightLeg[]): {
  outbound: ParsedTicketFlightLeg[];
  inbound: ParsedTicketFlightLeg[];
} {
  if (legs.length === 0) return { outbound: [], inbound: [] };
  if (legs.length === 1) return { outbound: legs, inbound: [] };

  // Prefer split by date change
  const firstDate = parseDateLabel(legs[0].date);
  const dateSplit = legs.findIndex((leg, i) => i > 0 && parseDateLabel(leg.date) !== firstDate);
  if (dateSplit > 0) {
    return { outbound: legs.slice(0, dateSplit), inbound: legs.slice(dateSplit) };
  }

  // Fallback: half / detect return when destination becomes origin country hub
  const mid = Math.ceil(legs.length / 2);
  return { outbound: legs.slice(0, mid), inbound: legs.slice(mid) };
}

export function parseGalileoTicketText(rawText: string, fileName = ""): ParsedTicketResult {
  const text = normalizeSpaces(rawText);
  const bookingRef =
    text.match(/Galileo\s*Booking\s*Ref:\s*([A-Z0-9]+)/i)?.[1] ||
    text.match(/Booking\s*Ref:\s*([A-Z0-9]+)/i)?.[1] ||
    "";

  const passengers = parsePassengers(text);
  const legs = parseLegs(text);
  const { outbound, inbound } = splitOutboundReturn(legs);

  const unitsFromName = fileName.match(/x\s*(\d+)\s*tkt/i)?.[1];
  const ticketUnits = Math.max(
    1,
    Number(unitsFromName) || passengers.length || 1
  );

  let departure = buildSegmentFromLegs(outbound);
  let arrival = buildSegmentFromLegs(inbound);
  departure = syncSegmentTicketPrice({ ...departure, ticketUnits });
  arrival = syncSegmentTicketPrice({
    ...arrival,
    ticketUnits: arrival.departureAirport ? ticketUnits : 0,
  });

  const clientNameHint =
    passengers[0]?.name
      ?.replace(/\s+(MR|MRS|MS|MISS|MSTR)\.?$/i, "")
      .replace(/\s+/g, " ")
      .trim() || "";

  const ticket: TripTicket = {
    departure,
    arrival,
    currency: departure.currency === "OTHER" ? departure.currencyOther || "OTHER" : departure.currency,
    notes: [
      bookingRef ? `PNR: ${bookingRef}` : "",
      passengers.length
        ? `Passengers (${passengers.length}): ${passengers.map((p) => p.name).join("; ")}`
        : "",
      passengers
        .map((p) => (p.ticketNo ? `${p.name}: ${p.ticketNo}` : ""))
        .filter(Boolean)
        .join(" | "),
    ]
      .filter(Boolean)
      .join("\n"),
  };

  const summary = [
    bookingRef && `PNR ${bookingRef}`,
    `${ticketUnits} ticket(s)`,
    departure.departureAirport &&
      `${departure.departureAirport}→${departure.arrivalAirport}${
        departure.flightType === "connecting" ? ` via ${departure.connectingAirport}` : ""
      }`,
    arrival.departureAirport &&
      `${arrival.departureAirport}→${arrival.arrivalAirport}${
        arrival.flightType === "connecting" ? ` via ${arrival.connectingAirport}` : ""
      }`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    bookingRef,
    passengers,
    legs,
    ticketUnits,
    luggageAllowance: departure.luggageAllowance,
    ticket,
    clientNameHint,
    summary,
  };
}

async function extractWithPdftotext(buffer: Buffer): Promise<string> {
  const { writeFile, unlink } = await import("fs/promises");
  const { tmpdir } = await import("os");
  const { join } = await import("path");
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  const tmp = join(
    tmpdir(),
    `tandt-ticket-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`
  );
  await writeFile(tmp, buffer);
  try {
    const { stdout } = await execFileAsync("pdftotext", ["-layout", tmp, "-"], {
      maxBuffer: 12 * 1024 * 1024,
    });
    return String(stdout || "");
  } finally {
    await unlink(tmp).catch(() => undefined);
  }
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { createRequire } = await import("module");
  const { join } = await import("path");
  const require = createRequire(import.meta.url);

  try {
    // Load outside the Next bundler so worker paths resolve from node_modules
    const { PDFParse } = require("pdf-parse") as {
      PDFParse: (new (opts: { data: Buffer }) => {
        getText: () => Promise<{ text?: string }>;
        destroy?: () => Promise<void>;
      }) & { setWorker?: (path: string) => void };
    };

    if (!PDFParse) {
      throw new Error("PDF parser is unavailable");
    }

    const workerPath = join(
      process.cwd(),
      "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"
    );
    PDFParse.setWorker?.(workerPath);

    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      if (result?.text?.trim()) return result.text;
    } finally {
      await parser.destroy?.().catch(() => undefined);
    }
  } catch {
    // fall through to pdftotext
  }

  // Fallback when pdf.js worker is unavailable in the runtime
  const fromPoppler = await extractWithPdftotext(buffer);
  if (fromPoppler.trim()) return fromPoppler;
  throw new Error("Could not read text from PDF");
}

export async function parseTicketPdf(
  buffer: Buffer,
  fileName = ""
): Promise<ParsedTicketResult> {
  const text = await extractTextFromPdf(buffer);
  if (!text.trim()) {
    throw new Error("Could not read text from PDF");
  }
  const parsed = parseGalileoTicketText(text, fileName);
  if (parsed.legs.length === 0) {
    throw new Error("No flight segments found in this ticket PDF");
  }
  return parsed;
}
