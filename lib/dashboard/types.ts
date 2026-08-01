export type DocumentType =
  | "visa"
  | "ticket"
  | "hotel"
  | "transport"
  | "payment_receipt"
  | "other";

export type TripStatus = "draft" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type StayCity = "makkah" | "madina";

export type FlightType = "direct" | "connecting";

export type RoomOccupancy = "separate" | "sharing";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export type VisaStatus = "not_applied" | "pending" | "approved" | "rejected";

export interface TripStay {
  id: string;
  city: StayCity;
  nights: number;
}

/** One flight direction (departure outbound or arrival/return). */
export interface FlightSegment {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  /** Local departure time HH:mm */
  departureTime: string;
  arrivalAirport: string;
  /** Local arrival time HH:mm */
  arrivalTime: string;
  flightType: FlightType;
  /** Connecting airport IATA code when flight is connecting */
  connectingAirport: string;
  /** Arrival time at connecting airport HH:mm */
  connectingArrivalTime: string;
  /** Layover duration in hours, e.g. "4h" */
  connectingDuration: string;
  /** Departure time from connecting airport HH:mm (auto from arrival + duration) */
  connectingDepartureTime: string;
  /** Summary: via {airport} · {duration} */
  connectingStay: string;
  /** Price per single ticket for this flight */
  unitPrice: string;
  /** Number of tickets for this same flight */
  ticketUnits: number;
  /** Auto total for this flight: unitPrice × ticketUnits */
  ticketPrice: string;
  luggageAllowance: string;
  mealIncluded: boolean;
}

export interface TripTicket {
  /** Outbound / going flight */
  departure: FlightSegment;
  /** Return / coming-back flight (can differ from departure) */
  arrival: FlightSegment;
  currency: string;
  notes: string;
}

export interface TripVisa {
  status: VisaStatus;
  vendor: string;
  cost: string;
  currency: string;
  transportIncluded: boolean;
  validFrom: string;
  validTo: string;
  notes: string;
}

export interface TripHotel {
  id: string;
  city: StayCity;
  hotelName: string;
  nights: number;
  checkIn: string;
  checkOut: string;
  /** Separate beds vs sharing beds */
  occupancy: RoomOccupancy;
  /** Distance from Haram / landmark */
  distance: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  notes: string;
}

export interface TripPayment {
  totalAmount: string;
  paidAmount: string;
  currency: string;
  method: string;
  status: PaymentStatus;
  notes: string;
}

export interface TripDocument {
  id: string;
  type: DocumentType;
  title: string;
  fileName: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface Trip {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  destination: string;
  startDate: string;
  endDate: string;
  /** Ordered stay plan, e.g. Makkah → Madina → Makkah */
  itinerary: TripStay[];
  /** Aggregates kept for compatibility */
  makkahNights: number;
  madinaNights: number;
  notes: string;
  status: TripStatus;
  ticket: TripTicket;
  visa: TripVisa;
  hotels: TripHotel[];
  payment: TripPayment;
  documents: TripDocument[];
  apiKey: string | null;
  apiKeyCreatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  trips: Trip[];
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  visa: "Visa",
  ticket: "Ticket",
  hotel: "Hotel booking",
  transport: "Transport",
  payment_receipt: "Payment receipt",
  other: "Other",
};

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STAY_CITY_LABELS: Record<StayCity, string> = {
  makkah: "Makkah",
  madina: "Madina",
};

export const FLIGHT_TYPE_LABELS: Record<FlightType, string> = {
  direct: "Direct",
  connecting: "Connecting",
};

export const ROOM_OCCUPANCY_LABELS: Record<RoomOccupancy, string> = {
  separate: "Separate beds",
  sharing: "Sharing beds",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
};

export const VISA_STATUS_LABELS: Record<VisaStatus, string> = {
  not_applied: "Not applied",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function defaultItinerary(): TripStay[] {
  return [
    { id: "stay_default_1", city: "makkah", nights: 5 },
    { id: "stay_default_2", city: "madina", nights: 5 },
  ];
}

export function defaultFlightSegment(): FlightSegment {
  return {
    airline: "",
    flightNumber: "",
    departureAirport: "",
    departureTime: "",
    arrivalAirport: "",
    arrivalTime: "",
    flightType: "direct",
    connectingAirport: "",
    connectingArrivalTime: "",
    connectingDuration: "",
    connectingDepartureTime: "",
    connectingStay: "",
    unitPrice: "",
    ticketUnits: 1,
    ticketPrice: "",
    luggageAllowance: "",
    mealIncluded: false,
  };
}

export function defaultTicket(): TripTicket {
  return {
    departure: defaultFlightSegment(),
    arrival: defaultFlightSegment(),
    currency: "PKR",
    notes: "",
  };
}

export function defaultVisa(): TripVisa {
  return {
    status: "not_applied",
    vendor: "",
    cost: "",
    currency: "PKR",
    transportIncluded: false,
    validFrom: "",
    validTo: "",
    notes: "",
  };
}

export function defaultPayment(): TripPayment {
  return {
    totalAmount: "",
    paidAmount: "",
    currency: "PKR",
    method: "",
    status: "unpaid",
    notes: "",
  };
}

export function defaultHotel(city: StayCity = "makkah"): TripHotel {
  return {
    id: "hotel_default_1",
    city,
    hotelName: "",
    nights: 1,
    checkIn: "",
    checkOut: "",
    occupancy: "separate",
    distance: "",
    breakfast: true,
    lunch: false,
    dinner: false,
    notes: "",
  };
}
