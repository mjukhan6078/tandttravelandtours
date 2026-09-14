import AnimatedSection from "@/components/AnimatedSection";
import { aboutIntro, featureBullets } from "@/lib/site/content";

export default function HomeAbout() {
  return (
    <section className="bg-white px-4 py-14 md:py-20">
      <div className="mx-auto max-w-[1170px]">
        <AnimatedSection>
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-wide text-primary md:text-3xl">
                Serving Pilgrims with Care
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {aboutIntro}
              </p>
            </div>
            <ul className="columns-1 gap-x-10 space-y-3 sm:columns-2">
              {featureBullets.map((item) => (
                <li
                  key={item}
                  className="break-inside-avoid text-sm font-medium text-foreground before:mr-2 before:text-primary before:content-['✓']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
