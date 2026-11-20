import type { Metadata } from "next";
import AnimatedSection from "@/components/AnimatedSection";
import ContactCards from "@/components/site/ContactCards";
import InquiryForm from "@/components/site/InquiryForm";
import PageHero from "@/components/site/PageHero";
import { ADDRESS, MAP_EMBED_URL } from "@/lib/site/contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact T&T Travel and Tours in Karachi for Umrah and Hajj inquiries.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        eyebrow="Get in touch"
        subtitle="Questions about Umrah, Hajj, visas or tickets? Our Karachi team is a message away."
      />

      <section className="container-site pb-10 pt-6">
        <ContactCards />
      </section>

      <section className="container-site grid gap-8 pb-24 pt-6 lg:grid-cols-[1.2fr_1fr]">
        <AnimatedSection>
          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-xl shadow-navy/5 md:p-10">
            <span className="eyebrow">Send a message</span>
            <h2 className="mt-3 text-2xl font-extrabold text-navy md:text-3xl">How can we help you?</h2>
            <p className="mb-8 mt-2 text-sm text-muted-foreground">
              Fill in the form and we will get back to you as soon as possible.
            </p>
            <InquiryForm type="contact" />
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.1} className="h-full">
          <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-border bg-surface">
            <iframe
              title="T&T Travel and Tours office location"
              src={MAP_EMBED_URL}
              className="min-h-[340px] w-full flex-1 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Our office</p>
              <p className="mt-1 font-semibold text-navy">{ADDRESS}</p>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
