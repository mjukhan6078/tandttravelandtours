import { randomBytes } from "crypto";
import type {
  DashboardData,
  DocumentType,
  Trip,
  TripDocument,
  TripHotel,
  TripPayment,
  TripStatus,
  TripStay,
  TripTicket,
  TripVisa,
} from "./types";
import { defaultPayment, defaultTicket, defaultVisa } from "./types";
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
import { sanitizeHotels, sanitizePayment, sanitizeTicket, sanitizeVisa } from "./trip-details";

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
  hotels?: TripHotel[];
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
    hotels: sanitizeHotels(input.hotels ?? []),
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
    hotels: patch.hotels !== undefined ? sanitizeHotels(patch.hotels) : current.hotels,
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

  return {
    id: normalized.id,
    clientName: normalized.clientName,
    clientPhone: normalized.clientPhone,
    clientEmail: normalized.clientEmail,
    destination: normalized.destination,
    startDate: normalized.startDate,
    endDate: normalized.endDate || endDateFromItinerary(normalized.startDate, normalized.itinerary),
    itinerary: schedule,
    itinerarySummary: itinerarySummary(normalized.itinerary),
    makkahNights: totals.makkahNights,
    madinaNights: totals.madinaNights,
    totalNights: totals.totalNights,
    notes: normalized.notes,
    status: normalized.status,
    ticket: {
      ...normalized.ticket,
      totalTicketPrice: String(
        (Number(normalized.ticket.departure.ticketPrice) || 0) +
          (Number(normalized.ticket.arrival.ticketPrice) || 0) || ""
      ),
      departure: {
        ...normalized.ticket.departure,
        lineTotal: normalized.ticket.departure.ticketPrice,
      },
      arrival: {
        ...normalized.ticket.arrival,
        lineTotal: normalized.ticket.arrival.ticketPrice,
      },
    },
    visa: {
      ...normalized.visa,
      approved: normalized.visa.status === "approved",
    },
    hotels: normalized.hotels,
    payment: normalized.payment,
    documents: normalized.documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      downloadUrl: `/api/v1/documents/${doc.id}`,
    })),
    apiKey: options?.includeApiKey ? normalized.apiKey : undefined,
    apiKeyCreatedAt: options?.includeApiKey ? normalized.apiKeyCreatedAt : undefined,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  };
}
