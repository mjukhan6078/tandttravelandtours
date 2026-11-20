/**
 * Routes and vehicles shown on /services/transport.
 *
 * ⚠️ SAMPLE RATES — every PKR figure below is a dummy value. Replace with T&T's
 * real per-trip rates, check the vehicle line-up, then set
 * TRANSPORT_IS_PLACEHOLDER to false (it controls the "sample rates" notice).
 */

export const TRANSPORT_IS_PLACEHOLDER = false;

export type VehicleId = "sedan" | "h1" | "gmc" | "hiace" | "coaster" | "bus";

export type TransportVehicle = {
  id: VehicleId;
  name: string;
  model: string;
  seats: number;
  bags: number;
  perks: string[];
};

export const transportVehicles: TransportVehicle[] = [
  {
    id: "sedan",
    name: "Sedan",
    model: "Toyota Camry or similar",
    seats: 4,
    bags: 2,
    perks: ["Private car", "Air-conditioned"],
  },
  {
    id: "h1",
    name: "Family van",
    model: "Hyundai H1 / Staria",
    seats: 7,
    bags: 6,
    perks: ["Room for luggage", "Air-conditioned"],
  },
  {
    id: "gmc",
    name: "GMC",
    model: "GMC Yukon or similar",
    seats: 7,
    bags: 4,
    perks: ["Premium SUV", "Leather seats"],
  },
  {
    id: "hiace",
    name: "Hiace",
    model: "Toyota Hiace",
    seats: 11,
    bags: 10,
    perks: ["Small groups", "Air-conditioned"],
  },
  {
    id: "coaster",
    name: "Coaster",
    model: "Toyota Coaster",
    seats: 20,
    bags: 20,
    perks: ["Mini-bus", "Group luggage hold"],
  },
  {
    id: "bus",
    name: "Coach bus",
    model: "Full-size coach",
    seats: 45,
    bags: 45,
    perks: ["Large groups", "Luggage hold"],
  },
];

export type RouteGroup = "airport" | "intercity" | "ziaraat";

export const ROUTE_GROUPS: { id: RouteGroup; label: string }[] = [
  { id: "airport", label: "Airport transfers" },
  { id: "intercity", label: "Between cities" },
  { id: "ziaraat", label: "Ziaraat tours" },
];

export type TransportRoute = {
  id: string;
  group: RouteGroup;
  from: string;
  to: string;
  /** Approximate road distance. Ziaraat tours describe the loop instead. */
  distanceKm?: number;
  duration: string;
  note: string;
  /** Note for the return direction (airport and between-city routes run both ways). */
  backNote?: string;
  /** PKR per vehicle, per trip. */
  rates: Record<VehicleId, number>;
};

