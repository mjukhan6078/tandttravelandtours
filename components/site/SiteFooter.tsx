"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { footerLinks } from "@/lib/site/nav";
import {
  ADDRESS,
  EMAIL,
  SITE_NAME,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/site/contact";
import { useInquire } from "./InquireContext";

export default function SiteFooter() {
  const { setOpen } = useInquire();

  return (
    <footer className="border-t border-border bg-white text-[#666]">
      <div className="mx-auto grid max-w-[1170px] gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="mb-4">
            <Link href="/" className="inline-block" aria-label={SITE_NAME}>
              <Image
                src="/images/logo.png"
                alt={SITE_NAME}
                width={240}
                height={104}
                className="h-16 w-auto object-contain"
              />
            </Link>
          </div>
          <p className="text-sm leading-relaxed">
            Trusted Umrah planning — flights, hotels, visa, ziaraat, and transport.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
            Important Links
          </h3>
          <ul className="space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-primary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-primary hover:underline"
              >
                Inquire Now
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
            Contact
          </h3>
          <ul className="space-y-2 text-sm">
            <li>{ADDRESS}</li>
            <li>
              <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1170px] flex-col items-center justify-between gap-3 px-4 py-4 text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. Umrah · Hotels · Visa ·
            Ziaraat · Transport
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ArrowUp className="size-3.5" />
            Go to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
