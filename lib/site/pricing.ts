/**
 * Umrah planner rates and quote calculation.
 *
 * ⚠️ PLACEHOLDER RATES — every PKR figure below is a dummy value for layout and
 * testing. Replace them with real T&T rates before going live, then set
 * PRICING_IS_PLACEHOLDER to false (it controls the "sample rates" notice).
 */

export const PRICING_IS_PLACEHOLDER = true;

/** Bookable window, relative to today, and stay length limits. */
export const BOOKING = {
  minLeadDays: 7,
  maxAheadDays: 180,
  minNights: 5,
  maxNights: 30,
  maxTravellers: 50,
};

export type CityId = "makkah" | "madinah";
export type Sharing = "quint" | "quad" | "triple" | "double";

export const CITY_LABEL: Record<CityId, string> = {
  makkah: "Makkah",
  madinah: "Madinah",
};

/** Legs are built from the first city and whether the trip returns there. */
export function buildLegs(startCity: CityId, roundTrip: boolean): CityId[] {
  const other: CityId = startCity === "makkah" ? "madinah" : "makkah";
  return roundTrip ? [startCity, other, startCity] : [startCity, other];
}

export function defaultNights(startCity: CityId, roundTrip: boolean): number[] {
  if (roundTrip) return startCity === "makkah" ? [4, 4, 3] : [3, 5, 3];
  return startCity === "makkah" ? [5, 4] : [4, 5];
}

/** One-click comfort levels; each sets the hotel tier in both cities. */
export const COMFORT_LEVELS: {
  id: string;
  name: string;
  tagline: string;
  includes: string[];
}[] = [
  {
    id: "economy",
    name: "Economy",
    tagline: "Value stays with shuttle to the Haram",
    includes: ["3★ hotels", "Shuttle service", "Shared transport options"],
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "Walking distance, breakfast included",
    includes: ["4★ hotels", "~500 m to Haram", "Breakfast included"],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Steps from the Haram in 5★ comfort",
    includes: ["5★ hotels", "~150 m to Haram", "Haram view options"],
  },
];

export const SHARING_OPTIONS: { id: Sharing; label: string; perRoom: number }[] = [
  { id: "quint", label: "Quint", perRoom: 5 },
  { id: "quad", label: "Quad", perRoom: 4 },
  { id: "triple", label: "Triple", perRoom: 3 },
  { id: "double", label: "Double", perRoom: 2 },
];

export type HotelTier = {
  id: string;
  name: string;
  stars: number;
  distance: string;
  perks: string[];
  /** PKR per adult per night, by room sharing. */
  rates: Record<Sharing, number>;
};

export const HOTEL_TIERS: Record<CityId, HotelTier[]> = {
  makkah: [
    {
      id: "economy",
      name: "Economy",
      stars: 3,
      distance: "~1,000 m from Haram · shuttle",
      perks: ["Shuttle service", "Breakfast optional"],
      rates: { quint: 4000, quad: 4500, triple: 5500, double: 7500 },
    },
    {
      id: "standard",
      name: "Standard",
      stars: 4,
      distance: "~500 m from Haram",
      perks: ["Walking distance", "Breakfast included"],
      rates: { quint: 7000, quad: 8000, triple: 9500, double: 13000 },
    },
    {
      id: "premium",
      name: "Premium",
      stars: 5,
      distance: "~150 m from Haram",
      perks: ["Haram view options", "Breakfast included"],
      rates: { quint: 15000, quad: 17000, triple: 20000, double: 28000 },
    },
  ],
  madinah: [
    {
      id: "economy",
      name: "Economy",
      stars: 3,
      distance: "~800 m from Masjid an-Nabawi",
      perks: ["Shuttle service", "Breakfast optional"],
      rates: { quint: 3500, quad: 4000, triple: 5000, double: 6500 },
    },
    {
      id: "standard",
      name: "Standard",
      stars: 4,
      distance: "~350 m from Masjid an-Nabawi",
      perks: ["Walking distance", "Breakfast included"],
      rates: { quint: 6000, quad: 7000, triple: 8500, double: 11000 },
    },
    {
      id: "premium",
      name: "Premium",
      stars: 5,
      distance: "~100 m from Masjid an-Nabawi",
      perks: ["Markazia area", "Breakfast included"],
      rates: { quint: 12000, quad: 14000, triple: 17000, double: 24000 },
    },
  ],
};

/** Children (2–11) pay this share of the adult hotel rate; infants stay free. */
export const CHILD_HOTEL_FACTOR = 0.5;

