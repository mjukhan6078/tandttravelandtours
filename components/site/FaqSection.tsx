"use client";

import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/site/content";

type FaqSectionProps = {
  limit?: number;
  showViewAll?: boolean;
};

export default function FaqSection({
  limit,
  showViewAll = false,
}: FaqSectionProps) {
  const items = typeof limit === "number" ? faqs.slice(0, limit) : faqs;

  return (
    <section className="bg-muted px-4 py-14 md:py-20">
      <div className="mx-auto max-w-[1170px]">
        <AnimatedSection>
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-primary md:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Find answers to common questions
            </p>
          </div>
        </AnimatedSection>
        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-3">
            {items.map((faq, idx) => (
              <AccordionItem
                key={faq.q}
                value={`item-${idx}`}
                className="rounded border border-border bg-white px-4"
              >
                <AccordionTrigger className="text-left text-sm font-semibold uppercase tracking-wide text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {showViewAll ? (
            <div className="mt-8 text-center">
              <Button
                asChild
                variant="outline"
                className="border-primary text-primary uppercase"
              >
                <Link href="/faq">View all FAQs</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
