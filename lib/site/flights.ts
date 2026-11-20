/**
 * Airports, popular routes and airlines shown on /services/flights.
 *
 * There is no live booking engine: the search form sends a fare request to the
 * T&T team. ⚠️ The "from" fares on popular routes are dummy values; replace them
 * or set FLIGHTS_ARE_PLACEHOLDER to false once real fares are in.
 */

export const FLIGHTS_ARE_PLACEHOLDER = false;

export type Airport = { code: string; city: string; region: string };

export const airports: Airport[] = [
  { code: "KHI", city: "Karachi", region: "Pakistan" },
  { code: "LHE", city: "Lahore", region: "Pakistan" },
  { code: "ISB", city: "Islamabad", region: "Pakistan" },
  { code: "PEW", city: "Peshawar", region: "Pakistan" },
  { code: "MUX", city: "Multan", region: "Pakistan" },
  { code: "LYP", city: "Faisalabad", region: "Pakistan" },
  { code: "SKT", city: "Sialkot", region: "Pakistan" },
  { code: "UET", city: "Quetta", region: "Pakistan" },
  { code: "JED", city: "Jeddah", region: "Saudi Arabia" },
  { code: "MED", city: "Madinah", region: "Saudi Arabia" },
  { code: "RUH", city: "Riyadh", region: "Saudi Arabia" },
  { code: "DMM", city: "Dammam", region: "Saudi Arabia" },
  { code: "DXB", city: "Dubai", region: "Middle East" },
  { code: "SHJ", city: "Sharjah", region: "Middle East" },
  { code: "AUH", city: "Abu Dhabi", region: "Middle East" },
  { code: "DOH", city: "Doha", region: "Middle East" },
  { code: "IST", city: "Istanbul", region: "Worldwide" },
  { code: "KUL", city: "Kuala Lumpur", region: "Worldwide" },
  { code: "LHR", city: "London", region: "Worldwide" },
];

export const AIRPORT_REGIONS = ["Pakistan", "Saudi Arabia", "Middle East", "Worldwide"];

export const CABINS = ["Economy", "Premium economy", "Business"] as const;
export type Cabin = (typeof CABINS)[number];

export type PopularRoute = {
  from: string;
  to: string;
  tag: string;
  /** Approximate non-stop flight time. */
  duration: string;
  /** PKR, one way, economy. */
  fromFare: number;
};

export const popularRoutes: PopularRoute[] = [
  { from: "KHI", to: "JED", tag: "Umrah", duration: "~4 h 15 min", fromFare: 75000 },
  { from: "KHI", to: "MED", tag: "Umrah", duration: "~4 h 30 min", fromFare: 82000 },
  { from: "LHE", to: "JED", tag: "Umrah", duration: "~5 h", fromFare: 80000 },
  { from: "ISB", to: "JED", tag: "Umrah", duration: "~5 h 15 min", fromFare: 85000 },
  { from: "KHI", to: "DXB", tag: "International", duration: "~2 h", fromFare: 45000 },
  { from: "KHI", to: "ISB", tag: "Domestic", duration: "~2 h", fromFare: 22000 },
];

export const airlines = [
  "PIA",
  "Saudia",
  "flynas",
  "flyadeal",
  "Airblue",
  "Serene Air",
  "Emirates",
  "Qatar Airways",
  "Etihad",
  "Turkish Airlines",
];

export const airportByCode = (code: string) => airports.find((a) => a.code === code)!;
