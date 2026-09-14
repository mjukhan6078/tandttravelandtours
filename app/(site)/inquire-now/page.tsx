import type { Metadata } from "next";
import AnimatedSection from "@/components/AnimatedSection";
import InquiryForm from "@/components/site/InquiryForm";
import PageHero from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Inquire Now",
  description: "Send an inquiry to T&T Travel and Tours.",
};

export default function InquireNowPage() {
  return (
    <>
      <PageHero
        title="Inquire Now"
        subtitle="Ask us anything about Umrah, Hajj, or travel services"
      />
      <section className="mx-auto max-w-xl px-4 py-14">
        <AnimatedSection>
          <div className="rounded border border-border bg-white p-6 shadow-sm">
            <InquiryForm type="inquire" />
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
