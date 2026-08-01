import type { FlightSegment, TicketCurrency, TripTicket } from "./types";

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
  if (segment.currency === "SAR") return "Riyal";
  if (segment.currency === "OTHER") {
    return segment.currencyOther?.trim() || "Other";
  }
  return "PKR";
}

export function normalizeTicketCurrency(value: unknown, fallback: TicketCurrency = "PKR"): TicketCurrency {
  if (value === "SAR" || value === "OTHER" || value === "PKR") return value;
  const text = String(value || "").trim().toUpperCase();
  if (text === "SAR" || text === "RIYAL" || text === "SR") return "SAR";
  if (text === "OTHER") return "OTHER";
  if (text === "PKR" || text === "RS") return "PKR";
  if (text) return "OTHER";
  return fallback;
}

export function ticketGrandTotal(ticket: TripTicket): number {
  const dep = segmentLineTotal(ticket.departure);
  const arr = segmentLineTotal(ticket.arrival);
  const sameCurrency =
    segmentCurrencyLabel(ticket.departure) === segmentCurrencyLabel(ticket.arrival);
  if (!sameCurrency) return dep + arr; // numeric sum still useful when currencies match amounts only
  return dep + arr;
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
