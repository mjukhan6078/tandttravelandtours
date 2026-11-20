"use client";

import Link from "next/link";
import { ArrowRight, MessageCircleQuestion } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/site/content";
import { waLink } from "@/lib/site/contact";
import { WhatsAppIcon } from "./icons";

type FaqSectionProps = {
  limit?: number;
  showViewAll?: boolean;
};

export default function FaqSection({ limit, showViewAll = false }: FaqSectionProps) {
  const items = typeof limit === "number" ? faqs.slice(0, limit) : faqs;

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
        <AnimatedSection>
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-3 text-3xl font-extrabold text-navy md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Quick answers about packages, booking and payments.
          </p>
          <div className="mt-8 rounded-3xl bg-gradient-to-br from-navy to-primary p-7 text-white">
            <MessageCircleQuestion className="size-9 text-cta" />
            <h3 className="mt-4 text-lg font-bold">Still have a question?</h3>
            <p className="mt-1 text-sm text-white/70">
              Message our team on WhatsApp — real people, fast replies.
            </p>
            <a
              href={waLink("Assalam o Alaikum, I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="size-4" /> Ask on WhatsApp
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
            {items.map((faq, idx) => (
              <AccordionItem
                key={faq.q}
                value={`item-${idx}`}
                className="rounded-2xl border border-border bg-white px-5 transition data-[state=open]:border-primary/30 data-[state=open]:bg-surface data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-navy hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {showViewAll && (
            <Link
              href="/faq"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              View all FAQs <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}
