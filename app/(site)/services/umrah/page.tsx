import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import UmrahPackages from "@/components/site/UmrahPackages";

export const metadata: Metadata = {
  title: "Umrah Packages",
  description:
    "Umrah packages from Karachi with flights, visa, hotels in Makkah and Madinah, transport and ziaraat. Compare by duration, hotel and room sharing.",
};

export default function UmrahPackagesPage() {
  return (
    <>
      <PageHero
        title="Umrah Packages"
        eyebrow="All-inclusive from Karachi"
        parent={{ label: "Services", href: "/services" }}
        subtitle="Flights, visa, hotels, transport and ziaraat in one price. Compare packages by duration, hotel and room sharing."
      />
      <UmrahPackages />
    </>
  );
}
