import type { Metadata } from "next";
import FaqSection from "@/components/site/FaqSection";
import PageHero from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about T&T Travel and Tours packages.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero title="FAQ" subtitle="Answers to common questions" />
      <FaqSection />
    </>
  );
}
