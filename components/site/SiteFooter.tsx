"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, FileCheck2, Headset, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { footerLinks, footerServices } from "@/lib/site/nav";
import {
  ADDRESS,
  EMAIL,
  PHONE_TEL,
  SITE_NAME,
  WHATSAPP_DISPLAY,
  WHATSAPP_NAME,
  waLink,
} from "@/lib/site/contact";
import { useInquire } from "./InquireContext";
import { WhatsAppIcon } from "./icons";

const trust = [
  { icon: ShieldCheck, title: "Licensed agency", text: "Government licence G.L# 5481" },
  { icon: FileCheck2, title: "Visa & documents handled", text: "Checklists, forms and appointments" },
  { icon: Clock, title: "10+ years experience", text: "Serving pilgrims from Karachi" },
  { icon: Headset, title: "Real people, fast replies", text: "Talk to our team on WhatsApp" },
];

export default function SiteFooter() {
  const { setOpen } = useInquire();

  return (
    <footer className="relative overflow-hidden bg-navy text-white/70">
      <div
        className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-brand-cyan/10 blur-3xl"
        aria-hidden
      />

      {/* CTA band */}
      <div className="container-site relative pt-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-navy-2 to-primary/60 p-8 md:flex-row md:items-center md:p-10">
          <div>
            <h2 className="max-w-xl text-2xl font-bold text-white md:text-3xl">
              Your next journey starts with one conversation
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Tell us where you want to go. Our Karachi team plans the itinerary, handles the
              visa and books every flight and hotel.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={waLink("Assalam o Alaikum, I'd like to plan a trip.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:-translate-y-0.5 hover:bg-cta-hover"
            >
              <WhatsAppIcon className="size-4" /> Chat on WhatsApp
            </a>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Phone className="size-4" /> Call an expert
            </a>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="container-site relative grid gap-6 border-b border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {trust.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 text-brand-cyan ring-1 ring-white/10">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Columns */}
      <div className="container-site relative grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Link
            href="/"
            className="inline-block rounded-2xl bg-white px-4 py-3"
            aria-label={SITE_NAME}
          >
            <Image src="/images/logo.png" alt={SITE_NAME} width={758} height={329} className="h-12 w-auto" />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Karachi-based travel agency for Umrah, Hajj, visas, flights, hotels, ziaraat and
            transport — good choice for your trip.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cta transition hover:gap-3"
          >
            Send an inquiry <ArrowRight className="size-4" />
          </button>
        </div>

        <FooterCol title="Company" links={footerLinks} />
        <FooterCol title="Services" links={footerServices} />

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white">
            Visit or call us
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-cta" />
              <span>{ADDRESS}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-cta" />
              <a href={PHONE_TEL} className="transition hover:text-white">
                {WHATSAPP_DISPLAY}
                <span className="block text-xs text-white/50">{WHATSAPP_NAME}</span>
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-cta" />
              <a href={`mailto:${EMAIL}`} className="break-all transition hover:text-white">
                {EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-white/50">Umrah · Hajj · Visa · Tickets · Hotels · Transport</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="inline-block transition hover:translate-x-1 hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
