import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Hourglass } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { waLink } from "@/lib/site/contact";
import { WhatsAppIcon } from "./icons";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Optional parent page shown between Home and the title in the breadcrumb. */
  parent?: { label: string; href: string };
};

export default function PageHero({ title, subtitle, eyebrow, parent }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      <Image src="/makka.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-primary/70" aria-hidden />
      <div className="container-site py-16 md:py-24">
        <AnimatedSection>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-white/60">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            {parent && (
              <>
                <Link href={parent.href} className="transition hover:text-white">
                  {parent.label}
                </Link>
                <ChevronRight className="size-3.5" />
              </>
            )}
            <span className="text-cta">{title}</span>
          </nav>
          {eyebrow && <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cta">{eyebrow}</p>}
          <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-base text-white/70 md:text-lg">{subtitle}</p>}
        </AnimatedSection>
      </div>
      <div className="h-6 rounded-t-[2rem] bg-white" aria-hidden />
    </section>
  );
}

type ComingSoonProps = {
  title: string;
  description?: string;
};

export function ComingSoon({
  title,
  description = "This section is coming soon. Contact us for details in the meantime.",
}: ComingSoonProps) {
  return (
    <>
      <PageHero title={title} />
      <section className="container-site pb-24 pt-10">
        <AnimatedSection className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-surface p-10 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-cta/10 text-cta">
            <Hourglass className="size-8" />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-navy">Coming soon</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">{description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={waLink(`Assalam o Alaikum, I'd like details about ${title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="size-4" /> Ask on WhatsApp
            </a>
            <Link
              href="/get-a-quote"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:border-primary hover:text-primary"
            >
              Get a quote <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
