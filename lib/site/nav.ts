export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Hajj Packages 2026", href: "/hajj-packages-2026" },
  { label: "Services", href: "/services" },
  { label: "Our CEO", href: "/our-ceo" },
  { label: "Contact Us", href: "/contact-us" },
];

export const footerLinks: NavChild[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "FAQ", href: "/faq" },
  { label: "Get a Quote", href: "/get-a-quote" },
  { label: "Contact Us", href: "/contact-us" },
];
