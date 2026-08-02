import {
  STAY_CITY_LABELS,
  type PaymentStatus,
  type PaymentTransaction,
  type Trip,
  type TripHotel,
  type TripPayment,
  type TripTicket,
  type TripTransport,
  type TripVisa,
} from "./types";
import {
  formatMoneyAmount,
  segmentCurrencyLabel,
  segmentLineTotal,
  ticketGrandTotal,
  visaCurrencyLabel,
  visaLineTotal,
} from "./ticket-pricing";

export type PaymentServiceLine = {
  id: string;
  service: "ticket" | "visa" | "hotel" | "transport" | "other";
  label: string;
  amount: number;
  currency: string;
  detail: string;
};

function moneyCurrencyLabel(
  currency: string | undefined,
  currencyOther?: string
): string {
  if (currency === "OTHER") return currencyOther?.trim() || "Other";
  return currency || "PKR";
}

export function hotelLineTotal(hotel: TripHotel | undefined | null): number {
  if (!hotel) return 0;
  return Number(hotel.cost) || 0;
}

export function transportLineTotal(row: TripTransport | undefined | null): number {
  if (!row) return 0;
  return Number(row.cost) || 0;
}

export function buildPaymentServiceLines(input: {
  ticket?: TripTicket | null;
  visa?: TripVisa | null;
  hotels?: TripHotel[] | null;
  transports?: TripTransport[] | null;
}): PaymentServiceLine[] {
  const lines: PaymentServiceLine[] = [];
  const ticket = input.ticket;
  if (ticket) {
    const dep = segmentLineTotal(ticket.departure);
    const arr = segmentLineTotal(ticket.arrival);
    if (dep > 0) {
      lines.push({
        id: "ticket_departure",
        service: "ticket",
        label: "Departure tickets",
        amount: dep,
        currency: segmentCurrencyLabel(ticket.departure),
        detail: [
          ticket.departure.flightNumber,
          ticket.departure.ticketUnits ? `×${ticket.departure.ticketUnits}` : "",
        ]
          .filter(Boolean)
          .join(" "),
      });
    }
    if (arr > 0) {
      lines.push({
        id: "ticket_return",
        service: "ticket",
        label: "Return tickets",
        amount: arr,
        currency: segmentCurrencyLabel(ticket.arrival),
        detail: [
          ticket.arrival.flightNumber,
          ticket.arrival.ticketUnits ? `×${ticket.arrival.ticketUnits}` : "",
        ]
          .filter(Boolean)
          .join(" "),
      });
    }
    if (dep === 0 && arr === 0 && ticketGrandTotal(ticket) === 0) {
      // no ticket cost lines
    }
  }

  const visa = input.visa;
  const visaTotal = visaLineTotal(visa);
  if (visa && visaTotal > 0) {
    lines.push({
      id: "visa",
      service: "visa",
      label: "Visa",
      amount: visaTotal,
      currency: visaCurrencyLabel(visa),
      detail: [
        visa.units ? `${visa.units} pax` : "",
        visa.entries?.length ? `${visa.entries.length} visa(s)` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  for (const hotel of input.hotels || []) {
    const amount = hotelLineTotal(hotel);
    if (amount <= 0) continue;
    lines.push({
      id: `hotel_${hotel.id}`,
      service: "hotel",
      label: hotel.hotelName || `${STAY_CITY_LABELS[hotel.city]} hotel`,
      amount,
      currency: moneyCurrencyLabel(hotel.currency, hotel.currencyOther),
      detail: [
        STAY_CITY_LABELS[hotel.city],
        hotel.nights ? `${hotel.nights}n` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  for (const row of input.transports || []) {
    const amount = transportLineTotal(row);
    if (amount <= 0) continue;
    lines.push({
      id: `transport_${row.id}`,
      service: "transport",
      label: row.service || "Transport",
      amount,
      currency: moneyCurrencyLabel(row.currency, row.currencyOther),
      detail: [row.vehicle, row.pickupDate].filter(Boolean).join(" · "),
    });
  }

  return lines;
}

/** Sum amounts that share the dominant / primary currency (first non-empty). */
export function servicesTotalInPrimaryCurrency(lines: PaymentServiceLine[]): {
  total: number;
  currency: string;
  mixed: boolean;
} {
  if (lines.length === 0) return { total: 0, currency: "PKR", mixed: false };
  const currency = lines[0].currency || "PKR";
  const mixed = lines.some((line) => (line.currency || "PKR") !== currency);
  const total = lines
    .filter((line) => (line.currency || "PKR") === currency)
    .reduce((sum, line) => sum + line.amount, 0);
  return { total, currency, mixed };
}

export function transactionsPaidTotal(transactions: PaymentTransaction[]): number {
  return (transactions || []).reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);
}

export function paymentStatusFromAmounts(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return "unpaid";
  if (total > 0 && paid + 0.0001 >= total) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

/** Keep paidAmount + status in sync with transactions; optionally refresh total. */
export function syncPaymentTotals(
  payment: TripPayment,
  serviceTotal?: { total: number; currency: string }
): TripPayment {
  const transactions = Array.isArray(payment.transactions) ? payment.transactions : [];
  const paid = transactionsPaidTotal(transactions);
  const totalManual = Boolean(payment.totalManual);
  const nextTotal =
    !totalManual && serviceTotal
      ? serviceTotal.total > 0
        ? formatMoneyAmount(serviceTotal.total)
        : payment.totalAmount
      : payment.totalAmount;
  const totalNum = Number(nextTotal) || 0;
  const lastMethod =
    [...transactions].reverse().find((txn) => txn.method.trim())?.method || payment.method;

  return {
    ...payment,
    transactions,
    totalManual,
    totalAmount: nextTotal || "",
    paidAmount: paid > 0 ? formatMoneyAmount(paid) : "",
    currency:
      (!totalManual && serviceTotal?.currency) ||
      payment.currency ||
      "PKR",
    method: lastMethod,
    status: paymentStatusFromAmounts(totalNum, paid),
  };
}

export function syncTripPaymentFromServices(
  payment: TripPayment,
  services: {
    ticket?: TripTicket | null;
    visa?: TripVisa | null;
    hotels?: TripHotel[] | null;
    transports?: TripTransport[] | null;
  }
): TripPayment {
  const lines = buildPaymentServiceLines(services);
  const { total, currency } = servicesTotalInPrimaryCurrency(lines);
  return syncPaymentTotals(payment, { total, currency });
}

export function balanceDue(payment: TripPayment): number {
  const total = Number(payment.totalAmount) || 0;
  const paid = Number(payment.paidAmount) || 0;
  return Math.max(0, total - paid);
}

export function summarizeTripPayment(trip: Pick<Trip, "ticket" | "visa" | "hotels" | "transports" | "payment">) {
  const lines = buildPaymentServiceLines(trip);
  const payment = syncTripPaymentFromServices(trip.payment, trip);
  return { lines, payment, balance: balanceDue(payment) };
}
