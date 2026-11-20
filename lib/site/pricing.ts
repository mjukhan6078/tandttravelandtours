/**
 * Umrah builder (/umrah-planner) data and quote calculation.
 *
 * Hotels and their room rates come from lib/site/hotels.ts, vehicles and
 * per-trip transfer / ziaraat rates from lib/site/transport.ts, and the visa
 * fee from lib/site/visa.ts, so the builder always matches the service pages.
 *
 * ⚠️ PLACEHOLDER RATES — the figures here and in those files are dummy values.
 * Replace them with real T&T rates, then set PRICING_IS_PLACEHOLDER to false
 * (it controls the "sample rates" notice).
 */

import { ROOM_TYPES, hotels, type Hotel, type RoomType } from "./hotels";
import { transportRoutes, transportVehicles, type TransportVehicle, type VehicleId } from "./transport";
import { visaTypes } from "./visa";

export const PRICING_IS_PLACEHOLDER = true;

/** Bookable window, relative to today, and stay length limits. */
export const BOOKING = {
  minLeadDays: 7,
  maxAheadDays: 180,
  minNights: 3,
  maxNights: 60,
  maxStops: 4,
  maxTravellers: 50,
};

export type CityId = "makkah" | "madinah";

export const CITY_LABEL: Record<CityId, string> = {
  makkah: "Makkah",
  madinah: "Madinah",
};

export const AIRPORT: Record<CityId, { code: string; name: string }> = {
  makkah: { code: "JED", name: "Jeddah Airport" },
  madinah: { code: "MED", name: "Madinah Airport" },
};

/* ───────────── route ───────────── */

export type RouteId = "mk-md" | "md-mk" | "mk-md-mk" | "md-mk-md" | "custom";

export const ROUTE_PRESETS: { id: Exclude<RouteId, "custom">; label: string; desc: string; cities: CityId[] }[] = [
  { id: "mk-md", label: "Makkah → Madinah", desc: "Standard route", cities: ["makkah", "madinah"] },
  { id: "md-mk", label: "Madinah → Makkah", desc: "Madinah first", cities: ["madinah", "makkah"] },
  {
    id: "mk-md-mk",
    label: "Makkah → Madinah → Makkah",
    desc: "Start and end in Makkah",
    cities: ["makkah", "madinah", "makkah"],
  },
  {
    id: "md-mk-md",
    label: "Madinah → Makkah → Madinah",
    desc: "Start and end in Madinah",
    cities: ["madinah", "makkah", "madinah"],
  },
];

/** Default nights per stop for a city sequence. */
export function defaultNights(cities: CityId[]): number[] {
  if (cities.length === 1) return [7];
  if (cities.length === 2) return cities[0] === "makkah" ? [5, 4] : [4, 5];
  return cities.map((_, i) => (i === 0 || i === cities.length - 1 ? 3 : 4));
}

/* ───────────── hotels & rooms ───────────── */

export type ComfortId = "economy" | "standard" | "premium";

export const COMFORT_LEVELS: { id: ComfortId; name: string; tagline: string }[] = [
  { id: "economy", name: "Economy", tagline: "Lowest-priced stays" },
  { id: "standard", name: "Standard", tagline: "Balanced price and distance" },
  { id: "premium", name: "Premium", tagline: "Closest 5★ to the Haram" },
];

export const hotelsIn = (city: CityId) => hotels.filter((h) => h.city === city);
export const hotelById = (id: string | null) => (id ? hotels.find((h) => h.id === id) : undefined);

/** The hotel a comfort level picks in a city. */
export function pickHotel(city: CityId, comfort: ComfortId): Hotel {
  const list = hotelsIn(city);
  if (comfort === "premium") {
    return [...list].filter((h) => h.stars === 5).sort((a, b) => a.distanceM - b.distanceM)[0] ?? list[0];
  }
  const byPrice = [...list].sort((a, b) => a.rates.quad - b.rates.quad);
  return comfort === "economy" ? byPrice[0] : byPrice[Math.floor(byPrice.length / 2)];
}