export const transportRoutes: TransportRoute[] = [
  {
    id: "jed-makkah",
    group: "airport",
    from: "Jeddah Airport",
    to: "Makkah hotel",
    distanceKm: 100,
    duration: "~1 h 15 min",
    note: "Meet & greet at arrivals, straight to your Makkah hotel.",
    backNote: "Pick-up from your Makkah hotel, timed for your flight.",
    rates: { sedan: 18000, h1: 25000, gmc: 29000, hiace: 34000, coaster: 54000, bus: 90000 },
  },
  {
    id: "med-airport",
    group: "airport",
    from: "Madinah Airport",
    to: "Madinah hotel",
    distanceKm: 20,
    duration: "~30 min",
    note: "Meet & greet at arrivals, straight to your Madinah hotel.",
    backNote: "Pick-up from your Madinah hotel, timed for your flight.",
    rates: { sedan: 12000, h1: 17000, gmc: 19000, hiace: 23000, coaster: 36000, bus: 60000 },
  },
  {
    id: "jed-madinah",
    group: "airport",
    from: "Jeddah Airport",
    to: "Madinah hotel",
    distanceKm: 420,
    duration: "~4 h 15 min",
    note: "Direct from the airport to Madinah, with a rest stop on the way.",
    backNote: "From your Madinah hotel to Jeddah Airport, with a rest stop on the way.",
    rates: { sedan: 58000, h1: 81000, gmc: 93000, hiace: 110000, coaster: 174000, bus: 290000 },
  },
  {
    id: "makkah-madinah",
    group: "intercity",
    from: "Makkah hotel",
    to: "Madinah hotel",
    distanceKm: 450,
    duration: "~4 h 30 min",
    note: "Hotel to hotel, with a rest stop on the way.",
    backNote: "Hotel to hotel, with a rest stop on the way.",
    rates: { sedan: 55000, h1: 77000, gmc: 88000, hiace: 105000, coaster: 165000, bus: 275000 },
  },
  {
    id: "makkah-ziaraat",
    group: "ziaraat",
    from: "Makkah hotel",
    to: "Makkah ziaraat",
    duration: "~3 hours",
    note: "Jabal al-Noor, Jabal Thawr, Mina, Muzdalifah and Arafat, back to your hotel.",
    rates: { sedan: 15000, h1: 21000, gmc: 24000, hiace: 28500, coaster: 45000, bus: 75000 },
  },
  {
    id: "madinah-ziaraat",
    group: "ziaraat",
    from: "Madinah hotel",
    to: "Madinah ziaraat",
    duration: "~3 hours",
    note: "Masjid Quba, Uhud, Masjid al-Qiblatain and the Seven Mosques, back to your hotel.",
    rates: { sedan: 13000, h1: 18000, gmc: 21000, hiace: 25000, coaster: 39000, bus: 65000 },
  },
];

export const MAX_PASSENGERS = 60;

/**
 * One choice in the transfer picker on /services/transport. Airport and
 * between-city routes run both ways (same rate); ziaraat tours start and end at
 * the hotel.
 */
export type TransferOption = {
  id: string;
  routeId: string;
  group: RouteGroup;
  from: string;
  to: string;
  distanceKm?: number;
  duration: string;
  note: string;
};

export const transferOptions: TransferOption[] = transportRoutes.flatMap((r) => {
  const out: TransferOption = {
    id: r.id,
    routeId: r.id,
    group: r.group,
    from: r.from,
    to: r.to,
    distanceKm: r.distanceKm,
    duration: r.duration,
    note: r.note,
  };
  return r.group === "ziaraat"
    ? [out]
    : [out, { ...out, id: `${r.id}~back`, from: r.to, to: r.from, note: r.backNote ?? r.note }];
});

export const transferById = (id: string) => transferOptions.find((t) => t.id === id)!;

/** Where the traveller is after a transfer: ziaraat tours return to the hotel. */
const endsAt = (t: TransferOption) => (t.group === "ziaraat" ? t.from : t.to);

const NEXT_PREFERENCE: RouteGroup[] = ["intercity", "airport", "ziaraat"];

/** A sensible next transfer: starts where the last one ended, prefers moving on over going back. */
export function suggestNextTransfer(last: TransferOption): TransferOption {
  const here = endsAt(last);
  const reverseOfLast = last.id.endsWith("~back") ? last.routeId : `${last.routeId}~back`;
  const candidates = transferOptions.filter((t) => t.from === here && t.id !== reverseOfLast && t.id !== last.id);
  for (const g of NEXT_PREFERENCE) {
    const hit = candidates.find((t) => t.group === g);
    if (hit) return hit;
  }
  return transferOptions[0];
}

/** Every starting point in the transfer picker, in a stable order. */
export const transferStarts: string[] = [...new Set(transferOptions.map((t) => t.from))];

/** Destinations reachable from `from`. */
export const transferDestinations = (from: string) => transferOptions.filter((t) => t.from === from);

/** The transfer for a From/To pair, or the first one from `from` when that pair doesn't run. */
export function findTransfer(from: string, to: string): TransferOption {
  const options = transferDestinations(from);
  return options.find((t) => t.to === to) ?? options[0];
}
