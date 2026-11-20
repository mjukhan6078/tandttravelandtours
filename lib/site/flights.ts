/**
 * Airports and airlines shown on /services/flights.
 *
 * There is no live booking engine: the search form sends a fare request to the
 * T&T team.
 */

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