export type Rooms = Record<RoomType, number>;

export const bedsIn = (rooms: Rooms) => ROOM_TYPES.reduce((n, r) => n + rooms[r.id] * r.guests, 0);
export const roomCount = (rooms: Rooms) => ROOM_TYPES.reduce((n, r) => n + rooms[r.id], 0);

/** Fill rooms of the preferred type, then one smaller room for any remainder. */
export function suggestRooms(guests: number, pref: RoomType): Rooms {
  const rooms: Rooms = { double: 0, triple: 0, quad: 0 };
  const beds = ROOM_TYPES.find((r) => r.id === pref)!.guests;
  rooms[pref] = Math.floor(guests / beds);
  const rest = guests % beds;
  if (rest) {
    const fit = ROOM_TYPES.find((r) => r.guests >= rest)!;
    rooms[fit.id] += 1;
  }
  return rooms;
}

export const breakfastIncluded = (h: Hotel | undefined) =>
  !!h?.perks.some((p) => p.toLowerCase().includes("breakfast included"));

/** PKR per person (adults + children) per night when breakfast is added. */
export const BREAKFAST_PER_PERSON_NIGHT = 2500;

export type Stop = {
  city: CityId;
  nights: number;
  /** null = transit only, no hotel. */
  hotelId: string | null;
  rooms: Rooms;
  breakfast: boolean;
};

/* ───────────── transport ───────────── */

export const vehicleById = (id: VehicleId) => transportVehicles.find((v) => v.id === id)!;

export const carsNeeded = (v: TransportVehicle, people: number) => Math.max(1, Math.ceil(people / v.seats));

/** Cheapest single vehicle that seats everyone, else the largest. */
export function bestVehicle(people: number): VehicleId {
  const fits = transportVehicles.filter((v) => v.seats >= people);
  return (fits[0] ?? transportVehicles[transportVehicles.length - 1]).id;
}

export type Transfer = { id: string; label: string; routeId: string };

/** Airport arrival, every city change, and airport departure. */
export function transfersFor(stops: Stop[]): Transfer[] {
  if (!stops.length) return [];
  const first = stops[0].city;
  const last = stops[stops.length - 1].city;
  const airportRoute = (c: CityId) => (c === "makkah" ? "jed-makkah" : "med-airport");
  const out: Transfer[] = [
    { id: "arrive", label: `${AIRPORT[first].name} → ${CITY_LABEL[first]} hotel`, routeId: airportRoute(first) },
  ];
  stops.slice(1).forEach((s, i) => {
    const from = stops[i].city;
    out.push({
      id: `move-${i + 1}`,
      label: `${CITY_LABEL[from]} hotel → ${CITY_LABEL[s.city]} hotel`,
      routeId: "makkah-madinah",
    });
  });
  out.push({ id: "depart", label: `${CITY_LABEL[last]} hotel → ${AIRPORT[last].name}`, routeId: airportRoute(last) });
  return out;
}

const routeRate = (routeId: string, v: VehicleId) => transportRoutes.find((r) => r.id === routeId)!.rates[v];

export const ZIARAAT_ROUTE: Record<CityId, string> = {
  makkah: "makkah-ziaraat",
  madinah: "madinah-ziaraat",
};

/* ───────────── other extras ───────────── */

export const NATIONALITIES = ["Pakistan", "United Kingdom", "United States", "Canada", "UAE", "Other"];

/** Umrah visa fee per person, from the visa page. */
export const VISA_FEE = visaTypes.find((v) => v.id === "umrah")!.fee;

export const FLIGHTS = {
  label: "Return flights from Karachi (estimate)",
  adult: 165000,
  child: 140000,
  infant: 35000,
};

/* ───────────── state & quote ───────────── */

