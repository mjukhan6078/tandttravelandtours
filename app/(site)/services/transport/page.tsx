import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import TransportBrowser from "@/components/site/TransportBrowser";

export const metadata: Metadata = {
  title: "Transport",
  description:
    "Airport transfers, Makkah–Madinah travel and ziaraat tours in private cars, vans and coaches, arranged by T&T Travel and Tours.",
};

export default function TransportPage() {
  return (
    <>
      <PageHero
        title="Transport"
        eyebrow="Transfers & ziaraat"
        parent={{ label: "Services", href: "/services" }}
        subtitle="Airport pick-ups, hotel-to-hotel travel between Makkah and Madinah, and ziaraat tours: pick your route and the vehicle that fits your group."
      />
      <TransportBrowser />
    </>
  );
}
