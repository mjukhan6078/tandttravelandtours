"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { heroQuickLinks, heroWords } from "@/lib/site/content";
import { iconMap } from "./icons";

const trustPoints = ["Transparent pricing", "Customized packages", "Family & group planning"];

export default function HomeHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % heroWords.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-navy">
      {/* Background image + overlays */}
      <Image
        src="/makka.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-20 scale-105 object-cover opacity-45"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/40" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-transparent to-transparent" aria-hidden />
      <div
        className="absolute -left-40 top-1/3 -z-10 size-[520px] rounded-full bg-primary/40 blur-3xl"
        aria-hidden
      />

      <div className="container-site pb-24 pt-14 md:pt-20 lg:pb-32">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur"
          >
            <span className="size-2 rounded-full bg-cta" />
            Licensed travel agency in Karachi · G.L# 5481
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-6 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
          >
            Plan your perfect
            <span className="relative block h-[1.3em] overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.span
                  key={heroWords[index]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-0 whitespace-nowrap pb-[0.12em] leading-[1.2] text-cta"
                >
                  {heroWords[index]} journey
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 max-w-xl text-base text-white/75 md:text-lg"
          >
            Flights, visa, hotels near Haramain, transport and guided ziaraat — planned end to
            end by one trusted team from Karachi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/services/umrah"
              className="group inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cta/30 transition hover:-translate-y-0.5 hover:bg-cta-hover"
            >
              Explore Umrah packages
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              Contact us
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80"
          >
            {trustPoints.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-cta/20 text-cta">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </motion.ul>
        </div>

      </div>

      {/* Quick links strip overlapping the next section */}
      <div className="container-site relative -mb-px">
        <div className="grid grid-cols-2 gap-2 rounded-t-3xl bg-white p-3 sm:grid-cols-4 md:p-4">
          {heroQuickLinks.map(({ label, href, icon }) => {
            const Icon = iconMap[icon];
            return (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-2.5 rounded-2xl px-2 py-2.5 sm:gap-3 sm:px-3 sm:py-3 transition hover:bg-surface"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl sm:size-11 bg-secondary text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-navy">{label}</span>
                  <span className="hidden text-xs text-muted-foreground sm:block">Book with us</span>
                </span>
                <ChevronRight className="hidden size-4 text-muted-foreground sm:block transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
