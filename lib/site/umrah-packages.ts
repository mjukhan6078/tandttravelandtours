/**
 * Umrah packages shown on /services/umrah, taken from T&T's package flyers in
 * public/packages/.
 *
 * These are the Muharram 1447H (July 2025) offers. When a new season's flyers
 * come in, update the packages and PACKAGE_SEASON below. Leave
 * SHOW_SEASON_NOTICE on while the listed prices are from a past season.
 */

export const PACKAGE_SEASON = "Muharram 1447H";
export const SHOW_SEASON_NOTICE = true;

export type PackageSharing = "quint" | "quad" | "triple" | "double";

export const PACKAGE_SHARING: { id: PackageSharing; label: string; perRoom: number }[] = [
  { id: "quint", label: "Quint", perRoom: 5 },
  { id: "quad", label: "Quad", perRoom: 4 },
  { id: "triple", label: "Triple", perRoom: 3 },
  { id: "double", label: "Double", perRoom: 2 },
];

export type PackageTier = "Economy" | "Standard" | "Comfort" | "Premium";

export type PackageHotel = {
  name: string;
  /** Approximate distance to the Haram, as given on the flyer. */
  distance?: string;
  shuttle?: boolean;
};

export type UmrahPackage = {
  id: string;
  tier: PackageTier;
  days: number;
  airline: string;
  flights?: string[];
  departure?: string;
  makkah: PackageHotel;
  madinah: PackageHotel;
  /** PKR per person. A missing sharing type isn't offered. */
  prices: Partial<Record<PackageSharing, number>>;
  flyer: string;
};

export const PACKAGE_INCLUDES = ["Return flights", "Umrah visa", "Hotels", "Transport", "Ziaraat"];

const AIRSIAL_FLIGHTS = ["PF714 KHI → JED · 10 Jul · 02:10", "PF715 JED → KHI · 29 Jul · 18:30"];

export const umrahPackages: UmrahPackage[] = [
  {
    id: "economy-15",
    tier: "Economy",
    days: 15,
    airline: "Direct airline",
    makkah: { name: "Economy hotel", distance: "1,200 m", shuttle: true },
    madinah: { name: "Economy hotel", distance: "1,000 m", shuttle: true },
    prices: { quint: 179000, quad: 184000, triple: 190000, double: 204000 },
    flyer: "/packages/up5.jpg",
  },
  {
    id: "economy-20",
    tier: "Economy",
    days: 20,
    airline: "Direct airline",
    makkah: { name: "Economy hotel", distance: "1,200 m", shuttle: true },
    madinah: { name: "Economy hotel", distance: "1,000 m", shuttle: true },
    prices: { quint: 185000, quad: 190000, triple: 199500, double: 218000 },
    flyer: "/packages/up5.jpg",
  },
  {
    id: "standard-15",
    tier: "Standard",
    days: 15,
    airline: "Saudia",
    makkah: { name: "Masar Al Aez 2", distance: "700 m" },
    madinah: { name: "Elaf Quba / Fahad Quba / Abbas Silver", distance: "500 m" },
    prices: { quint: 205000, quad: 215000, triple: 230000, double: 250000 },
    flyer: "/packages/up4.jpg",
  },
  {
    id: "standard-20",
    tier: "Standard",
    days: 20,
    airline: "Saudia",
    makkah: { name: "Masar Al Aez 2", distance: "700 m" },
    madinah: { name: "Elaf Quba / Fahad Quba / Abbas Silver", distance: "500 m" },
    prices: { quint: 220000, quad: 230000, triple: 250000, double: 285000 },
    flyer: "/packages/up4.jpg",
  },
  {
    id: "comfort-swiss-20",
    tier: "Comfort",
    days: 20,
    airline: "AirSial direct",
    flights: AIRSIAL_FLIGHTS,
    makkah: { name: "Swiss Al Khalil", distance: "500 m" },
    madinah: { name: "Haya Al Waha / Paradise", distance: "250 m" },
    prices: { quint: 245000, quad: 265000, triple: 295000, double: 360000 },
    flyer: "/packages/up3.jpg",
  },
  {
    id: "comfort-voco-20",
    tier: "Comfort",
    days: 20,
    airline: "AirSial direct",
    flights: AIRSIAL_FLIGHTS,
    makkah: { name: "Voco Makkah", distance: "1,200 m", shuttle: true },
    madinah: { name: "Al Ansar Golden Tulip", distance: "150 m" },
    prices: { quad: 275000, triple: 315000, double: 385000 },
    flyer: "/packages/up2.jpg",
  },
  {
    id: "premium-13",
    tier: "Premium",
    days: 13,
    airline: "Direct airline",
    departure: "1st week of July",
    makkah: { name: "Makkah Tower" },
    madinah: { name: "Anwar Al Madinah Mövenpick" },
    prices: { quad: 399500, triple: 477500, double: 630500 },
    flyer: "/packages/up1.jpg",
  },
];
