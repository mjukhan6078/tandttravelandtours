import Link from "next/link";
import { Button } from "@/components/ui/button";

type PageHeroProps = {
  title: string;
  subtitle?: string;
};

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="border-b border-border bg-muted px-4 py-12 text-center md:py-16">
      <div className="mx-auto max-w-[1170px]">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-primary md:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
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
      <section className="mx-auto max-w-[720px] px-4 py-16 text-center">
        <p className="mb-8 text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="bg-primary hover:bg-[#0c3270] uppercase">
            <Link href="/contact-us">Contact Us</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground uppercase"
          >
            <Link href="/get-a-quote">Get a Quote</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
