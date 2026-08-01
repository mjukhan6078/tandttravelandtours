"use client";
import AnimatedSection from "./AnimatedSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function FAQ() {
  const faqs = [
    {
      q: "What is included in the packages?",
      a: "Our packages include flights, accommodation, breakfast, visa processing, airport transfers, and guided ziarat.",
    },
    {
      q: "How far in advance should I book?",
      a: "We recommend booking at least 2-3 months in advance for the best availability and rates.",
    },
    {
      q: "Do you provide group discounts?",
      a: "Yes, we offer special discounts for groups of 10 or more pilgrims.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept bank transfers, credit cards, and various digital payment platforms.",
    },
    {
      q: "Is travel insurance included?",
      a: "Travel insurance is optional but highly recommended. We can assist with arranging it for you.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions
            </p>
          </div>
        </AnimatedSection>
        <div className="max-w-2xl mx-auto">
          <AnimatedSection delay={0.2}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <AccordionItem
                    value={`item-${idx}`}
                    className="bg-card rounded-lg border px-6"
                  >
                    <AccordionTrigger className="text-left font-medium">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
