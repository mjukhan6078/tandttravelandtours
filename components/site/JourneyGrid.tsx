import Link from "next/link";
import {
  Bus,
  FileText,
  Home,
  Landmark,
  MoonStar,
  Plane,
  type LucideIcon,
} from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { journeys } from "@/lib/site/content";

const icons: LucideIcon[] = [Landmark, MoonStar, Plane, Home, Bus, FileText];

export default function JourneyGrid() {
  return (
    <section className="bg-muted px-4 py-14 md:py-20">
      <div className="mx-auto max-w-[1170px]">
        <AnimatedSection>
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-primary md:text-3xl">
              Choose Your Journey
            </h2>
            <p className="mt-3 text-muted-foreground">
              Explore how we can support your travel plans
            </p>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {journeys.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <AnimatedSection key={item.title} delay={idx * 0.05}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col items-center rounded border border-border bg-white px-4 py-6 text-center transition hover:bg-[#f0f0f0] hover:shadow-md"
                >
                  <Icon className="mb-3 size-10 text-primary" aria-hidden />
                  <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-2 text-xs text-muted-foreground">{item.blurb}</span>
                  <span className="mt-4 text-xs font-semibold uppercase text-primary">
                    Find Out More
                  </span>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
