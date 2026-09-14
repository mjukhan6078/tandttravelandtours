import type { Metadata } from "next";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/site/PageHero";
import { aboutHighlights, aboutIntro } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about T&T Travel and Tours — your trusted partner for Umrah and Hajj from Karachi.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Us"
        subtitle="Your trusted partner in spiritual journeys"
      />
      <section className="mx-auto max-w-[1170px] px-4 py-14">
        <AnimatedSection>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base leading-relaxed text-muted-foreground">
            {aboutIntro}
          </p>
        </AnimatedSection>
        <div className="grid gap-6 md:grid-cols-3">
          {aboutHighlights.map((item, idx) => (
            <AnimatedSection key={item.title} delay={idx * 0.1}>
              <div className="rounded border border-border bg-white p-8 text-center shadow-sm">
                <h2 className="mb-3 font-heading text-xl font-bold uppercase text-primary">
                  {item.title}
                </h2>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </>
  );
}
