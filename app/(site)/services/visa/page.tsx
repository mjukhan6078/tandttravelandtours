import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import VisaBrowser from "@/components/site/VisaBrowser";

export const metadata: Metadata = {
  title: "Visa Assistance",
  description:
    "Umrah and Saudi tourist visa help from Karachi: document checklist, processing times and fees, with T&T Travel and Tours handling the application.",
};

export default function VisaPage() {
  return (
    <>
      <PageHero
        title="Visa Assistance"
        eyebrow="Saudi visas"
        parent={{ label: "Services", href: "/services" }}
        subtitle="Pick your visa, check which documents you need, and let our team handle the application from start to finish."
      />
      <VisaBrowser />
    </>
  );
}
