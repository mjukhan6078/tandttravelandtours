import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { galleryPreview } from "@/lib/site/content";

export default function GalleryPreview() {
  return (
    <section className="bg-muted px-4 py-14 md:py-20">
      <div className="mx-auto max-w-[1170px]">
        <AnimatedSection>
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-primary md:text-3xl">
              Gallery
            </h2>
            <p className="mt-3 text-muted-foreground">
              Moments and places from our journeys — more photos coming soon
            </p>
          </div>
        </AnimatedSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryPreview.map((tile, idx) => (
            <AnimatedSection key={tile.href} delay={idx * 0.06}>
              <Link
                href={tile.href}
                className="group relative block overflow-hidden rounded border border-border bg-primary/10"
              >
                <div
                  className="aspect-[3/4] bg-gradient-to-br from-primary/35 via-secondary/30 to-primary/55"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white transition group-hover:bg-black/65">
                  {tile.title}
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
