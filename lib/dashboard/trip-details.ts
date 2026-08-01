import { randomBytes } from "crypto";
import type {
  FlightSegment,
  FlightType,
  PaymentStatus,
  RoomOccupancy,
  StayCity,
  TicketPassenger,
  TripHotel,
  TripPayment,
  TripTicket,
  TripVisa,
  VisaStatus,
} from "./types";
import {
  TICKET_CURRENCY_OPTIONS,
  defaultFlightSegment,
  defaultPayment,
  defaultTicket,
  defaultVisa,
} from "./types";
import { formatConnectingStay } from "./connecting";
import { normalizeTicketCurrency, syncSegmentTicketPrice } from "./ticket-pricing";

function newHotelId() {
  return `hotel_${randomBytes(4).toString("hex")}`;
}

function newPassengerId() {
  return `pax_${randomBytes(4).toString("hex")}`;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function asBool(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function sanitizeFlightSegment(input: unknown): FlightSegment {
  const base = defaultFlightSegment();
  if (!input || typeof input !== "object") return base;
  const row = input as Partial<FlightSegment>;
  const flightType: FlightType = row.flightType === "connecting" ? "connecting" : "direct";
  const connectingAirport =
    flightType === "connecting" ? asString(row.connectingAirport).toUpperCase() : "";
  const connectingArrivalTime =
    flightType === "connecting"
      ? asString(row.connectingArrivalTime || (row as { connectingTime?: string }).connectingTime)
      : "";
  const connectingDuration =
    flightType === "connecting" ? asString(row.connectingDuration) : "";
  const connectingDepartureTime =
    flightType === "connecting" ? asString(row.connectingDepartureTime) : "";
  const legacyViaTerminal = asString(
    (row as { connectingTerminal?: string }).connectingTerminal
  );
  const connectingArrivalTerminal =
    flightType === "connecting"
      ? asString(row.connectingArrivalTerminal) || legacyViaTerminal
      : "";
  const connectingDepartureTerminal =
    flightType === "connecting"
      ? asString(row.connectingDepartureTerminal) || legacyViaTerminal
      : "";
  const connectingStay =
    flightType === "connecting"
      ? formatConnectingStay(connectingAirport, connectingDuration) ||
        asString(row.connectingStay)
      : "";

  const unitPrice =
    asString(row.unitPrice) ||
    // legacy: old ticketPrice treated as unit price when units missing
    (!row.ticketUnits && asString(row.ticketPrice) ? asString(row.ticketPrice) : "");
  const ticketUnitsRaw = Number(row.ticketUnits);
  const ticketUnits = Number.isFinite(ticketUnitsRaw)
    ? Math.max(0, Math.min(50, Math.floor(ticketUnitsRaw)))
    : unitPrice
      ? 1
      : 0;
  const currency = normalizeTicketCurrency(row.currency);
  const knownCodes = new Set(TICKET_CURRENCY_OPTIONS.map((item) => item.value));
  const rawCurrency = asString(row.currency).toUpperCase();
  const currencyOther =
    currency === "OTHER"
      ? asString(row.currencyOther) ||
        (rawCurrency && !knownCodes.has(rawCurrency as typeof TICKET_CURRENCY_OPTIONS[number]["value"])
          ? asString(row.currency)
          : "")
      : "";

  return syncSegmentTicketPrice({
    airline: asString(row.airline),
    flightNumber: asString(row.flightNumber),
    connectingFlightNumber:
      flightType === "connecting" ? asString(row.connectingFlightNumber) : "",
    flightDate: asString(row.flightDate),
    departureAirport: asString(row.departureAirport).toUpperCase(),
    departureTime: asString(row.departureTime),
    departureTerminal: asString(row.departureTerminal),
    arrivalAirport: asString(row.arrivalAirport).toUpperCase(),
    arrivalTime: asString(row.arrivalTime),
    arrivalTerminal: asString(row.arrivalTerminal),
    flightType,
    connectingAirport,
    connectingArrivalTime,
    connectingDuration,
    connectingDepartureTime,
    connectingArrivalTerminal,
    connectingDepartureTerminal,
    connectingStay,
    bookingClass: asString(row.bookingClass),
    status: asString(row.status),
    unitPrice,
    currency,
    currencyOther,
    ticketUnits,
    ticketPrice: asString(row.ticketPrice),
    luggageAllowance: asString(row.luggageAllowance),
    mealIncluded: asBool(row.mealIncluded),
  });
}

export function sanitizePassengers(input: unknown): TicketPassenger[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<TicketPassenger>;
      return {
        id: typeof row.id === "string" && row.id ? row.id : newPassengerId(),
        name: asString(row.name),
        ticketNo: asString(row.ticketNo),
        passport: asString(row.passport),
        passportExpiry: asString(row.passportExpiry),
        nationality: asString(row.nationality),
      } satisfies TicketPassenger;
    })
    .filter((item): item is TicketPassenger => Boolean(item));
}

function legacySegmentFromFlat(row: Record<string, unknown>): FlightSegment {
  return sanitizeFlightSegment({
    airline: row.airline,
    flightNumber: row.flightNumber,
    departureAirport: row.departureAirport,
    arrivalAirport: row.arrivalAirport,
    flightType: row.flightType,
    connectingAirport: row.connectingAirport,
    connectingDuration: row.connectingDuration,
    connectingStay: row.connectingStay,
    ticketPrice: row.ticketPrice,
    luggageAllowance: row.luggageAllowance,
    mealIncluded: row.mealIncluded,
  });
}

