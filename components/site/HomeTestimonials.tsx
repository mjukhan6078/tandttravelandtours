import AnimatedSection from "@/components/AnimatedSection";
import { testimonials } from "@/lib/site/content";

export default function HomeTestimonials() {
  return (
    <section className="bg-white px-4 py-14 md:py-20">
      <div className="mx-auto max-w-[1170px]">
        <AnimatedSection>
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-primary md:text-3xl">
              Testimonials
            </h2>
          </div>
        </AnimatedSection>
        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((t, idx) => (
            <AnimatedSection key={t.author + idx} delay={idx * 0.08}>
              <blockquote className="mx-auto max-w-xl italic text-foreground">
                <p className="text-base leading-relaxed before:mr-1 before:text-2xl before:font-serif before:text-primary before:content-['“']">
                  {t.text}
                </p>
                <footer className="mt-3 text-right text-sm font-semibold not-italic text-primary">
                  — {t.author}
                </footer>
              </blockquote>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
