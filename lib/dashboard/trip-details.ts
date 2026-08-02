import { randomBytes } from "crypto";
import type {
  FlightSegment,
  FlightType,
  PaymentStatus,
  PaymentTransaction,
  RoomOccupancy,
  StayCity,
  TicketPassenger,
  TripHotel,
  TripHotelPackage,
  TripPayment,
  TripTicket,
  TripTransport,
  TripVisa,
  VisaRecord,
  VisaStatus,
} from "./types";
import {
  TICKET_CURRENCY_OPTIONS,
  defaultFlightSegment,
  defaultHotelPackage,
  defaultPayment,
  defaultPaymentTransaction,
  defaultTicket,
  defaultVisa,
} from "./types";
import { syncPaymentTotals } from "./payment";
import { formatConnectingStay } from "./connecting";
import {
  normalizeTicketCurrency,
  syncSegmentTicketPrice,
  syncVisaCost,
} from "./ticket-pricing";

function newHotelId() {
  return `hotel_${randomBytes(4).toString("hex")}`;
}

function newTransportId() {
  return `transport_${randomBytes(4).toString("hex")}`;
}

function newPaymentTxnId() {
  return `pay_txn_${randomBytes(4).toString("hex")}`;
}

function newPassengerId() {
  return `pax_${randomBytes(4).toString("hex")}`;
}

function newVisaId() {
  return `visa_${randomBytes(4).toString("hex")}`;
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

function sanitizeVisaRecord(input: unknown): VisaRecord | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Partial<VisaRecord> & Record<string, unknown>;
  const statusOptions: VisaStatus[] = ["not_applied", "pending", "approved", "rejected"];
  const status = statusOptions.includes(row.status as VisaStatus)
    ? (row.status as VisaStatus)
    : "not_applied";
  return {
    id: typeof row.id === "string" && row.id ? row.id : newVisaId(),
    status,
    visaNumber: asString(row.visaNumber),
    applicationNumber: asString(row.applicationNumber),
    visaType: asString(row.visaType),
    fullName: asString(row.fullName),
    passportNumber: asString(row.passportNumber),
    nationality: asString(row.nationality),
    birthDate: asString(row.birthDate),
    placeOfIssue: asString(row.placeOfIssue),
    umrahOperator: asString(row.umrahOperator),
    externalAgent: asString(row.externalAgent),
    borderNumber: asString(row.borderNumber),
    durationOfStay: asString(row.durationOfStay),
    vendor: asString(row.vendor),
    validFrom: asString(row.validFrom),
    validTo: asString(row.validTo),
    notes: asString(row.notes),
  };
}

function legacyVisaToRecord(row: Record<string, unknown>): VisaRecord | null {
  const hasDetail =
    asString(row.visaNumber) ||
    asString(row.fullName) ||
    asString(row.passportNumber) ||
    asString(row.applicationNumber);
  if (!hasDetail && !asString(row.validFrom) && !asString(row.validTo)) {
    return null;
  }
  return sanitizeVisaRecord(row);
}

export function sanitizeVisa(input: unknown): TripVisa {
  const base = defaultVisa();
  if (!input || typeof input !== "object") return base;
  const row = input as Partial<TripVisa> & Record<string, unknown>;

  let entries: VisaRecord[] = [];
  if (Array.isArray(row.entries)) {
    entries = row.entries
      .map((item) => sanitizeVisaRecord(item))
      .filter((item): item is VisaRecord => Boolean(item));
  } else {
    const legacy = legacyVisaToRecord(row);
    if (legacy) entries = [legacy];
  }

  const currency = normalizeTicketCurrency(row.currency);
  const knownCodes = new Set(TICKET_CURRENCY_OPTIONS.map((item) => item.value));
  const rawCurrency = asString(row.currency).toUpperCase();
  const currencyOther =
    currency === "OTHER"
      ? asString(row.currencyOther) ||
        (rawCurrency && !knownCodes.has(rawCurrency as (typeof TICKET_CURRENCY_OPTIONS)[number]["value"])
          ? asString(row.currency)
          : "")
      : "";
  const unitsRaw = Number(row.units);
  const units = Number.isFinite(unitsRaw)
    ? Math.max(1, Math.min(50, Math.floor(unitsRaw)))
    : Math.max(1, entries.length || 1);

  return syncVisaCost({
    ...base,
    entries,
    cost: asString(row.cost),
    currency,
    currencyOther,
    units,
    totalCost: asString(row.totalCost),
    transportIncluded: asBool(row.transportIncluded),
    notes: asString(row.notes),
  });
}

