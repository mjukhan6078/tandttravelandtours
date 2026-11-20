/**
 * All marketing copy for the site. Keep T&T's real content only; components
 * map `icon` keys to lucide icons (see components/site/icons.tsx).
 */

export type IconKey =
  | "kaaba"
  | "moon"
  | "plane"
  | "visa"
  | "hotel"
  | "bus"
  | "landmark"
  | "users"
  | "globe"
  | "mountain"
  | "shield"
  | "headset"
  | "wallet"
  | "sparkles";

export const stats = [
  { value: 10, suffix: "+", label: "Years of experience" },
  { value: 10000, suffix: "+", label: "Happy pilgrims" },
  { value: 24, suffix: "/7", label: "Support on WhatsApp" },
  { value: 5, suffix: "", label: "Core services under one roof" },
];

export const aboutHighlights = [
  {
    title: "10+ Years Experience",
    desc: "Years of expertise in organizing spiritual pilgrimages",
    icon: "shield" as IconKey,
  },
  {
    title: "10,000+ Happy Pilgrims",
    desc: "Trusted by thousands of satisfied customers",
    icon: "users" as IconKey,
  },
  {
    title: "24/7 Support",
    desc: "Round-the-clock assistance for all your needs",
    icon: "headset" as IconKey,
  },
];

export const aboutIntro =
  "Your trusted partner in spiritual journeys. T&T Travel and Tours helps pilgrims plan Umrah and Hajj with care — flights, hotels, visa, ziaraat, and transport.";

export const featureBullets = [
  "Trusted Umrah planning from Karachi",
  "Flight booking with competitive deals",
  "Visa application support",
  "Hotel booking near Haramain",
  "Guided ziaraat in Makkah and Madinah",
  "Airport transfers and city transport",
];

export const heroWords = ["Umrah", "Hajj", "Visa", "Holiday"];

export const heroQuickLinks: { label: string; href: string; icon: IconKey }[] = [
  { label: "Hotel", href: "/services#hotel", icon: "hotel" },
  { label: "Visa", href: "/services#visa", icon: "visa" },
  { label: "Transport", href: "/services#transport", icon: "bus" },
  { label: "Ziaraat", href: "/services#ziaraat", icon: "landmark" },
];

/** Trip types offered in the hero trip planner. */
export const tripTypes = [
  { key: "Umrah", icon: "kaaba" as IconKey },
  { key: "Hajj", icon: "moon" as IconKey },
  { key: "Visa", icon: "visa" as IconKey },
  { key: "Tours", icon: "globe" as IconKey },
] as const;

export const journeys: { title: string; href: string; blurb: string; icon: IconKey }[] = [
  { title: "Umrah packages", href: "/services#umrah", blurb: "Economy to premium", icon: "kaaba" },
  { title: "Hajj", href: "/hajj-packages-2026", blurb: "Packages & guidance", icon: "moon" },
  { title: "Visa assistance", href: "/services#visa", blurb: "Hassle-free process", icon: "visa" },
  { title: "Flight tickets", href: "/services#tickets", blurb: "Competitive fares", icon: "plane" },
  { title: "International", href: "/get-a-quote", blurb: "Tours abroad", icon: "globe" },
  { title: "Domestic tours", href: "/get-a-quote", blurb: "Explore Pakistan", icon: "mountain" },
];

export const tailoredServices = [
  {
    title: "Hajj & Umrah Services",
    text: "End-to-end pilgrimage support including flights, hotels, visa, and ziarat.",
    href: "/get-a-quote",
  },
  {
    title: "Group Travel",
    text: "Special arrangements and discounts for groups of 10 or more pilgrims.",
    href: "/get-a-quote",
  },
  {
    title: "Visa & Tickets",
    text: "Secure flights and hassle-free visa application process.",
    href: "/services",
  },
  {
    title: "Hotels & Transport",
    text: "Comfortable stays and reliable airport and city transfers.",
    href: "/services",
  },
];

