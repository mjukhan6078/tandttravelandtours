import { randomBytes } from "crypto";
import type { StayCity, Trip, TripStay } from "./types";
import {
  STAY_CITY_LABELS,
  defaultHotelPackage,
  defaultItinerary,
  defaultPayment,
  defaultTicket,
  defaultVisa,
} from "./types";
import {
  sanitizeHotelPackage,
  sanitizeHotels,
  sanitizePayment,
  sanitizeTicket,
  sanitizeTransports,
  sanitizeVisa,
} from "./trip-details";

export function newStayId() {
  return `stay_${randomBytes(4).toString("hex")}`;
}

export function sanitizeItinerary(input: unknown): TripStay[] {
  if (!Array.isArray(input) || input.length === 0) {
    return defaultItinerary();
  }

  const stays = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<TripStay>;
      const city = row.city === "madina" ? "madina" : row.city === "makkah" ? "makkah" : null;
      if (!city) return null;
      const nights = Math.max(1, Math.min(60, Number(row.nights) || 1));
      return {
        id: typeof row.id === "string" && row.id ? row.id : newStayId(),
        city: city as StayCity,
        nights,
      } satisfies TripStay;
    })
    .filter((item): item is TripStay => Boolean(item));

  return stays.length > 0 ? stays : defaultItinerary();
}

export function itineraryFromLegacy(makkahNights: number, madinaNights: number): TripStay[] {
  const stays: TripStay[] = [];
  if (makkahNights > 0) {
    stays.push({ id: newStayId(), city: "makkah", nights: makkahNights });
  }
  if (madinaNights > 0) {
    stays.push({ id: newStayId(), city: "madina", nights: madinaNights });
  }
  return stays.length > 0 ? stays : defaultItinerary();
}

export function normalizeTrip(trip: Trip): Trip {
  const itinerary =
    Array.isArray(trip.itinerary) && trip.itinerary.length > 0
      ? sanitizeItinerary(trip.itinerary)
      : itineraryFromLegacy(trip.makkahNights || 0, trip.madinaNights || 0);

  const totals = stayTotals(itinerary);
  return {
    ...trip,
    itinerary,
    makkahNights: totals.makkahNights,
    madinaNights: totals.madinaNights,
    ticket: sanitizeTicket(trip.ticket ?? defaultTicket()),
    visa: sanitizeVisa(trip.visa ?? defaultVisa()),
    hotelPackage: sanitizeHotelPackage(trip.hotelPackage ?? defaultHotelPackage()),
    hotels: sanitizeHotels(trip.hotels ?? []),
    transports: sanitizeTransports(trip.transports ?? []),
    payment: sanitizePayment(trip.payment ?? defaultPayment()),
  };
}

export function stayTotals(itinerary: TripStay[]) {
  return itinerary.reduce(
    (acc, stay) => {
      if (stay.city === "makkah") acc.makkahNights += stay.nights;
      if (stay.city === "madina") acc.madinaNights += stay.nights;
      acc.totalNights += stay.nights;
      return acc;
    },
    { makkahNights: 0, madinaNights: 0, totalNights: 0 }
  );
}

export function itinerarySummary(itinerary: TripStay[]) {
  return itinerary
    .map((stay) => `${STAY_CITY_LABELS[stay.city]} ${stay.nights}n`)
    .join(" → ");
}

/** Build day ranges from start date across ordered stays */
export function buildStaySchedule(itinerary: TripStay[], startDate: string) {
  if (!startDate) {
    return itinerary.map((stay, index) => ({
      ...stay,
      order: index + 1,
      cityLabel: STAY_CITY_LABELS[stay.city],
      fromDate: "",
      toDate: "",
      dayLabel: `${stay.nights} night${stay.nights === 1 ? "" : "s"}`,
    }));
  }

  let cursor = new Date(`${startDate}T12:00:00`);
  return itinerary.map((stay, index) => {
    const from = new Date(cursor);
    const to = new Date(cursor);
    to.setDate(to.getDate() + stay.nights);
    cursor = new Date(to);

    return {
      ...stay,
      order: index + 1,
      cityLabel: STAY_CITY_LABELS[stay.city],
      fromDate: from.toISOString().slice(0, 10),
      toDate: to.toISOString().slice(0, 10),
      dayLabel: `${stay.nights} night${stay.nights === 1 ? "" : "s"}`,
    };
  });
}

export function endDateFromItinerary(startDate: string, itinerary: TripStay[]) {
  if (!startDate) return "";
  const total = stayTotals(itinerary).totalNights;
  const end = new Date(`${startDate}T12:00:00`);
  end.setDate(end.getDate() + total);
  return end.toISOString().slice(0, 10);
}
