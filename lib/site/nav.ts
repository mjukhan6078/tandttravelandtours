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
      { label: "Umrah Packages", href: "/services#umrah", desc: "Flights, hotels, visa & ziaraat" },
      { label: "Flight Tickets", href: "/services#tickets", desc: "Domestic & international" },
      { label: "Visa Assistance", href: "/services#visa", desc: "Hassle-free applications" },
      { label: "Hotel Booking", href: "/services#hotel", desc: "Near Haramain" },
      { label: "Ziaraat & Transport", href: "/services#ziaraat", desc: "Guided tours & transfers" },
    ],
  },
  { label: "Hajj 2026", href: "/hajj-packages-2026" },
  { label: "Our CEO", href: "/our-ceo" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact-us" },
];

export const footerLinks: NavChild[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "FAQ", href: "/faq" },
  { label: "Get a Quote", href: "/get-a-quote" },
  { label: "Contact Us", href: "/contact-us" },
];

export const footerServices: NavChild[] = [
  { label: "Umrah Packages", href: "/services#umrah" },
  { label: "Hajj Packages 2026", href: "/hajj-packages-2026" },
  { label: "Visa Assistance", href: "/services#visa" },
  { label: "Flight Tickets", href: "/services#tickets" },
  { label: "Hotel Booking", href: "/services#hotel" },
  { label: "Transport", href: "/services#transport" },
];
