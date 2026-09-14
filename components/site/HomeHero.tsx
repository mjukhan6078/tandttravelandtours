import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  ADDRESS,
  EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/site/contact";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#f9f9f9] px-4 py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,64,144,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1170px] text-center">
        <AnimatedSection>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            T&T Travel and Tours
          </p>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-primary md:text-5xl">
            Your Trusted Travel Partner
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Plan your sacred Umrah and Hajj journey with care — flights, hotels,
            visa, ziaraat, and transport from Karachi.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="bg-primary px-6 py-3 h-auto uppercase hover:bg-[#0c3270]"
            >
              <Link href="/get-a-quote">Get a Quote</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary px-6 py-3 h-auto uppercase text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link href="/contact-us">Contact Us</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export function ContactStrip() {
  return (
    <section className="border-t border-border bg-white px-4 py-14">
      <div className="mx-auto max-w-[1170px] text-center">
        <AnimatedSection>
          <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-primary">
            Have Inquiries?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Reach us on WhatsApp, email, or visit our Karachi office.
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <p>{ADDRESS}</p>
            <p>
              <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                {EMAIL}
              </a>
            </p>
            <p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-primary uppercase hover:bg-[#0c3270]">
              <Link href="/contact-us">Contact Form</Link>
            </Button>
            <Button
              asChild
              className="bg-[#25D366] text-white uppercase hover:bg-[#1ebe57]"
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
