import type { TripStay } from "./types";
import { defaultItinerary } from "./types";

/** Nights between start (inclusive) and end (exclusive as checkout). */
export function nightsBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, diff);
}

export function endDateFromNights(startDate: string, nights: number): string {
  if (!startDate || nights < 0) return "";
  const end = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(end.getTime())) return "";
  end.setDate(end.getDate() + nights);
  return end.toISOString().slice(0, 10);
}

/**
 * Redistribute stay nights so they sum exactly to targetNights.
 * Extra nights go to the last stay; reductions come from the end first (min 1 night each).
 */
export function fitItineraryToNights(itinerary: TripStay[], targetNights: number): TripStay[] {
  const stays = (itinerary.length > 0 ? itinerary : defaultItinerary()).map((stay) => ({
    ...stay,
  }));
  const minTotal = stays.length;
  const maxTotal = stays.length * 60;
  const target = Math.max(minTotal, Math.min(maxTotal, Math.floor(targetNights) || minTotal));

  const current = stays.reduce((sum, stay) => sum + stay.nights, 0);
  if (current === target) return stays;

  if (target > current) {
    stays[stays.length - 1].nights += target - current;
    return stays;
  }

  let excess = current - target;
  for (let i = stays.length - 1; i >= 0 && excess > 0; i -= 1) {
    const canReduce = stays[i].nights - 1;
    const reduce = Math.min(canReduce, excess);
    stays[i].nights -= reduce;
    excess -= reduce;
  }
  return stays;
}

export function itineraryTotalNights(itinerary: TripStay[]): number {
  return itinerary.reduce((sum, stay) => sum + Number(stay.nights || 0), 0);
}
