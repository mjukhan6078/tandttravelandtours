"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { journeys, stats } from "@/lib/site/content";
import SectionHeading from "./SectionHeading";
import { iconMap } from "./icons";

export default function JourneyGrid() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-site">
        <SectionHeading
          align="center"
          eyebrow="What we do"
          title="Everything your journey needs"
          description="Umrah, Hajj, visas, flights and tours — planned end to end by one team."
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {journeys.map(({ title, href, blurb, icon }, i) => {
            const Icon = iconMap[icon];
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Link
                  href={href}
                  className="group relative flex h-full flex-col items-center rounded-2xl border border-border bg-white p-5 text-center transition duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-2xl hover:shadow-primary/15"
                >
                  <ArrowUpRight className="absolute right-3 top-3 size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100 group-hover:text-cta" />
                  <span className="grid size-14 place-items-center rounded-2xl bg-cta/10 text-cta transition duration-300 group-hover:scale-110 group-hover:bg-cta group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <span className="mt-4 text-sm font-bold text-navy">{title}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">{blurb}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-6 py-8 text-center">
              <p className="text-3xl font-extrabold text-primary md:text-4xl">
                <CountUp to={s.value} />
                <span className="text-cta">{s.suffix}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{value.toLocaleString("en-US")}</span>;
}
