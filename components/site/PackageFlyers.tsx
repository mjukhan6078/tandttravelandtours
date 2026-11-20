"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { packageFlyers } from "@/lib/site/content";
import { waLink } from "@/lib/site/contact";
import SectionHeading from "./SectionHeading";
import { WhatsAppIcon } from "./icons";

export default function PackageFlyers() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setActive((i) => (i === null ? i : (i + dir + packageFlyers.length) % packageFlyers.length)),
    []
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, step]);

  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container-site">
        <SectionHeading
          eyebrow="Umrah packages"
          title="Latest Umrah package offers"
          description="Hotels in Makkah and Madinah, visa, flights and transport — tap a flyer to view it in full. Ask us for current dates and rates."
          action={
            <div className="flex gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => scroll(-1)}
                className="grid size-11 place-items-center rounded-full border border-border bg-white text-navy transition hover:border-primary hover:bg-primary hover:text-white"
                aria-label="Previous packages"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                className="grid size-11 place-items-center rounded-full border border-border bg-white text-navy transition hover:border-primary hover:bg-primary hover:text-white"
                aria-label="Next packages"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          }
        />
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-6 md:scroll-px-6 md:px-6 lg:mx-auto lg:grid lg:max-w-[1240px] lg:grid-cols-5 lg:overflow-visible"
      >
        {packageFlyers.map((f, i) => (
          <motion.button
            key={f.src}
            type="button"
            onClick={() => setActive(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="group relative w-[72vw] shrink-0 snap-center sm:snap-start overflow-hidden rounded-3xl bg-white text-left shadow-lg shadow-navy/5 ring-1 ring-border transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/15 sm:w-[300px] lg:w-auto"
            aria-label={`View ${f.alt}`}
          >
            <span className="absolute left-4 top-4 z-10 rounded-full bg-cta px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Umrah
            </span>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={f.src}
                alt={f.alt}
                fill
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 300px, 240px"
                className="object-cover object-top transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 grid place-items-center bg-navy/0 transition group-hover:bg-navy/40">
                <span className="grid size-14 scale-75 place-items-center rounded-full bg-white/95 text-primary opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
                  <ZoomIn className="size-6" />
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/90 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Package flyer"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-8"
              aria-label="Previous flyer"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-8"
              aria-label="Next flyer"
            >
              <ChevronRight className="size-6" />
            </button>

            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex max-h-full flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[78vh] w-[min(88vw,calc(78vh*0.72))] overflow-hidden rounded-2xl">
                <Image
                  src={packageFlyers[active].src}
                  alt={packageFlyers[active].alt}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/70">
                  {active + 1} / {packageFlyers.length}
                </span>
                <a
                  href={waLink(`Assalam o Alaikum, I'm interested in this package: ${packageFlyers[active].alt}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
                >
                  <WhatsAppIcon className="size-4" /> Ask about this package
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
