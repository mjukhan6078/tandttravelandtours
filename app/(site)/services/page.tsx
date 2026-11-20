import type { Metadata } from "next";
import { ProcessSteps } from "@/components/site/HomeAbout";
import PackageFlyers from "@/components/site/PackageFlyers";
import PageHero from "@/components/site/PageHero";
import ServiceCards from "@/components/site/ServiceCards";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Umrah packages, tickets, visa, hotels, ziaraat, and transport from T&T Travel and Tours.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="Services"
        eyebrow="What we offer"
        subtitle="Everything you need for a smooth pilgrimage or holiday — book one service or the complete journey."
      />
      <ServiceCards withHeading={false} />
      <PackageFlyers />
      <ProcessSteps />
    </>
  );
}
