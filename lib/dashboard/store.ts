import { randomBytes } from "crypto";
import type {
  DashboardData,
  DocumentType,
  FlightSegment,
  Trip,
  TripDocument,
  TripHotel,
  TripHotelPackage,
  TripPayment,
  TripStatus,
  TripStay,
  TripTicket,
  TripTransport,
  TripVisa,
} from "./types";
import {
  DOCUMENT_TYPE_LABELS,
  FLIGHT_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  ROOM_OCCUPANCY_LABELS,
  STAY_CITY_LABELS,
  TRIP_STATUS_LABELS,
  VISA_STATUS_LABELS,
  defaultHotelPackage,
  defaultPayment,
  defaultTicket,
  defaultVisa,
} from "./types";
import {
  META_KEY,
  deleteObject,
  deletePrefix,
  getObjectBuffer,
  getObjectText,
  objectKeyForDocument,
  putObject,
} from "./minio";
import {
  buildStaySchedule,
  endDateFromItinerary,
  itinerarySummary,
  normalizeTrip,
  sanitizeItinerary,
  stayTotals,
} from "./itinerary";
import { fitItineraryToNights, nightsBetween } from "./duration";
import {
  sanitizeHotelPackage,
  sanitizeHotels,
  sanitizePayment,
  sanitizeTicket,
  sanitizeTransports,
  sanitizeVisa,
} from "./trip-details";
import {
  balanceDue,
  buildPaymentServiceLines,
  hotelLineTotal,
  servicesTotalInPrimaryCurrency,
  syncTripPaymentFromServices,
  transportLineTotal,
} from "./payment";
import {
  segmentCurrencyLabel,
  segmentHasFlightDetails,
  segmentLineTotal,
  ticketGrandTotal,
  visaCurrencyLabel,
  visaLineTotal,
} from "./ticket-pricing";

function flightPublicSummary(segment: FlightSegment) {
  const route = [
    segment.departureAirport,
    segment.flightType === "connecting" && segment.connectingAirport
      ? `via ${segment.connectingAirport}`
      : "",
    segment.arrivalAirport,
  ]
    .filter(Boolean)
    .join(" → ");

  return {
    ...segment,
    flightTypeLabel: FLIGHT_TYPE_LABELS[segment.flightType] || segment.flightType,
    route,
    hasDetails: segmentHasFlightDetails(segment),
    lineTotal: segment.ticketPrice || String(segmentLineTotal(segment) || ""),
    currencyLabel: segmentCurrencyLabel(segment),
  };
}

function documentCounts(documents: { type: DocumentType }[]) {
  const counts = Object.fromEntries(
    (Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => [type, 0])
  ) as Record<DocumentType, number>;
  for (const doc of documents) {
    if (doc.type in counts) counts[doc.type] += 1;
  }
  return counts;
}

async function readData(): Promise<DashboardData> {
  const raw = await getObjectText(META_KEY);
  if (!raw) {
    const initial: DashboardData = { trips: [] };
    await writeData(initial);
    return initial;
  }
  const parsed = JSON.parse(raw) as DashboardData;
  parsed.trips = (parsed.trips || []).map((trip) => normalizeTrip(trip as Trip));
  return parsed;
}

