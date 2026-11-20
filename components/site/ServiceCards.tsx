"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { services } from "@/lib/site/content";
import SectionHeading from "./SectionHeading";
import { iconMap } from "./icons";

export default function ServiceCards({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site">
        {withHeading && (
          <SectionHeading
            eyebrow="Our services"
            title="Tailored services for every traveller"
            description="Pick one service or let us arrange the complete journey."
            action={
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-primary hover:text-primary"
              >
                All services <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            }
          />
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon];
            return (
              <motion.article
                key={s.id}
                id={withHeading ? undefined : s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
                className="group relative scroll-mt-28 overflow-hidden rounded-3xl border border-border bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl hover:shadow-primary/15"
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary via-brand-cyan to-cta transition duration-500 group-hover:scale-x-100" />
                <div className="flex items-start justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary transition duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <span className="text-4xl font-extrabold text-surface transition group-hover:text-secondary">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="size-4 text-cta" strokeWidth={3} />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={s.page ?? "/get-a-quote"}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition group-hover:gap-3"
                >
                  {s.page ? "View options" : "Get a quote"} <ArrowRight className="size-4" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
