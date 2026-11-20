"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, Hotel, Info, Landmark, MapPin, Minus, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site/contact";
import {
  MAX_ZIARAAT_GROUP,
  ZIARAAT_CITIES,
  ZIARAAT_IS_PLACEHOLDER,
  ziaraatTours,
  type ZiaraatCity,
  type ZiaraatTour,
} from "@/lib/site/ziaraat";
import { useInquire } from "./InquireContext";
import { WhatsAppIcon } from "./icons";

const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export default function ZiaraatBrowser() {
  const [city, setCity] = useState<ZiaraatCity>("makkah");
  const [tourId, setTourId] = useState(ziaraatTours[0].id);

  const cityTours = ziaraatTours.filter((t) => t.city === city);
  const tour = ziaraatTours.find((t) => t.id === tourId)!;

  function pickCity(id: ZiaraatCity) {
    setCity(id);
    setTourId(ziaraatTours.find((t) => t.city === id)!.id);
  }

  return (
    <section className="bg-white pb-20 pt-8 md:pb-28">
      <div className="container-site">
        {/* City switch */}
        <div role="tablist" aria-label="Choose city" className="grid gap-3 sm:grid-cols-2">
          {ZIARAAT_CITIES.map((c) => {
            const active = c.id === city;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => pickCity(c.id)}
                className={cn(
                  "flex items-center gap-4 rounded-3xl border p-5 text-left transition",
                  active
                    ? "border-transparent bg-navy text-white shadow-xl shadow-navy/20"
                    : "border-border bg-surface text-navy hover:border-primary/40"
                )}
              >
                <span
                  className={cn(
                    "grid size-14 shrink-0 place-items-center rounded-2xl transition",
                    active ? "bg-cta text-white" : "bg-white text-primary"
                  )}
                >
                  <Landmark className="size-7" />
                </span>
                <span>
                  <span className="block text-xl font-extrabold">{c.name}</span>
                  <span className={cn("block text-sm", active ? "text-white/70" : "text-muted-foreground")}>
                    {c.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Tours in this city */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {cityTours.map((t) => {
            const active = t.id === tourId;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTourId(t.id)}
                className={cn(
                  "flex items-start justify-between gap-4 rounded-3xl border-2 p-5 text-left transition",
                  active ? "border-cta bg-cta/5" : "border-border hover:border-primary/40"
                )}
              >
                <span>
                  <span className="block text-lg font-bold text-navy">{t.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{t.summary}</span>
                  <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-navy">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 text-primary" />
                      {t.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary" />
                      {t.stops.length} stops
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-xs text-muted-foreground">From</span>
                  <span className="block text-lg font-extrabold text-primary">{pkr(t.pricePerPerson)}</span>
                  <span className="block text-xs text-muted-foreground">per person</span>
                </span>
              </button>
            );
          })}
        </div>

        {ZIARAAT_IS_PLACEHOLDER && (
          <p className="mt-6 flex items-start gap-2 rounded-2xl border border-cta/30 bg-cta/10 px-4 py-3 text-sm text-navy">
            <Info className="mt-0.5 size-4 shrink-0 text-cta" />
            Sample rates shown for illustration. Message us for today&apos;s price and tour times.
          </p>
        )}

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Route tour={tour} />
          <BookingCard tour={tour} />
        </div>
      </div>
    </section>
  );
}

function Route({ tour }: { tour: ZiaraatTour }) {
  const points = [
    { name: "Pick-up from your hotel", detail: "Our driver meets you in the hotel lobby.", bookend: true },
    ...tour.stops.map((s) => ({ ...s, bookend: false })),
    { name: "Back to your hotel", detail: "Dropped back in time for your next prayer.", bookend: true },
  ];

  return (
    <div className="rounded-[2rem] border border-border p-6 md:p-8">
      <h2 className="text-xl font-extrabold text-navy md:text-2xl">Your route</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {tour.name} · {tour.duration}
      </p>

      <ol key={tour.id} className="relative mt-6">
        {points.map((p, i) => {
          const last = i === points.length - 1;
          return (
            <motion.li
              key={p.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {!last && (
                <span
                  aria-hidden
                  className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 border-l-2 border-dashed border-primary/25"
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold",
                  p.bookend ? "bg-secondary text-primary" : "bg-primary text-white"
                )}
              >
                {p.bookend ? <Hotel className="size-4" /> : i}
              </span>
              <div className="flex-1 pt-1.5">
                <p className={cn("font-bold", p.bookend ? "text-muted-foreground" : "text-navy")}>{p.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{p.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function BookingCard({ tour }: { tour: ZiaraatTour }) {
  const { openWith } = useInquire();
  const [people, setPeople] = useState(2);
  const total = tour.pricePerPerson * people;
  const message = `Assalam o Alaikum, I'd like to book the ${tour.name} for ${people} ${people > 1 ? "people" : "person"}.`;

  return (
    <aside className="rounded-[2rem] bg-gradient-to-br from-navy to-primary p-6 text-white md:p-8 lg:sticky lg:top-28">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Book this tour</p>
      <h3 className="mt-2 text-2xl font-extrabold">{tour.name}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
        <Clock className="size-4" />
        {tour.duration}
      </p>

      <ul className="mt-5 space-y-2">
        {tour.includes.map((i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-white/85">
            <Check className="size-4 text-cta" strokeWidth={3} />
            {i}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 p-3">
        <span className="flex items-center gap-2 pl-1 text-sm font-semibold">
          <Users className="size-4 text-brand-cyan" />
          People
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Fewer people"
            disabled={people <= 1}
            onClick={() => setPeople((p) => Math.max(1, p - 1))}
            className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-lg font-extrabold" aria-live="polite">
            {people}
          </span>
          <button
            type="button"
            aria-label="More people"
            disabled={people >= MAX_ZIARAAT_GROUP}
            onClick={() => setPeople((p) => Math.min(MAX_ZIARAAT_GROUP, p + 1))}
            className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
        <div>
          <p className="text-xs text-white/60">
            {pkr(tour.pricePerPerson)} × {people}
          </p>
          <p className="text-3xl font-extrabold">{pkr(total)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => openWith({ interest: "Ziaraat", message })}
          className="flex-1 rounded-full bg-cta px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover"
        >
          Book now
        </button>
        <a
          href={waLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ask about the ${tour.name} on WhatsApp`}
          className="grid size-12 place-items-center rounded-full border border-white/25 transition hover:bg-white/10"
        >
          <WhatsAppIcon className="size-5" />
        </a>
      </div>

      <Link
        href="/services/transport"
        className="group mt-5 flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
      >
        Prefer a private vehicle for your family?
        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </Link>
    </aside>
  );
}
