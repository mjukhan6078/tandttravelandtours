import type { Metadata } from "next";
import HotelBrowser from "@/components/site/HotelBrowser";
import PageHero from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Hotels in Makkah & Madinah",
  description:
    "Compare hotels near Masjid al-Haram and Masjid an-Nabawi by distance, rating and room rate, and book through T&T Travel and Tours.",
};

export default function HotelsPage() {
  return (
    <>
      <PageHero
        title="Hotels"
        eyebrow="Makkah & Madinah"
        parent={{ label: "Services", href: "/services" }}
        subtitle="Compare hotels near the Haramain by walking distance, star rating and room rate, then book with our team."
      />
      <HotelBrowser />
    </>
  );
}
