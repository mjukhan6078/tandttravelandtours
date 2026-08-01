import type { FlightSegment, TripTicket } from "./types";

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

export function ticketGrandTotal(ticket: TripTicket): number {
  return segmentLineTotal(ticket.departure) + segmentLineTotal(ticket.arrival);
}

export function syncSegmentTicketPrice(segment: FlightSegment): FlightSegment {
  const units = Math.max(0, Math.min(50, Math.floor(Number(segment.ticketUnits) || 0)));
  const unitPrice = String(segment.unitPrice || "").trim();
  const total = (Number(unitPrice) || 0) * units;
  return {
    ...segment,
    ticketUnits: units || (segmentHasFlightDetails(segment) ? 1 : 0),
    unitPrice,
    ticketPrice: total > 0 ? String(total) : "",
  };
}