export const services: {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
  points: string[];
}[] = [
  {
    id: "umrah",
    title: "Umrah Packages",
    description:
      "Complete Umrah planning — flights, visa, hotels near Haramain, transport and ziaraat in one package.",
    icon: "kaaba",
    points: ["Economy to premium options", "Family & group packages", "Direct airline options"],
  },
  {
    id: "tickets",
    title: "Book Tickets",
    description: "Secure your flights with the best deals available.",
    icon: "plane",
    points: ["Domestic & international", "Group bookings", "Flexible dates"],
  },
  {
    id: "visa",
    title: "Apply Visa",
    description: "Hassle-free visa application process.",
    icon: "visa",
    points: ["Umrah visa", "Document checklist", "Status follow-up"],
  },
  {
    id: "hotel",
    title: "Book Hotel",
    description: "Find the perfect accommodation for your stay.",
    icon: "hotel",
    points: ["Near Haram options", "Quad to double rooms", "Makkah & Madinah"],
  },
  {
    id: "ziaraat",
    title: "Ziaraat",
    description: "Guided ziyarat tours to sacred sites in Makkah and Madina.",
    icon: "landmark",
    points: ["Makkah ziaraat", "Madinah ziaraat", "Guided by experienced staff"],
  },
  {
    id: "transport",
    title: "Transport",
    description: "Airport transfers and comfortable city-to-city transport.",
    icon: "bus",
    points: ["Airport pick & drop", "Makkah ⇄ Madinah", "Shuttle service"],
  },
];

export const whyUs: { title: string; text: string; icon: IconKey }[] = [
  {
    title: "One team, end to end",
    text: "Flights, visa, hotels, transport and ziaraat planned and handled by the same people.",
    icon: "sparkles",
  },
  {
    title: "Licensed & trusted",
    text: "A government-licensed agency (G.L# 5481) serving pilgrims from Karachi for over a decade.",
    icon: "shield",
  },
  {
    title: "Packages for every budget",
    text: "Quint, quad, triple and double sharing options — from economy to premium stays.",
    icon: "wallet",
  },
  {
    title: "Real people, fast replies",
    text: "Talk directly to our team on WhatsApp before, during and after your journey.",
    icon: "headset",
  },
];

export const processSteps = [
  { title: "Tell us your plan", text: "Share dates, travellers and budget on WhatsApp or the form." },
  { title: "Get your package", text: "We send hotel, flight and visa options with clear pricing." },
  { title: "Confirm & submit", text: "Book your package and hand over documents — we handle the rest." },
  { title: "Travel with peace", text: "Transfers, ziaraat and support throughout your journey." },
];

/** Package flyers in public/packages. */
export const packageFlyers = [
  { src: "/packages/up1.jpg", alt: "T&T Umrah package flyer — 13 days, Makkah Tower hotel" },
  { src: "/packages/up2.jpg", alt: "T&T 20 days Umrah package flyer — direct airline" },
  { src: "/packages/up3.jpg", alt: "T&T 20 days Umrah package flyer — quint to double sharing" },
  { src: "/packages/up4.jpg", alt: "T&T Umrah packages flyer — 15 and 20 day options" },
  { src: "/packages/up5.jpg", alt: "T&T Umrah packages flyer — 15 and 20 day shuttle service" },
];

export const testimonials = [
  {
    text: "Amazing experience! The team took care of everything. Highly recommended for anyone planning Umrah.",
    author: "Satisfied Pilgrim",
  },
  {
    text: "Professional service from booking to return. Hotels and transfers were well arranged.",
    author: "Family Group",
  },
  {
    text: "Clear communication and helpful guidance throughout our journey. JazakAllah khair.",
    author: "Umrah Traveler",
  },
  {
    text: "Visa and ticket process was smooth. We felt supported at every step.",
    author: "Returning Customer",
  },
];

export const faqs = [
  {
    q: "What is included in the packages?",
    a: "Our packages include flights, accommodation, breakfast, visa processing, airport transfers, and guided ziarat.",
  },
  {
    q: "How far in advance should I book?",
    a: "We recommend booking at least 2-3 months in advance for the best availability and rates.",
  },
  {
    q: "Do you provide group discounts?",
    a: "Yes, we offer special discounts for groups of 10 or more pilgrims.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfers, credit cards, and various digital payment platforms.",
  },
  {
    q: "Is travel insurance included?",
    a: "Travel insurance is optional but highly recommended. We can assist with arranging it for you.",
  },
];

export const interestOptions = [
  "Umrah",
  "Hajj",
  "Visa",
  "Tickets",
  "Hotels",
  "Tours",
  "Other",
] as const;
