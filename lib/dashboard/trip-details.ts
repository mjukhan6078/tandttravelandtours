import { randomBytes } from "crypto";
import type {
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
import { defaultPayment, defaultTicket, defaultVisa } from "./types";

function newHotelId() {
  return `hotel_${randomBytes(4).toString("hex")}`;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function asBool(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function sanitizeTicket(input: unknown): TripTicket {
  const base = defaultTicket();
  if (!input || typeof input !== "object") return base;
  const row = input as Partial<TripTicket>;
  const flightType: FlightType = row.flightType === "connecting" ? "connecting" : "direct";
  return {
    airline: asString(row.airline),
    flightNumber: asString(row.flightNumber),
    departureAirport: asString(row.departureAirport),
    arrivalAirport: asString(row.arrivalAirport),
    takeoffAt: asString(row.takeoffAt),
    ticketPrice: asString(row.ticketPrice),
    currency: asString(row.currency) || "PKR",
    luggageAllowance: asString(row.luggageAllowance),
    mealIncluded: asBool(row.mealIncluded),
    flightType,
    connectingStay: flightType === "connecting" ? asString(row.connectingStay) : "",
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
