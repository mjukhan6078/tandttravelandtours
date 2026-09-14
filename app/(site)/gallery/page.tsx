import type { Metadata } from "next";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/site/PageHero";
import { galleryPreview } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo galleries from T&T Travel and Tours — coming soon.",
};

export default function GalleryIndexPage() {
  return (
    <>
      <PageHero
        title="Gallery"
        subtitle="Photo collections will appear here as we publish them"
      />
      <section className="mx-auto max-w-[1170px] px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryPreview.map((tile, idx) => (
            <AnimatedSection key={tile.href} delay={idx * 0.05}>
              <Link
                href={tile.href}
                className="block rounded border border-border bg-white p-6 text-center shadow-sm transition hover:border-primary hover:shadow-md"
              >
                <span className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
                  {tile.title}
                </span>
                <p className="mt-2 text-xs text-muted-foreground">Coming soon</p>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </>
  );
}
