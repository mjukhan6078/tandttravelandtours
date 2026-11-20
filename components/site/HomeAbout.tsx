"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { aboutIntro, featureBullets, processSteps, whyUs } from "@/lib/site/content";
import SectionHeading from "./SectionHeading";
import { iconMap } from "./icons";

export default function HomeAbout() {
  return (
    <section className="relative overflow-hidden bg-navy py-16 text-white md:py-24">
      <div className="pointer-events-none absolute -right-32 top-0 size-[480px] rounded-full bg-primary/40 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-20 bottom-0 size-[360px] rounded-full bg-brand-cyan/15 blur-3xl" aria-hidden />

      <div className="container-site relative grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="eyebrow">Who we are</span>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
            Travel planned by people who do it every day
          </h2>
          <p className="mt-5 text-white/70">{aboutIntro}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {featureBullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-white/85">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-cta/20 text-cta">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="/about-us"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-navy transition hover:bg-cta hover:text-white"
          >
            More about us <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4">
          {whyUs.map((w, i) => {
            const Icon = iconMap[w.icon];
            return (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:border-cta/40 hover:bg-white/[0.08]"
              >
                <span className="text-sm font-bold text-cta">0{i + 1}</span>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-cyan transition group-hover:bg-cta group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold">{w.title}</h3>
                  <p className="mt-1 text-sm text-white/65">{w.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ProcessSteps() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title="From first message to safe return"
          description="A simple four-step process — we keep you updated at every stage."
        />
        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
          <div
            className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-transparent via-border to-transparent md:block"
            aria-hidden
          />
          {processSteps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="group relative flex flex-col items-center text-center"
            >
              <span className="relative grid size-14 place-items-center rounded-full border-4 border-white bg-secondary text-lg font-extrabold text-primary shadow-lg shadow-primary/10 ring-1 ring-border transition group-hover:bg-cta group-hover:text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-bold text-navy">{s.title}</h3>
              <p className="mt-1 max-w-[16rem] text-sm text-muted-foreground">{s.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
