import { Check } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import type { InquiryType } from "@/lib/inquire/types";
import { featureBullets } from "@/lib/site/content";
import { PHONE_TEL, WHATSAPP_DISPLAY, waLink } from "@/lib/site/contact";
import InquiryForm from "./InquiryForm";
import { WhatsAppIcon } from "./icons";

/** Two-column layout shared by the quote and inquiry pages. */
export default function FormPage({
  type,
  heading,
  intro,
}: {
  type: InquiryType;
  heading: string;
  intro: string;
}) {
  return (
    <section className="container-site grid gap-8 pb-24 pt-6 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
      <AnimatedSection>
        <div className="sticky top-28 overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-primary p-8 text-white md:p-10">
          <span className="eyebrow">Why T&T</span>
          <h2 className="mt-3 text-2xl font-extrabold">{heading}</h2>
          <p className="mt-2 text-sm text-white/70">{intro}</p>
          <ul className="mt-6 space-y-3">
            {featureBullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/90">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-cta text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-white/15 pt-6">
            <p className="text-xs uppercase tracking-wider text-white/60">Prefer to talk?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={waLink("Assalam o Alaikum, I'd like a quote.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold"
              >
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/20"
              >
                {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-xl shadow-navy/5 md:p-10">
          <InquiryForm type={type} />
        </div>
      </AnimatedSection>
    </section>
  );
}