export type PlannerState = {
  route: RouteId;
  stops: Stop[];
  startDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  childAges: number[];
  infants: number;
  nationality: string;
  roomPref: RoomType;
  comfort: ComfortId | "custom";
  transportMode: "full" | "selective";
  vehicleId: VehicleId;
  cars: number;
  /** Selective mode: vehicle per transfer id; "" = no vehicle for that leg. */
  legVehicles: Record<string, VehicleId | "">;
  ziaraat: CityId[];
  visa: boolean;
  flights: boolean;
};

export type QuoteLine = { label: string; detail: string; amount: number };

export const seated = (s: Pick<PlannerState, "adults" | "children">) => s.adults + s.children;

export function calculateQuote(state: PlannerState) {
  const lines: QuoteLine[] = [];
  const guests = seated(state);
  const everyone = guests + state.infants;

  state.stops.forEach((stop, i) => {
    const hotel = hotelById(stop.hotelId);
    const where = `${CITY_LABEL[stop.city]} · stop ${i + 1}`;
    if (!hotel) {
      lines.push({ label: where, detail: `Transit only · ${stop.nights} nights`, amount: 0 });
      return;
    }
    const perNight = ROOM_TYPES.reduce((sum, r) => sum + stop.rooms[r.id] * hotel.rates[r.id], 0);
    const rooms = ROOM_TYPES.filter((r) => stop.rooms[r.id])
      .map((r) => `${stop.rooms[r.id]} ${r.label.toLowerCase()}`)
      .join(", ");
    lines.push({
      label: `${hotel.name}`,
      detail: `${where} · ${stop.nights} nights · ${rooms || "no rooms"}`,
      amount: perNight * stop.nights,
    });
    if (stop.breakfast && !breakfastIncluded(hotel)) {
      lines.push({
        label: "Breakfast",
        detail: `${CITY_LABEL[stop.city]} · ${guests} guests × ${stop.nights} nights`,
        amount: BREAKFAST_PER_PERSON_NIGHT * guests * stop.nights,
      });
    }
  });

  const transfers = transfersFor(state.stops);
  if (state.transportMode === "full") {
    const v = vehicleById(state.vehicleId);
    const total = transfers.reduce((sum, t) => sum + routeRate(t.routeId, v.id), 0) * state.cars;
    lines.push({
      label: "Transport",
      detail: `${state.cars} × ${v.name} · ${transfers.length} transfers`,
      amount: total,
    });
  } else {
    transfers.forEach((t) => {
      const id = state.legVehicles[t.id];
      if (!id) return;
      const v = vehicleById(id);
      const cars = carsNeeded(v, guests);
      lines.push({
        label: t.label,
        detail: `${cars} × ${v.name}`,
        amount: routeRate(t.routeId, id) * cars,
      });
    });
  }

  const ziaraatVehicle =
    state.transportMode === "full" ? vehicleById(state.vehicleId) : vehicleById(bestVehicle(guests));
  const ziaraatCars = state.transportMode === "full" ? state.cars : carsNeeded(ziaraatVehicle, guests);
  state.ziaraat.forEach((city) => {
    lines.push({
      label: `${CITY_LABEL[city]} ziaraat`,
      detail: `${ziaraatCars} × ${ziaraatVehicle.name}`,
      amount: routeRate(ZIARAAT_ROUTE[city], ziaraatVehicle.id) * ziaraatCars,
    });
  });

  if (state.visa) {
    lines.push({
      label: "Umrah visa",
      detail: `${everyone} traveller${everyone > 1 ? "s" : ""}`,
      amount: VISA_FEE * everyone,
    });
  }

  if (state.flights) {
    lines.push({
      label: "Return flights",
      detail: `${everyone} passenger${everyone > 1 ? "s" : ""}`,
      amount: state.adults * FLIGHTS.adult + state.children * FLIGHTS.child + state.infants * FLIGHTS.infant,
    });
  }

  const total = Math.round(lines.reduce((s, l) => s + l.amount, 0));
  return { lines, total, perPerson: guests ? Math.round(total / guests) : total };
}

export function formatPKR(amount: number) {
  return `PKR ${Math.round(amount).toLocaleString("en-US")}`;
}
