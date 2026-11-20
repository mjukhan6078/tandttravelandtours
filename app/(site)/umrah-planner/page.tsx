import type { Metadata } from "next";
import { Eye, Handshake, PencilLine } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/site/PageHero";
import UmrahPlanner from "@/components/planner/UmrahPlanner";

export const metadata: Metadata = {
  title: "Build Your Umrah",
  description:
    "Map out your Umrah journey with T&T Travel and Tours — set nights in Makkah and Madinah, choose your comfort level and group, and see your estimated fare live.",
};

const promises = [
  {
    icon: Eye,
    title: "See every rupee",
    text: "Your fare updates live as you change cities, nights, hotels or transport.",
  },
  {
    icon: Handshake,
    title: "A real person confirms",
    text: "Our Karachi team checks availability and sends your final price.",
  },
  {
    icon: PencilLine,
    title: "Nothing is locked in",
    text: "Requesting is free — adjust anything with us before you book.",
  },
];

export default function UmrahPlannerPage() {
  return (
    <>
      <PageHero
        title="Build Your Umrah"
        eyebrow="Umrah journey builder"
        subtitle="Map your route between Makkah and Madinah, pick your comfort level and watch your Umrah pass come together."
      />
      <UmrahPlanner />
      <section className="border-t border-border bg-white py-14">
        <div className="container-site grid gap-8 md:grid-cols-3">
          {promises.map(({ icon: Icon, title, text }, i) => (
            <AnimatedSection key={title} delay={i * 0.08} className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-navy text-cta">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-bold text-navy">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </>
  );
}
