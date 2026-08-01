export type DocumentType =
  | "visa"
  | "ticket"
  | "hotel"
  | "transport"
  | "payment_receipt"
  | "other";

export type TripStatus = "draft" | "confirmed" | "in_progress" | "completed" | "cancelled";

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
  makkahNights: number;
  madinaNights: number;
  notes: string;
  status: TripStatus;
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