async function writeData(data: DashboardData) {
  await putObject(META_KEY, JSON.stringify(data, null, 2), "application/json");
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

export function generateApiKey() {
  return `tandt_${randomBytes(24).toString("hex")}`;
}

export async function listTrips() {
  const data = await readData();
  return data.trips.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getTrip(id: string) {
  const data = await readData();
  const trip = data.trips.find((item) => item.id === id) ?? null;
  return trip ? normalizeTrip(trip) : null;
}

export async function getTripByApiKey(apiKey: string) {
  const data = await readData();
  const trip = data.trips.find((item) => item.apiKey === apiKey) ?? null;
  return trip ? normalizeTrip(trip) : null;
}

export type CreateTripInput = {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  itinerary?: TripStay[];
  makkahNights?: number;
  madinaNights?: number;
  notes?: string;
  status?: TripStatus;
  ticket?: TripTicket;
  visa?: TripVisa;
  hotelPackage?: TripHotelPackage;
  hotels?: TripHotel[];
  transports?: TripTransport[];
  payment?: TripPayment;
};

function applyItineraryFields(input: Partial<CreateTripInput>, startDate: string) {
  let itinerary = sanitizeItinerary(
    input.itinerary ?? [
      ...(Number(input.makkahNights) > 0
        ? [{ id: newId("stay"), city: "makkah" as const, nights: Number(input.makkahNights) }]
        : []),
      ...(Number(input.madinaNights) > 0
        ? [{ id: newId("stay"), city: "madina" as const, nights: Number(input.madinaNights) }]
        : []),
    ]
  );

  const requestedEnd = input.endDate?.trim() || "";
  if (startDate && requestedEnd) {
    const duration = nightsBetween(startDate, requestedEnd);
    if (duration > 0) {
      itinerary = fitItineraryToNights(itinerary, duration);
    }
  }

  const totals = stayTotals(itinerary);
  const computedEnd = endDateFromItinerary(startDate, itinerary);
  return {
    itinerary,
    makkahNights: totals.makkahNights,
    madinaNights: totals.madinaNights,
    endDate: requestedEnd || computedEnd || "",
  };
}

export async function createTrip(input: CreateTripInput) {
  const data = await readData();
  const stamp = nowIso();
  const startDate = input.startDate || "";
  const stay = applyItineraryFields(input, startDate);

  const trip: Trip = {
    id: newId("trip"),
    clientName: input.clientName.trim(),
    clientPhone: input.clientPhone?.trim() || "",
    clientEmail: input.clientEmail?.trim() || "",
    destination: input.destination?.trim() || "Umrah",
    startDate,
    endDate: stay.endDate,
    itinerary: stay.itinerary,
    makkahNights: stay.makkahNights,
    madinaNights: stay.madinaNights,
    notes: input.notes?.trim() || "",
    status: input.status || "draft",
    ticket: sanitizeTicket(input.ticket ?? defaultTicket()),
    visa: sanitizeVisa(input.visa ?? defaultVisa()),
    hotelPackage: sanitizeHotelPackage(input.hotelPackage ?? defaultHotelPackage()),
    hotels: sanitizeHotels(input.hotels ?? []),
    transports: sanitizeTransports(input.transports ?? []),
    payment: sanitizePayment(input.payment ?? defaultPayment()),
    documents: [],
    apiKey: null,
    apiKeyCreatedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  data.trips.push(trip);
  await writeData(data);
  return trip;
}

export async function updateTrip(id: string, patch: Partial<CreateTripInput>) {
  const data = await readData();
  const index = data.trips.findIndex((trip) => trip.id === id);
  if (index < 0) return null;

  const current = normalizeTrip(data.trips[index]);
  const startDate = patch.startDate ?? current.startDate;
  const nextItinerary =
    patch.itinerary !== undefined
      ? applyItineraryFields(patch, startDate)
      : {
          itinerary: current.itinerary,
          makkahNights: current.makkahNights,
          madinaNights: current.madinaNights,
          endDate:
            patch.endDate ??
            endDateFromItinerary(startDate, current.itinerary) ??
            current.endDate,
        };

  data.trips[index] = {
    ...current,
    clientName: patch.clientName?.trim() ?? current.clientName,
    clientPhone: patch.clientPhone?.trim() ?? current.clientPhone,
    clientEmail: patch.clientEmail?.trim() ?? current.clientEmail,
    destination: patch.destination?.trim() ?? current.destination,
    startDate,
    endDate: patch.endDate || nextItinerary.endDate || current.endDate,
    itinerary: nextItinerary.itinerary,
    makkahNights: nextItinerary.makkahNights,
    madinaNights: nextItinerary.madinaNights,
    notes: patch.notes?.trim() ?? current.notes,
    status: patch.status ?? current.status,
    ticket: patch.ticket !== undefined ? sanitizeTicket(patch.ticket) : current.ticket,
    visa: patch.visa !== undefined ? sanitizeVisa(patch.visa) : current.visa,
    hotelPackage:
      patch.hotelPackage !== undefined
        ? sanitizeHotelPackage(patch.hotelPackage)
        : current.hotelPackage,
    hotels: patch.hotels !== undefined ? sanitizeHotels(patch.hotels) : current.hotels,
    transports:
      patch.transports !== undefined
        ? sanitizeTransports(patch.transports)
        : current.transports,
    payment: patch.payment !== undefined ? sanitizePayment(patch.payment) : current.payment,
    updatedAt: nowIso(),
  };
  await writeData(data);
  return data.trips[index];
}

export async function deleteTrip(id: string) {
  const data = await readData();
  const trip = data.trips.find((item) => item.id === id);
  if (!trip) return false;
  data.trips = data.trips.filter((item) => item.id !== id);
  await writeData(data);
  await deletePrefix(`uploads/${id}/`);
  return true;
}

export async function addDocument(
  tripId: string,
  input: {
    type: DocumentType;
    title: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }
) {
  const data = await readData();
  const trip = data.trips.find((item) => item.id === tripId);
  if (!trip) return null;

  const storedName = `${Date.now()}_${randomBytes(4).toString("hex")}_${input.fileName.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  )}`;

  await putObject(
    objectKeyForDocument(tripId, storedName),
    input.buffer,
    input.mimeType || "application/octet-stream"
  );

  const doc: TripDocument = {
    id: newId("doc"),
    type: input.type,
    title: input.title.trim() || input.fileName,
    fileName: input.fileName,
    storedName,
    mimeType: input.mimeType || "application/octet-stream",
    size: input.buffer.length,
    uploadedAt: nowIso(),
  };

  trip.documents.push(doc);
  trip.updatedAt = nowIso();
  await writeData(data);
  return doc;
}

export async function removeDocument(tripId: string, documentId: string) {
  const data = await readData();
  const trip = data.trips.find((item) => item.id === tripId);
  if (!trip) return false;

  const doc = trip.documents.find((item) => item.id === documentId);
  if (!doc) return false;

  trip.documents = trip.documents.filter((item) => item.id !== documentId);
  trip.updatedAt = nowIso();
  await writeData(data);
  await deleteObject(objectKeyForDocument(tripId, doc.storedName));
  return true;
}

export async function createOrRotateApiKey(tripId: string) {
  const data = await readData();
  const trip = data.trips.find((item) => item.id === tripId);
  if (!trip) return null;

  trip.apiKey = generateApiKey();
  trip.apiKeyCreatedAt = nowIso();
  trip.updatedAt = nowIso();
  await writeData(data);
  return normalizeTrip(trip);
}

export async function revokeApiKey(tripId: string) {
  const data = await readData();
  const trip = data.trips.find((item) => item.id === tripId);
  if (!trip) return null;

  trip.apiKey = null;
  trip.apiKeyCreatedAt = null;
  trip.updatedAt = nowIso();
  await writeData(data);
  return normalizeTrip(trip);
}

export async function getDocumentBytes(tripId: string, storedName: string) {
  return getObjectBuffer(objectKeyForDocument(tripId, storedName));
}

export function toPublicTrip(trip: Trip, options?: { includeApiKey?: boolean }) {
  const normalized = normalizeTrip(trip);
  const totals = stayTotals(normalized.itinerary);
  const schedule = buildStaySchedule(normalized.itinerary, normalized.startDate);
  const endDate =
    normalized.endDate || endDateFromItinerary(normalized.startDate, normalized.itinerary);

  const ticketTotal = ticketGrandTotal(normalized.ticket);
  const visaTotal = visaLineTotal(normalized.visa);
  const hotelsTotal = normalized.hotels.reduce((sum, hotel) => sum + hotelLineTotal(hotel), 0);
  const transportsTotal = normalized.transports.reduce(
    (sum, row) => sum + transportLineTotal(row),
    0
  );

  const serviceLines = buildPaymentServiceLines(normalized);
  const serviceTotals = servicesTotalInPrimaryCurrency(serviceLines);
  const payment = syncTripPaymentFromServices(normalized.payment, normalized);
  const due = balanceDue(payment);

  const hotels = normalized.hotels.map((hotel) => ({
    ...hotel,
    cityLabel: STAY_CITY_LABELS[hotel.city],
    occupancyLabel: ROOM_OCCUPANCY_LABELS[hotel.occupancy],
    meals: {
      breakfast: hotel.breakfast,
      lunch: hotel.lunch,
      dinner: hotel.dinner,
      summary: [
        hotel.breakfast ? "Breakfast" : "",
        hotel.lunch ? "Lunch" : "",
        hotel.dinner ? "Dinner" : "",
      ]
        .filter(Boolean)
        .join(", ") || "No meals",
    },
    lineTotal: hotel.cost || String(hotelLineTotal(hotel) || ""),
    currencyLabel:
      hotel.currency === "OTHER" ? hotel.currencyOther || "Other" : hotel.currency || "PKR",
  }));

  const transports = normalized.transports.map((row) => ({
    ...row,
    lineTotal: row.cost || String(transportLineTotal(row) || ""),
    currencyLabel:
      row.currency === "OTHER" ? row.currencyOther || "Other" : row.currency || "PKR",
  }));

  const documents = normalized.documents.map((doc) => ({
    id: doc.id,
    type: doc.type,
    typeLabel: DOCUMENT_TYPE_LABELS[doc.type] || doc.type,
    title: doc.title,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    size: doc.size,
    uploadedAt: doc.uploadedAt,
    downloadUrl: `/api/v1/documents/${doc.id}`,
  }));

  const visaStatus =
    normalized.visa.entries.find((entry) => entry.status === "approved")?.status ||
    normalized.visa.entries[0]?.status ||
    "not_applied";

  return {
    id: normalized.id,
    clientName: normalized.clientName,
    clientPhone: normalized.clientPhone,
    clientEmail: normalized.clientEmail,
    destination: normalized.destination,
    startDate: normalized.startDate,
    endDate,
    itinerary: schedule,
    itinerarySummary: itinerarySummary(normalized.itinerary),
    makkahNights: totals.makkahNights,
    madinaNights: totals.madinaNights,
    totalNights: totals.totalNights,
    notes: normalized.notes,
    status: normalized.status,
    statusLabel: TRIP_STATUS_LABELS[normalized.status] || normalized.status,
    summary: {
      clientName: normalized.clientName,
      destination: normalized.destination,
      dates:
        normalized.startDate && endDate
          ? `${normalized.startDate} → ${endDate}`
          : normalized.startDate || endDate || "",
      itinerary: itinerarySummary(normalized.itinerary),
      passengerCount: normalized.ticket.passengers.length,
      visaCount: normalized.visa.entries.length,
      hotelCount: normalized.hotels.length,
      transportCount: normalized.transports.length,
      paymentStatus: payment.status,
      paymentStatusLabel: PAYMENT_STATUS_LABELS[payment.status],
      totalAmount: payment.totalAmount,
      paidAmount: payment.paidAmount,
      balanceDue: due > 0 ? String(due) : "0",
      currency: payment.currency,
    },
    ticket: {
      ...normalized.ticket,
      passengerCount: normalized.ticket.passengers.length,
      totalTicketPrice: ticketTotal > 0 ? String(ticketTotal) : "",
      departure: flightPublicSummary(normalized.ticket.departure),
      arrival: flightPublicSummary(normalized.ticket.arrival),
      passengers: normalized.ticket.passengers,
    },
    visa: {
      ...normalized.visa,
      entryCount: normalized.visa.entries.length,
      approved: normalized.visa.entries.some((entry) => entry.status === "approved"),
      status: visaStatus,
      statusLabel: VISA_STATUS_LABELS[visaStatus] || visaStatus,
      lineTotal: normalized.visa.totalCost || (visaTotal > 0 ? String(visaTotal) : ""),
      currencyLabel: visaCurrencyLabel(normalized.visa),
      entries: normalized.visa.entries.map((entry) => ({
        ...entry,
        statusLabel: VISA_STATUS_LABELS[entry.status] || entry.status,
      })),
    },
    hotelPackage: normalized.hotelPackage,
    hotels,
    hotelSummary: {
      count: hotels.length,
      totalNights: hotels.reduce((sum, hotel) => sum + (hotel.nights || 0), 0),
      totalCost: hotelsTotal > 0 ? String(hotelsTotal) : "",
    },
    transports,
    transportSummary: {
      count: transports.length,
      totalCost: transportsTotal > 0 ? String(transportsTotal) : "",
    },
    payment: {
      ...payment,
      statusLabel: PAYMENT_STATUS_LABELS[payment.status] || payment.status,
      balanceDue: due > 0 ? String(due) : "0",
      serviceLines,
      serviceTotals: {
        amount: serviceTotals.total > 0 ? String(serviceTotals.total) : "",
        currency: serviceTotals.currency,
        mixedCurrencies: serviceTotals.mixed,
      },
      transactionCount: payment.transactions.length,
      transactions: payment.transactions.map((txn) => ({
        ...txn,
        receiptDownloadUrl: txn.documentId
          ? `/api/v1/documents/${txn.documentId}`
          : "",
      })),
    },
    costs: {
      tickets: ticketTotal > 0 ? String(ticketTotal) : "",
      visas: visaTotal > 0 ? String(visaTotal) : "",
      hotels: hotelsTotal > 0 ? String(hotelsTotal) : "",
      transports: transportsTotal > 0 ? String(transportsTotal) : "",
      currency: serviceTotals.currency,
      packageTotal: payment.totalAmount,
      paid: payment.paidAmount,
      balanceDue: due > 0 ? String(due) : "0",
    },
    documents,
    documentCounts: documentCounts(normalized.documents),
    apiKey: options?.includeApiKey ? normalized.apiKey : undefined,
    apiKeyCreatedAt: options?.includeApiKey ? normalized.apiKeyCreatedAt : undefined,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  };
}
