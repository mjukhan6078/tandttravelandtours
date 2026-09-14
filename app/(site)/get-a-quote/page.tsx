import type { Metadata } from "next";
import AnimatedSection from "@/components/AnimatedSection";
import InquiryForm from "@/components/site/InquiryForm";
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
        subtitle="Tell us about your trip and we will respond soon"
      />
      <section className="mx-auto max-w-xl px-4 py-14">
        <AnimatedSection>
          <div className="rounded border border-border bg-white p-6 shadow-sm">
            <InquiryForm type="quote" />
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