export function sanitizeHotelPackage(input: unknown): TripHotelPackage {
  const base = defaultHotelPackage();
  if (!input || typeof input !== "object") return base;
  const row = input as Partial<TripHotelPackage>;
  return {
    voucherNumber: asString(row.voucherNumber),
    saudiCompany: asString(row.saudiCompany),
    partyName: asString(row.partyName),
    packageCategory: asString(row.packageCategory),
    issueDate: asString(row.issueDate),
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
        hotelNumber: asString(row.hotelNumber),
        reservationNumber: asString(row.reservationNumber),
        rooms: Math.max(1, Math.min(20, Number(row.rooms) || 1)),
        roomType: asString(row.roomType),
        nights: Math.max(1, Math.min(60, Number(row.nights) || 1)),
        checkIn: asString(row.checkIn),
        checkOut: asString(row.checkOut),
        occupancy,
        distance: asString(row.distance),
        contact: asString(row.contact),
        breakfast: asBool(row.breakfast),
        lunch: asBool(row.lunch),
        dinner: asBool(row.dinner),
        cost: asString(row.cost),
        currency: normalizeTicketCurrency(row.currency),
        currencyOther: asString(row.currencyOther),
        notes: asString(row.notes),
      } satisfies TripHotel;
    })
    .filter((item): item is TripHotel => Boolean(item));
}

export function sanitizeTransports(input: unknown): TripTransport[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<TripTransport>;
      return {
        id: typeof row.id === "string" && row.id ? row.id : newTransportId(),
        tnNumber: asString(row.tnNumber),
        service: asString(row.service),
        vehicle: asString(row.vehicle),
        pickupDate: asString(row.pickupDate),
        contactPerson: asString(row.contactPerson),
        bookingRef: asString(row.bookingRef),
        cost: asString(row.cost),
        currency: normalizeTicketCurrency(row.currency),
        currencyOther: asString(row.currencyOther),
        notes: asString(row.notes),
      } satisfies TripTransport;
    })
    .filter((item): item is TripTransport => Boolean(item));
}

export function sanitizePaymentTransactions(input: unknown): PaymentTransaction[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<PaymentTransaction>;
      const source = row.source === "receipt" ? "receipt" : "manual";
      return {
        ...defaultPaymentTransaction(),
        id: typeof row.id === "string" && row.id ? row.id : newPaymentTxnId(),
        amount: asString(row.amount),
        currency: asString(row.currency) || "PKR",
        method: asString(row.method),
        reference: asString(row.reference),
        paidAt: asString(row.paidAt),
        notes: asString(row.notes),
        documentId: asString(row.documentId),
        source,
      } satisfies PaymentTransaction;
    })
    .filter((item): item is PaymentTransaction => Boolean(item));
}

export function sanitizePayment(input: unknown): TripPayment {
  const base = defaultPayment();
  if (!input || typeof input !== "object") return base;
  const row = input as Partial<TripPayment>;
  const statusOptions: PaymentStatus[] = ["unpaid", "partial", "paid"];
  const status = statusOptions.includes(row.status as PaymentStatus)
    ? (row.status as PaymentStatus)
    : "unpaid";
  return syncPaymentTotals({
    totalAmount: asString(row.totalAmount),
    paidAmount: asString(row.paidAmount),
    currency: asString(row.currency) || "PKR",
    method: asString(row.method),
    status,
    notes: asString(row.notes),
    totalManual: asBool(row.totalManual),
    transactions: sanitizePaymentTransactions(row.transactions),
  });
}
