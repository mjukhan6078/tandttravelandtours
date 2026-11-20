export type NavChild = {
  label: string;
  href: string;
  desc?: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Umrah Packages", href: "/services/umrah", desc: "Flights, hotels, visa & ziaraat" },
      { label: "Flight Tickets", href: "/services/flights", desc: "Domestic & international" },
      { label: "Visa Assistance", href: "/services/visa", desc: "Hassle-free applications" },
      { label: "Hotel Booking", href: "/services/hotels", desc: "Near Haramain" },
      { label: "Transport", href: "/services/transport", desc: "Airport & intercity transfers" },
      { label: "Ziaraat", href: "/services/ziaraat", desc: "Guided tours of sacred sites" },
    ],
  },
  { label: "Umrah Builder", href: "/umrah-planner" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact-us" },
];

export const footerLinks: NavChild[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Our CEO", href: "/our-ceo" },
  { label: "Services", href: "/services" },
  { label: "FAQ", href: "/faq" },
  { label: "Get a Quote", href: "/get-a-quote" },
  { label: "Contact Us", href: "/contact-us" },
];

export const footerServices: NavChild[] = [
  { label: "Umrah Packages", href: "/services/umrah" },
  { label: "Umrah Builder", href: "/umrah-planner" },
  { label: "Visa Assistance", href: "/services/visa" },
  { label: "Flight Tickets", href: "/services/flights" },
  { label: "Hotel Booking", href: "/services/hotels" },
  { label: "Transport", href: "/services/transport" },
  { label: "Ziaraat", href: "/services/ziaraat" },
];
