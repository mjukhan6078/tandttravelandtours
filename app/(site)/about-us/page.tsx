import type { Metadata } from "next";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";
import HomeAbout from "@/components/site/HomeAbout";
import HomeTestimonials from "@/components/site/HomeTestimonials";
import JourneyGrid from "@/components/site/JourneyGrid";
import PageHero from "@/components/site/PageHero";
import { iconMap } from "@/components/site/icons";
import { aboutHighlights, aboutIntro } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about T&T Travel and Tours — your trusted partner for Umrah and Hajj from Karachi.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero title="About Us" eyebrow="Our story" subtitle="Your trusted partner in spiritual journeys." />

      <section className="container-site grid items-center gap-12 pb-16 pt-6 lg:grid-cols-2">
        <AnimatedSection className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <Image src="/makka.jpg" alt="The Kaaba in Makkah" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
          </div>
          <div className="absolute -bottom-6 right-6 rounded-2xl bg-white p-5 shadow-2xl shadow-navy/20 animate-float-slow">
            <p className="text-3xl font-extrabold text-primary">
              10<span className="text-cta">+</span>
            </p>
            <p className="text-xs font-semibold text-muted-foreground">Years serving pilgrims</p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <span className="eyebrow">Who we are</span>
          <h2 className="mt-3 text-3xl font-extrabold text-navy md:text-4xl">
            Good choice for your trip
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{aboutIntro}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {aboutHighlights.map((h) => {
              const Icon = iconMap[h.icon];
              return (
                <div key={h.title} className="rounded-2xl border border-border p-4 transition hover:border-primary/30 hover:shadow-lg">
                  <Icon className="size-6 text-cta" />
                  <p className="mt-3 text-sm font-bold text-navy">{h.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </section>

      <HomeAbout />
      <JourneyGrid />
      <HomeTestimonials />
    </>
  );
}
