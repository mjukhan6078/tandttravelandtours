/**
 * Hotels shown on /services/hotels.
 *
 * ⚠️ SAMPLE DATA — the hotel list is a starting set of well-known properties and
 * every PKR rate is a dummy value. Replace with T&T's contracted hotels and real
 * rates, check the distances, then set HOTELS_ARE_PLACEHOLDER to false (it
 * controls the "sample rates" notice).
 */

export const HOTELS_ARE_PLACEHOLDER = true;

export type HotelCity = "makkah" | "madinah";

export const HOTEL_CITIES: {
  id: HotelCity;
  name: string;
  landmark: string;
}[] = [
  { id: "makkah", name: "Makkah", landmark: "Masjid al-Haram" },
  { id: "madinah", name: "Madinah", landmark: "Masjid an-Nabawi" },
];

export type RoomType = "double" | "triple" | "quad";

export const ROOM_TYPES: { id: RoomType; label: string; guests: number }[] = [
  { id: "double", label: "Double", guests: 2 },
  { id: "triple", label: "Triple", guests: 3 },
  { id: "quad", label: "Quad", guests: 4 },
];

export type Hotel = {
  id: string;
  name: string;
  city: HotelCity;
  area: string;
  stars: 3 | 4 | 5;
  /** Approximate walking distance to the nearest Haram gate, in metres. */
  distanceM: number;
  /** True when guests normally use a shuttle rather than walk. */
  shuttle?: boolean;
  perks: string[];
  /** PKR per room per night. */
  rates: Record<RoomType, number>;
};

export const hotels: Hotel[] = [
  // Makkah
  {
    id: "fairmont-makkah",
    name: "Fairmont Makkah Clock Royal Tower",
    city: "makkah",
    area: "Abraj Al Bait",
    stars: 5,
    distanceM: 100,
    perks: ["Haram view rooms", "Breakfast included", "Direct mall access"],
    rates: { double: 95000, triple: 110000, quad: 125000 },
  },
  {
    id: "swissotel-makkah",
    name: "Swissôtel Makkah",
    city: "makkah",
    area: "Abraj Al Bait",
    stars: 5,
    distanceM: 150,
    perks: ["Breakfast included", "Family rooms", "Prayer hall"],
    rates: { double: 78000, triple: 92000, quad: 105000 },
  },
  {
    id: "pullman-zamzam-makkah",
    name: "Pullman ZamZam Makkah",
    city: "makkah",
    area: "Abraj Al Bait",
    stars: 5,
    distanceM: 150,
    perks: ["Breakfast included", "Kaaba view options"],
    rates: { double: 72000, triple: 85000, quad: 98000 },
  },
  {
    id: "hilton-suites-makkah",
    name: "Hilton Suites Makkah",
    city: "makkah",
    area: "Jabal Omar",
    stars: 5,
    distanceM: 200,
    perks: ["Suites with kitchenette", "Breakfast included"],
    rates: { double: 68000, triple: 80000, quad: 92000 },
  },
  {
    id: "anjum-makkah",
    name: "Anjum Hotel Makkah",
    city: "makkah",
    area: "King Fahd Gate side",
    stars: 5,
    distanceM: 250,
    perks: ["Breakfast included", "Large family rooms"],
    rates: { double: 55000, triple: 65000, quad: 75000 },
  },
  {
    id: "elaf-ajyad",
    name: "Elaf Ajyad Hotel",
    city: "makkah",
    area: "Ajyad",
    stars: 4,
    distanceM: 400,
    perks: ["Walking distance", "Breakfast included"],
    rates: { double: 32000, triple: 38000, quad: 44000 },
  },
  {
    id: "snood-ajyad",
    name: "Snood Ajyad Hotel",
    city: "makkah",
    area: "Ajyad",
    stars: 3,
    distanceM: 700,
    perks: ["Walking distance", "Budget friendly"],
    rates: { double: 18000, triple: 21000, quad: 24000 },
  },
  {
    id: "kiswah-towers",
    name: "Al Kiswah Towers Hotel",
    city: "makkah",
    area: "Ibrahim Al Khalil Road",
    stars: 4,
    distanceM: 2000,
    shuttle: true,
    perks: ["24h shuttle to Haram", "Breakfast included"],
    rates: { double: 22000, triple: 26000, quad: 30000 },
  },
  {
    id: "le-meridien-towers",
    name: "Le Méridien Towers Makkah",
    city: "makkah",
    area: "Kudai",
    stars: 5,
    distanceM: 2500,
    shuttle: true,
    perks: ["Shuttle to Haram", "Breakfast included", "Spacious rooms"],
    rates: { double: 28000, triple: 33000, quad: 38000 },
  },

  // Madinah
  {
    id: "oberoi-madina",
    name: "The Oberoi Madina",
    city: "madinah",
    area: "Central North",
    stars: 5,
    distanceM: 50,
    perks: ["Steps from the Masjid", "Breakfast included"],
    rates: { double: 85000, triple: 98000, quad: 110000 },
  },
  {
    id: "dar-al-taqwa",
    name: "Dar Al Taqwa Hotel",
    city: "madinah",
    area: "Central North",
    stars: 5,
    distanceM: 50,
    perks: ["Masjid view options", "Breakfast included"],
    rates: { double: 70000, triple: 82000, quad: 94000 },
  },
  {
    id: "anwar-al-madinah",
    name: "Anwar Al Madinah Mövenpick",
    city: "madinah",
    area: "Central North",
    stars: 5,
    distanceM: 100,
    perks: ["Breakfast included", "Family rooms"],
    rates: { double: 60000, triple: 70000, quad: 80000 },
  },
  {
    id: "madinah-hilton",
    name: "Madinah Hilton",
    city: "madinah",
    area: "Central East",
    stars: 5,
    distanceM: 100,
    perks: ["Breakfast included", "Shopping centre below"],
    rates: { double: 58000, triple: 68000, quad: 78000 },
  },
  {
    id: "elaf-taiba",
    name: "Elaf Taiba Hotel",
    city: "madinah",
    area: "Central North",
    stars: 4,
    distanceM: 150,
    perks: ["Walking distance", "Breakfast included"],
    rates: { double: 34000, triple: 40000, quad: 46000 },
  },
  {
    id: "shaza-madina",
    name: "Shaza Al Madina",
    city: "madinah",
    area: "Central West",
    stars: 5,
    distanceM: 250,
    perks: ["Breakfast included", "Quiet rooms"],
    rates: { double: 45000, triple: 53000, quad: 61000 },
  },
  {
    id: "pullman-zamzam-madina",
    name: "Pullman Zamzam Madina",
    city: "madinah",
    area: "Central South",
    stars: 5,
    distanceM: 400,
    perks: ["Breakfast included", "Large rooms"],
    rates: { double: 38000, triple: 45000, quad: 52000 },
  },
  {
    id: "saja-madinah",
    name: "Saja Al Madinah",
    city: "madinah",
    area: "King Faisal Road",
    stars: 4,
    distanceM: 1200,
    shuttle: true,
    perks: ["Shuttle to Masjid", "Budget friendly"],
    rates: { double: 20000, triple: 24000, quad: 28000 },
  },
];

/** "100 m" / "1.2 km". */
export function formatDistance(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(/\.0$/, "")} km`;
}

/** Rough walking time at ~80 m per minute. */
export function walkMinutes(m: number): number {
  return Math.max(1, Math.round(m / 80));
}

export function lowestRate(h: Hotel): number {
  return Math.min(...Object.values(h.rates));
}

export function formatPKR(n: number): string {
  return `PKR ${n.toLocaleString("en-PK")}`;
}
