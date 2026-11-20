import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import ZiaraatBrowser from "@/components/site/ZiaraatBrowser";

export const metadata: Metadata = {
  title: "Ziaraat Tours",
  description:
    "Guided ziaraat tours of the sacred sites of Makkah and Madinah, plus Taif and Badr day trips, arranged by T&T Travel and Tours.",
};

export default function ZiaraatPage() {
  return (
    <>
      <PageHero
        title="Ziaraat Tours"
        eyebrow="Guided tours"
        parent={{ label: "Services", href: "/services" }}
        subtitle="Visit the sacred sites of Makkah and Madinah with a guide who knows their history. Pick a tour, see every stop, and book for your group."
      />
      <ZiaraatBrowser />
    </>
  );
}
