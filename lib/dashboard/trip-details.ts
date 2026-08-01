import { randomBytes } from "crypto";
import type {
  FlightSegment,
  FlightType,
  PaymentStatus,
  RoomOccupancy,
  StayCity,
  TripHotel,
  TripPayment,
  TripTicket,
  TripVisa,
  VisaStatus,
} from "./types";
import { defaultFlightSegment, defaultPayment, defaultTicket, defaultVisa } from "./types";
import { formatConnectingStay } from "./connecting";
import { syncSegmentTicketPrice } from "./ticket-pricing";

function newHotelId() {
  return `hotel_${randomBytes(4).toString("hex")}`;
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

  return syncSegmentTicketPrice({
    airline: asString(row.airline),
    flightNumber: asString(row.flightNumber),
    departureAirport: asString(row.departureAirport).toUpperCase(),
    departureTime: asString(row.departureTime),
    arrivalAirport: asString(row.arrivalAirport).toUpperCase(),
    arrivalTime: asString(row.arrivalTime),
    flightType,
    connectingAirport,
    connectingArrivalTime,
    connectingDuration,
    connectingDepartureTime,
    connectingStay,
    unitPrice,
    ticketUnits,
    ticketPrice: asString(row.ticketPrice),
    luggageAllowance: asString(row.luggageAllowance),
    mealIncluded: asBool(row.mealIncluded),
  });
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

  return {
    departure,
    arrival,
    currency: asString(row.currency) || "PKR",
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
