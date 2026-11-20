"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/site/content";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/utils";

export default function HomeTestimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [paused, count]);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);
  const current = testimonials[index];

  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container-site">
        <SectionHeading align="center" eyebrow="Testimonials" title="What our pilgrims say" />

        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-white px-6 py-12 text-center shadow-xl shadow-navy/5 md:px-14">
            <Quote className="absolute left-6 top-6 size-14 text-secondary" aria-hidden />
            <div className="flex justify-center gap-1 text-cta" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <div className="relative min-h-[9rem] md:min-h-[7rem]">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  className="mt-6"
                >
                  <p className="text-lg font-medium leading-relaxed text-navy md:text-xl">
                    “{current.text}”
                  </p>
                  <footer className="mt-5 flex items-center justify-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-brand-cyan text-sm font-bold text-white">
                      {current.author.charAt(0)}
                    </span>
                    <cite className="text-sm font-semibold not-italic text-foreground">
                      {current.author}
                    </cite>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              className="grid size-10 place-items-center rounded-full border border-border bg-white text-navy transition hover:bg-primary hover:text-white"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.author}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-8 bg-cta" : "w-2 bg-border hover:bg-muted-foreground/40"
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              className="grid size-10 place-items-center rounded-full border border-border bg-white text-navy transition hover:bg-primary hover:text-white"
              aria-label="Next testimonial"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
