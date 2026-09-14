import type { Metadata } from "next";
import Link from "next/link";
import { Bus, FileText, Hotel, Landmark, Plane } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Tickets, visa, hotels, ziaraat, and transport from T&T Travel and Tours.",
};

const icons = [Plane, FileText, Hotel, Landmark, Bus];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="Services"
        subtitle="Everything you need for a smooth pilgrimage"
      />
      <section className="mx-auto max-w-[1170px] px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <AnimatedSection key={service.title} delay={idx * 0.06}>
                <article className="flex h-full flex-col rounded border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <Icon className="mb-4 size-10 text-primary" aria-hidden />
                  <h2 className="mb-2 font-heading text-lg font-bold uppercase text-primary">
                    {service.title}
                  </h2>
                  <p className="mb-6 flex-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-fit border-primary text-primary uppercase text-xs"
                  >
                    <Link href="/get-a-quote">Find Out More</Link>
                  </Button>
                </article>
              </AnimatedSection>
            );
          })}
        </div>
      </section>
    </>
  );
}
