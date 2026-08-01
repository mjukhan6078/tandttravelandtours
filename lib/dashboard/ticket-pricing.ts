import {
  TICKET_CURRENCY_OPTIONS,
  type FlightSegment,
  type TicketCurrency,
  type TripTicket,
} from "./types";

const CURRENCY_ALIASES: Record<string, TicketCurrency> = {
  PKR: "PKR",
  RS: "PKR",
  SAR: "SAR",
  RIYAL: "SAR",
  SR: "SAR",
  AED: "AED",
  DIRHAM: "AED",
  QAR: "QAR",
  BHD: "BHD",
  KWD: "KWD",
  OMR: "OMR",
  USD: "USD",
  DOLLAR: "USD",
  EUR: "EUR",
  EURO: "EUR",
  GBP: "GBP",
  POUND: "GBP",
  TRY: "TRY",
  TL: "TRY",
  INR: "INR",
  BDT: "BDT",
  MYR: "MYR",
  SGD: "SGD",
  CAD: "CAD",
  AUD: "AUD",
  OTHER: "OTHER",
};

export function segmentHasFlightDetails(segment: FlightSegment | undefined | null): boolean {
  if (!segment) return false;
  return Boolean(
    segment.airline ||
      segment.flightNumber ||
      segment.departureAirport ||
      segment.arrivalAirport
  );
}

export function segmentLineTotal(segment: FlightSegment | undefined | null): number {
  if (!segment) return 0;
  const unit = Number(segment.unitPrice) || 0;
  const units = Math.max(0, Math.floor(Number(segment.ticketUnits) || 0));
  return unit * units;
}

export function formatMoneyAmount(amount: number): string {
  if (!amount) return "";
  return String(amount);
}

export function segmentCurrencyLabel(segment: FlightSegment | undefined | null): string {
  if (!segment) return "PKR";
  if (segment.currency === "OTHER") {
    return segment.currencyOther?.trim() || "Other";
  }
  const option = TICKET_CURRENCY_OPTIONS.find((item) => item.value === segment.currency);
  return option?.value || "PKR";
}

export function normalizeTicketCurrency(
  value: unknown,
  fallback: TicketCurrency = "PKR"
): TicketCurrency {
  const text = String(value || "").trim().toUpperCase();
  if (!text) return fallback;
  if ((TICKET_CURRENCY_OPTIONS as readonly { value: string }[]).some((item) => item.value === text)) {
    return text as TicketCurrency;
  }
  return CURRENCY_ALIASES[text] || "OTHER";
}

export function ticketGrandTotal(ticket: TripTicket): number {
  return segmentLineTotal(ticket.departure) + segmentLineTotal(ticket.arrival);
}

export function syncSegmentTicketPrice(segment: FlightSegment): FlightSegment {
  const units = Math.max(0, Math.min(50, Math.floor(Number(segment.ticketUnits) || 0)));
  const unitPrice = String(segment.unitPrice || "").trim();
  const total = (Number(unitPrice) || 0) * units;
  const currency = normalizeTicketCurrency(segment.currency);
  return {
    ...segment,
    ticketUnits: units || (segmentHasFlightDetails(segment) ? 1 : 0),
    unitPrice,
    currency,
    currencyOther: currency === "OTHER" ? String(segment.currencyOther || "").trim() : "",
    ticketPrice: total > 0 ? String(total) : "",
  };
}
