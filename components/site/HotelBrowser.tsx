"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  Bus,
  Check,
  Footprints,
  Info,
  Landmark,
  MapPin,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site/contact";
import {
  HOTEL_CITIES,
  HOTELS_ARE_PLACEHOLDER,
  ROOM_TYPES,
  formatDistance,
  formatPKR,
  hotels,
  lowestRate,
  walkMinutes,
  type Hotel,
  type HotelCity,
} from "@/lib/site/hotels";
import { useInquire } from "./InquireContext";
import HotelPhoto from "./HotelPhoto";
import { WhatsAppIcon } from "./icons";

type SortKey = "distance" | "price" | "rating";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "distance", label: "Nearest first" },
  { id: "price", label: "Lowest price" },
  { id: "rating", label: "Highest rating" },
];

export default function HotelBrowser() {
  const [city, setCity] = useState<HotelCity>("makkah");
  const [stars, setStars] = useState<number | "all">("all");
  const [sort, setSort] = useState<SortKey>("distance");

  const cityHotels = useMemo(() => hotels.filter((h) => h.city === city), [city]);
  const starOptions = useMemo(
    () => [...new Set(cityHotels.map((h) => h.stars))].sort((a, b) => b - a),
    [cityHotels]
  );

  const list = useMemo(() => {
    const filtered = stars === "all" ? cityHotels : cityHotels.filter((h) => h.stars === stars);
    return [...filtered].sort((a, b) => {
      if (sort === "price") return lowestRate(a) - lowestRate(b);
      if (sort === "rating") return b.stars - a.stars || a.distanceM - b.distanceM;
      return a.distanceM - b.distanceM;
    });
  }, [cityHotels, stars, sort]);

  const activeCity = HOTEL_CITIES.find((c) => c.id === city)!;

  function pickCity(id: HotelCity) {
    setCity(id);
    setStars("all");
  }

  return (
    <section className="bg-white pb-20 pt-8 md:pb-28">
      <div className="container-site">
        {/* City switch */}
        <div role="tablist" aria-label="Choose city" className="grid gap-3 sm:grid-cols-2">
          {HOTEL_CITIES.map((c) => {
            const active = c.id === city;
            const count = hotels.filter((h) => h.city === c.id).length;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => pickCity(c.id)}
                className={cn(
                  "relative flex items-center gap-4 overflow-hidden rounded-3xl border p-5 text-left transition",
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
                <span className="flex-1">
                  <span className="block text-xl font-extrabold">{c.name}</span>
                  <span className={cn("block text-sm", active ? "text-white/70" : "text-muted-foreground")}>
                    Hotels near {c.landmark}
                  </span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    active ? "bg-white/15 text-white" : "bg-white text-navy"
                  )}
                >
                  {count} hotels
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2" aria-label="Filter by rating">
            <FilterChip active={stars === "all"} onClick={() => setStars("all")}>
              All ratings
            </FilterChip>
            {starOptions.map((s) => (
              <FilterChip key={s} active={stars === s} onClick={() => setStars(s)}>
                {s}
                <Star className="size-3.5 fill-current" />
              </FilterChip>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-navy">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <span className="sr-only">Sort hotels</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {HOTELS_ARE_PLACEHOLDER && (
          <p className="mt-5 flex items-start gap-2 rounded-2xl border border-cta/30 bg-cta/10 px-4 py-3 text-sm text-navy">
            <Info className="mt-0.5 size-4 shrink-0 text-cta" />
            Sample rates shown for illustration. Prices change by season and availability, so
            message us for today&apos;s rate.
          </p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Showing <span className="font-bold text-navy">{list.length}</span> hotels in {activeCity.name}.
          Distances are approximate walking distance to the nearest gate of {activeCity.landmark}.
        </p>

        {/* Hotels */}
        <motion.div layout className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((h, i) => (
              <HotelCard key={h.id} hotel={h} landmark={activeCity.landmark} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-semibold transition",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-white text-navy hover:border-primary/50"
      )}
    >
      {children}
    </button>
  );
}

function HotelCard({ hotel: h, landmark, index }: { hotel: Hotel; landmark: string; index: number }) {
  const { openWith } = useInquire();
  const cityName = HOTEL_CITIES.find((c) => c.id === h.city)!.name;
  const message = `Assalam o Alaikum, I'd like a rate for ${h.name} in ${cityName}.`;
  // Proximity meter: full at 0 m, empty at 3 km.
  const closeness = Math.max(0.06, 1 - h.distanceM / 3000);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04 } }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-white transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
    >
      <HotelPhoto hotel={h} className="h-44" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px" />

      {/* Header */}
      <div className="relative bg-gradient-to-br from-navy to-primary p-5 text-white">
        <h3 className="text-lg font-bold leading-snug">{h.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
          <MapPin className="size-3.5" />
          {h.area}, {cityName}
        </p>

        {/* Distance meter */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              {h.shuttle ? <Bus className="size-3.5" /> : <Footprints className="size-3.5" />}
              {formatDistance(h.distanceM)} to {landmark}
            </span>
            <span className="text-white/70">
              {h.shuttle ? "Shuttle" : `~${walkMinutes(h.distanceM)} min walk`}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${closeness * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-cta"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <ul className="flex flex-wrap gap-2">
          {h.perks.map((p) => (
            <li
              key={p}
              className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-navy"
            >
              <Check className="size-3 text-cta" strokeWidth={3} />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {ROOM_TYPES.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border p-2.5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {r.label}
              </p>
              <p className="mt-1 text-sm font-extrabold text-navy">
                {h.rates[r.id].toLocaleString("en-PK")}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">PKR per room, per night</p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-xl font-extrabold text-primary">{formatPKR(lowestRate(h))}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ask about ${h.name} on WhatsApp`}
              className="grid size-10 place-items-center rounded-full border border-border text-[#25D366] transition hover:border-[#25D366] hover:bg-[#25D366]/10"
            >
              <WhatsAppIcon className="size-5" />
            </a>
            <button
              type="button"
              onClick={() => openWith({ interest: "Hotels", message })}
              className="whitespace-nowrap rounded-full bg-cta px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cta-hover"
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