export const VISA = { adult: 65000, child: 55000, infant: 25000 };

export type Vehicle = {
  id: string;
  name: string;
  capacity: number;
  desc: string;
  /** PKR for the whole package (airport transfers + intercity), or per person if perPerson. */
  price: number;
  perPerson?: boolean;
};

export const VEHICLES: Vehicle[] = [
  { id: "shuttle", name: "Shared shuttle", capacity: 50, desc: "Shared coach on fixed schedules", price: 18000, perPerson: true },
  { id: "sedan", name: "Private sedan", capacity: 3, desc: "Camry or similar", price: 55000 },
  { id: "gmc", name: "GMC / H1 van", capacity: 7, desc: "Family van with luggage space", price: 85000 },
  { id: "coaster", name: "Coaster", capacity: 18, desc: "Mini-bus for small groups", price: 160000 },
  { id: "bus", name: "Bus", capacity: 45, desc: "Full-size coach for large groups", price: 280000 },
];

export const ADDONS = {
  ziaraat: { label: "Guided ziaraat (Makkah & Madinah)", perPerson: 8000 },
  flights: {
    label: "Return flights from Karachi (estimate)",
    adult: 165000,
    child: 140000,
    infant: 35000,
  },
};

export type PlannerState = {
  startCity: CityId;
  roundTrip: boolean;
  startDate: string; // YYYY-MM-DD
  nights: number[]; // one entry per leg (see buildLegs)
  adults: number;
  children: number;
  infants: number;
  sharing: Sharing;
  hotels: Record<CityId, string>; // tier id per city
  vehicleId: string;
  ziaraat: boolean;
  flights: boolean;
};

export type QuoteLine = { label: string; detail: string; amount: number };

export function nightsByCity(state: PlannerState): Record<CityId, number> {
  const out: Record<CityId, number> = { makkah: 0, madinah: 0 };
  buildLegs(state.startCity, state.roundTrip).forEach((city, i) => {
    out[city] += state.nights[i] ?? 0;
  });
  return out;
}

export function calculateQuote(state: PlannerState) {
  const lines: QuoteLine[] = [];
  const perCity = nightsByCity(state);
  const paying = state.adults + state.children;
  const everyone = paying + state.infants;

  (Object.keys(perCity) as CityId[]).forEach((city) => {
    const n = perCity[city];
    if (!n) return;
    const tier = HOTEL_TIERS[city].find((t) => t.id === state.hotels[city]) ?? HOTEL_TIERS[city][0];
    const rate = tier.rates[state.sharing];
    const amount = n * rate * (state.adults + state.children * CHILD_HOTEL_FACTOR);
    lines.push({
      label: `${CITY_LABEL[city]} hotel`,
      detail: `${tier.name} · ${n} night${n > 1 ? "s" : ""} · ${state.sharing}`,
      amount,
    });
  });

  lines.push({
    label: "Umrah visa",
    detail: [
      `${state.adults} adult${state.adults > 1 ? "s" : ""}`,
      state.children ? `${state.children} child` : "",
      state.infants ? `${state.infants} infant` : "",
    ]
      .filter(Boolean)
      .join(" · "),
    amount:
      state.adults * VISA.adult + state.children * VISA.child + state.infants * VISA.infant,
  });

  const vehicle = VEHICLES.find((v) => v.id === state.vehicleId) ?? VEHICLES[0];
  lines.push({
    label: "Transport",
    detail: `${vehicle.name} · transfers & intercity`,
    amount: vehicle.perPerson ? vehicle.price * paying : vehicle.price,
  });

  if (state.ziaraat) {
    lines.push({
      label: "Ziaraat",
      detail: `${paying} traveller${paying > 1 ? "s" : ""}`,
      amount: ADDONS.ziaraat.perPerson * paying,
    });
  }

  if (state.flights) {
    lines.push({
      label: "Return flights",
      detail: `${everyone} passenger${everyone > 1 ? "s" : ""}`,
      amount:
        state.adults * ADDONS.flights.adult +
        state.children * ADDONS.flights.child +
        state.infants * ADDONS.flights.infant,
    });
  }

  const total = Math.round(lines.reduce((s, l) => s + l.amount, 0));
  return { lines, total, perPerson: paying ? Math.round(total / paying) : total };
}

export function formatPKR(amount: number) {
  return `PKR ${Math.round(amount).toLocaleString("en-US")}`;
}
