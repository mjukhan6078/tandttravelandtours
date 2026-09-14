import type { Metadata } from "next";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import InquiryForm from "@/components/site/InquiryForm";
import PageHero from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import {
  ADDRESS,
  EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NAME,
  WHATSAPP_URL,
} from "@/lib/site/contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact T&T Travel and Tours in Karachi for Umrah and Hajj inquiries.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Get in touch for any queries or assistance"
      />
      <section className="mx-auto grid max-w-[1170px] gap-12 px-4 py-14 md:grid-cols-2">
        <AnimatedSection>
          <div className="space-y-6 text-sm">
            <div className="rounded border border-border bg-white p-6">
              <h2 className="mb-2 font-heading text-base font-bold uppercase text-primary">
                WhatsApp
              </h2>
              <p className="font-semibold">{WHATSAPP_NAME}</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-lg font-semibold text-primary hover:underline"
              >
                {WHATSAPP_DISPLAY}
              </a>
              <Button
                asChild
                className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#1ebe57]"
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
            </div>
            <div className="rounded border border-border bg-white p-6">
              <h2 className="mb-2 font-heading text-base font-bold uppercase text-primary">
                Email
              </h2>
              <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                {EMAIL}
              </a>
            </div>
            <div className="rounded border border-border bg-white p-6">
              <h2 className="mb-2 font-heading text-base font-bold uppercase text-primary">
                Address
              </h2>
              <p className="text-muted-foreground">{ADDRESS}</p>
            </div>
            <p>
              Prefer a quote form?{" "}
              <Link href="/get-a-quote" className="text-primary hover:underline">
                Get a Quote
              </Link>
            </p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <div className="rounded border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-base font-bold uppercase text-primary">
              Send us a message
            </h2>
            <InquiryForm type="contact" />
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