export function sanitizeTicket(input: unknown): TripTicket {
  const base = defaultTicket();
  if (!input || typeof input !== "object") return base;
  const row = input as Partial<TripTicket> & Record<string, unknown>;

  const hasSegments = row.departure != null || row.arrival != null;
  let departure = hasSegments
    ? sanitizeFlightSegment(row.departure)
    : legacySegmentFromFlat(row);
  let arrival = hasSegments
    ? sanitizeFlightSegment(row.arrival)
    : defaultFlightSegment();

  // Migrate old single ticketPrice onto departure unit price if segments have no prices
  const legacyPrice = asString(row.ticketPrice);
  if (
    legacyPrice &&
    !departure.unitPrice &&
    !arrival.unitPrice &&
    !departure.ticketPrice &&
    !arrival.ticketPrice
  ) {
    departure = syncSegmentTicketPrice({
      ...departure,
      unitPrice: legacyPrice,
      ticketUnits: departure.ticketUnits || 1,
    });
  }

  departure = syncSegmentTicketPrice(departure);
  arrival = syncSegmentTicketPrice(arrival);

  // Migrate old shared luggage/meal onto both segments when missing
  const legacyLuggage = asString(row.luggageAllowance);
  if (legacyLuggage) {
    if (!departure.luggageAllowance) {
      departure = { ...departure, luggageAllowance: legacyLuggage };
    }
    if (!arrival.luggageAllowance) {
      arrival = { ...arrival, luggageAllowance: legacyLuggage };
    }
  }
  if (row.mealIncluded !== undefined) {
    const legacyMeal = asBool(row.mealIncluded);
    if (!hasSegments) {
      departure = { ...departure, mealIncluded: legacyMeal };
    }
  }

  // Migrate old ticket-level currency onto segments
  const legacyCurrency = asString(row.currency);
  if (legacyCurrency) {
    const normalized = normalizeTicketCurrency(legacyCurrency);
    if (!row.departure || !(row.departure as { currency?: string }).currency) {
      departure = syncSegmentTicketPrice({
        ...departure,
        currency: normalized,
        currencyOther:
          normalized === "OTHER" ? legacyCurrency : departure.currencyOther,
      });
    }
    if (!row.arrival || !(row.arrival as { currency?: string }).currency) {
      arrival = syncSegmentTicketPrice({
        ...arrival,
        currency: normalized,
        currencyOther: normalized === "OTHER" ? legacyCurrency : arrival.currencyOther,
      });
    }
  }

  const passengers = sanitizePassengers(row.passengers);
  if (passengers.length > 0) {
    const units = passengers.length;
    departure = syncSegmentTicketPrice({ ...departure, ticketUnits: units });
    if (arrival.departureAirport || arrival.airline) {
      arrival = syncSegmentTicketPrice({ ...arrival, ticketUnits: units });
    }
  }

  return {
    departure,
    arrival,
    pnr: asString(row.pnr),
    airlinePnr: asString(row.airlinePnr),
    issueDate: asString(row.issueDate),
    issuingAgent: asString(row.issuingAgent),
    iataNumber: asString(row.iataNumber),
    tourCode: asString(row.tourCode),
    formOfPayment: asString(row.formOfPayment),
    passengers,
    currency: departure.currency === "OTHER" ? departure.currencyOther || "OTHER" : departure.currency,
    notes: asString(row.notes),
  };
}

export function sanitizeVisa(input: unknown): TripVisa {
  const base = defaultVisa();
  if (!input || typeof input !== "object") return base;
  const row = input as Partial<TripVisa>;
  const statusOptions: VisaStatus[] = ["not_applied", "pending", "approved", "rejected"];
  const status = statusOptions.includes(row.status as VisaStatus)
    ? (row.status as VisaStatus)
    : "not_applied";
  return {
    status,
    vendor: asString(row.vendor),
    cost: asString(row.cost),
    currency: asString(row.currency) || "PKR",
    transportIncluded: asBool(row.transportIncluded),
    validFrom: asString(row.validFrom),
    validTo: asString(row.validTo),
    notes: asString(row.notes),
  };
}

export function sanitizeHotels(input: unknown): TripHotel[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<TripHotel>;
      const city: StayCity = row.city === "madina" ? "madina" : "makkah";
      const occupancy: RoomOccupancy = row.occupancy === "sharing" ? "sharing" : "separate";
      return {
        id: typeof row.id === "string" && row.id ? row.id : newHotelId(),
        city,
        hotelName: asString(row.hotelName),
        nights: Math.max(1, Math.min(60, Number(row.nights) || 1)),
        checkIn: asString(row.checkIn),
        checkOut: asString(row.checkOut),
        occupancy,
        distance: asString(row.distance),
        breakfast: asBool(row.breakfast),
        lunch: asBool(row.lunch),
        dinner: asBool(row.dinner),
        notes: asString(row.notes),
      } satisfies TripHotel;
    })
    .filter((item): item is TripHotel => Boolean(item));
}

export function sanitizePayment(input: unknown): TripPayment {
  const base = defaultPayment();
  if (!input || typeof input !== "object") return base;
  const row = input as Partial<TripPayment>;
  const statusOptions: PaymentStatus[] = ["unpaid", "partial", "paid"];
  const status = statusOptions.includes(row.status as PaymentStatus)
    ? (row.status as PaymentStatus)
    : "unpaid";
  return {
    totalAmount: asString(row.totalAmount),
    paidAmount: asString(row.paidAmount),
    currency: asString(row.currency) || "PKR",
    method: asString(row.method),
    status,
    notes: asString(row.notes),
  };
}
