import type { Metadata } from "next";
import FormPage from "@/components/site/FormPage";
import PageHero from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Get a Quote",
  description: "Request a quote for Umrah, Hajj, or travel services from T&T Travel and Tours.",
};

export default function GetAQuotePage() {
  return (
    <>
      <PageHero
        title="Get a Quote"
        eyebrow="Free, no obligation"
        subtitle="Tell us about your trip and we will send you a tailored package with clear pricing."
      />
      <FormPage
        type="quote"
        heading="A package built around you"
        intro="Share your dates, travellers and preferences — we handle flights, visa, hotels and transport."
      />
    </>
  );
}
