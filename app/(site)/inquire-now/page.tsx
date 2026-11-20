import type { Metadata } from "next";
import FormPage from "@/components/site/FormPage";
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
        eyebrow="We're here to help"
        subtitle="Ask us anything about Umrah, Hajj, visas, tickets or tours."
      />
      <FormPage
        type="inquire"
        heading="Ask our travel experts"
        intro="Real people, fast replies — before, during and after your journey."
      />
    </>
  );
}
