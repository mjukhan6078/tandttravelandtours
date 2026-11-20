import { Mail, MapPin, Phone } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import {
  ADDRESS,
  EMAIL,
  PHONE_TEL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NAME,
  waLink,
} from "@/lib/site/contact";
import { WhatsAppIcon } from "./icons";

const cards = [
  {
    label: "WhatsApp",
    value: WHATSAPP_DISPLAY,
    note: WHATSAPP_NAME,
    href: waLink("Assalam o Alaikum"),
    external: true,
    icon: <WhatsAppIcon className="size-6" />,
    tone: "bg-[#25D366]/10 text-[#1da851] group-hover:bg-[#25D366] group-hover:text-white",
  },
  {
    label: "Call us",
    value: WHATSAPP_DISPLAY,
    note: "Talk to an expert",
    href: PHONE_TEL,
    icon: <Phone className="size-6" />,
    tone: "bg-cta/10 text-cta group-hover:bg-cta group-hover:text-white",
  },
  {
    label: "Support mail",
    value: EMAIL,
    note: "We reply within a day",
    href: `mailto:${EMAIL}`,
    icon: <Mail className="size-6" />,
    tone: "bg-secondary text-primary group-hover:bg-primary group-hover:text-white",
  },
  {
    label: "Visit our office",
    value: "Main Karimabad, Karachi",
    note: ADDRESS,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Sohni Shopping Mall, Karimabad, Karachi")}`,
    external: true,
    icon: <MapPin className="size-6" />,
    tone: "bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-white",
  },
];

export default function ContactCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <AnimatedSection key={c.label} delay={i * 0.07}>
          <a
            href={c.href}
            {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group flex h-full flex-col rounded-3xl border border-border bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl hover:shadow-primary/10"
          >
            <span className={`grid size-12 place-items-center rounded-2xl transition ${c.tone}`}>{c.icon}</span>
            <span className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {c.label}
            </span>
            <span className="mt-1 break-words font-bold text-navy">{c.value}</span>
            <span className="mt-1 text-sm text-muted-foreground">{c.note}</span>
          </a>
        </AnimatedSection>
      ))}
    </div>
  );
}
