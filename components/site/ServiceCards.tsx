import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { tailoredServices } from "@/lib/site/content";

export default function ServiceCards() {
  return (
    <section className="bg-white px-4 py-14 md:py-20">
      <div className="mx-auto max-w-[1170px]">
        <AnimatedSection>
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-primary md:text-3xl">
              Tailored Journeys
            </h2>
            <p className="mt-3 text-muted-foreground">
              Our Hajj, Umrah & travel services
            </p>
          </div>
        </AnimatedSection>
        <div className="grid gap-6 sm:grid-cols-2">
          {tailoredServices.map((card, idx) => (
            <AnimatedSection key={card.title} delay={idx * 0.08}>
              <article className="flex h-full flex-col rounded-md border border-[#ddd] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                <h3 className="mb-3 font-heading text-lg font-bold uppercase tracking-wide text-primary">
                  {card.title}
                </h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-[#555]">
                  {card.text}
                </p>
                <Button
                  asChild
                  className="w-fit bg-primary hover:bg-[var(--primary-hover)] uppercase text-xs"
                >
                  <Link href={card.href}>Get a Quote</Link>
                </Button>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
