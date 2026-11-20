import type { Metadata } from "next";
import FlightSearch from "@/components/site/FlightSearch";
import PageHero from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Flight Tickets",
  description:
    "Domestic and international flight tickets from Pakistan, including Umrah flights to Jeddah and Madinah. Request fares from T&T Travel and Tours.",
};

export default function FlightsPage() {
  return (
    <>
      <PageHero
        title="Flight Tickets"
        eyebrow="Domestic & international"
        parent={{ label: "Services", href: "/services" }}
        subtitle="Tell us where and when you want to fly. We compare the airlines and send you the best fares."
      />
      <FlightSearch />
    </>
  );
}
