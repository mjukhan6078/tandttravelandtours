import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { DashboardData, DocumentType, Trip, TripDocument, TripStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "dashboard.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    const initial: DashboardData = { trips: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readData(): Promise<DashboardData> {
  await ensureStore();
  const raw = await fs.readFile(DB_FILE, "utf8");
  return JSON.parse(raw) as DashboardData;
}

async function writeData(data: DashboardData) {
  await ensureStore();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf8");
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
  return data.trips.find((trip) => trip.id === id) ?? null;
}

export async function getTripByApiKey(apiKey: string) {
  const data = await readData();
  return data.trips.find((trip) => trip.apiKey === apiKey) ?? null;
}

export type CreateTripInput = {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  makkahNights?: number;
  madinaNights?: number;
  notes?: string;
  status?: TripStatus;
};

export async function createTrip(input: CreateTripInput) {
  const data = await readData();
  const stamp = nowIso();
  const trip: Trip = {
    id: newId("trip"),
    clientName: input.clientName.trim(),
    clientPhone: input.clientPhone?.trim() || "",
    clientEmail: input.clientEmail?.trim() || "",
    destination: input.destination?.trim() || "Umrah",
    startDate: input.startDate || "",
    endDate: input.endDate || "",
    makkahNights: Number(input.makkahNights) || 0,
    madinaNights: Number(input.madinaNights) || 0,
    notes: input.notes?.trim() || "",
    status: input.status || "draft",
    documents: [],
    apiKey: null,
    apiKeyCreatedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  data.trips.push(trip);
  await writeData(data);
  await fs.mkdir(path.join(UPLOADS_DIR, trip.id), { recursive: true });
  return trip;
}

export async function updateTrip(id: string, patch: Partial<CreateTripInput>) {
  const data = await readData();
  const index = data.trips.findIndex((trip) => trip.id === id);
  if (index < 0) return null;

  const current = data.trips[index];
  data.trips[index] = {
    ...current,
    clientName: patch.clientName?.trim() ?? current.clientName,
    clientPhone: patch.clientPhone?.trim() ?? current.clientPhone,
    clientEmail: patch.clientEmail?.trim() ?? current.clientEmail,
    destination: patch.destination?.trim() ?? current.destination,
    startDate: patch.startDate ?? current.startDate,
    endDate: patch.endDate ?? current.endDate,
    makkahNights:
      patch.makkahNights !== undefined ? Number(patch.makkahNights) || 0 : current.makkahNights,
    madinaNights:
      patch.madinaNights !== undefined ? Number(patch.madinaNights) || 0 : current.madinaNights,
    notes: patch.notes?.trim() ?? current.notes,
    status: patch.status ?? current.status,
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
  await fs.rm(path.join(UPLOADS_DIR, id), { recursive: true, force: true });
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
  const tripDir = path.join(UPLOADS_DIR, tripId);
  await fs.mkdir(tripDir, { recursive: true });
  await fs.writeFile(path.join(tripDir, storedName), input.buffer);

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
  await fs.rm(path.join(UPLOADS_DIR, tripId, doc.storedName), { force: true });
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
  return trip;
}

export async function revokeApiKey(tripId: string) {
  const data = await readData();
  const trip = data.trips.find((item) => item.id === tripId);
  if (!trip) return null;

  trip.apiKey = null;
  trip.apiKeyCreatedAt = null;
  trip.updatedAt = nowIso();
  await writeData(data);
  return trip;
}

export function getUploadPath(tripId: string, storedName: string) {
  return path.join(UPLOADS_DIR, tripId, storedName);
}

export function toPublicTrip(trip: Trip, options?: { includeApiKey?: boolean }) {
  return {
    id: trip.id,
    clientName: trip.clientName,
    clientPhone: trip.clientPhone,
    clientEmail: trip.clientEmail,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    makkahNights: trip.makkahNights,
    madinaNights: trip.madinaNights,
    totalNights: trip.makkahNights + trip.madinaNights,
    notes: trip.notes,
    status: trip.status,
    documents: trip.documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      downloadUrl: `/api/v1/documents/${doc.id}`,
    })),
    apiKey: options?.includeApiKey ? trip.apiKey : undefined,
    apiKeyCreatedAt: options?.includeApiKey ? trip.apiKeyCreatedAt : undefined,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}
