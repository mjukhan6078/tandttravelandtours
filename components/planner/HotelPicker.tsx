"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Building2, Bus, Check, Coffee, Footprints, MapPin, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROOM_TYPES, formatDistance, formatPKR, lowestRate, walkMinutes, type Hotel } from "@/lib/site/hotels";
import { breakfastIncluded, hotelsIn, type CityId } from "@/lib/site/pricing";

type SortKey = "distance" | "price" | "rating";

const CITY_LANDMARK: Record<CityId, string> = {
  makkah: "Masjid al-Haram",
  madinah: "Masjid an-Nabawi",
};

/** Selected-hotel profile shown in the builder, with a button to open the picker. */
export function HotelSummary({ hotel, onChange }: { hotel: Hotel; onChange: () => void }) {
  return (
    <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-navy to-primary p-4 text-white sm:flex-row sm:items-center">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
        <Building2 className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold leading-snug">{hotel.name}</p>
          <span className="flex" aria-label={`${hotel.stars} star hotel`}>
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-cta text-cta" />
            ))}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {hotel.area}
          </span>
          <span className="flex items-center gap-1">
            {hotel.shuttle ? <Bus className="size-3.5" /> : <Footprints className="size-3.5" />}
            {formatDistance(hotel.distanceM)} ·{" "}
            {hotel.shuttle ? "shuttle" : `~${walkMinutes(hotel.distanceM)} min walk`}
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-cta hover:text-white"
      >
        Change hotel
      </button>
    </div>
  );
}

/** Popup listing hotel profiles in a city; picking one closes it. */
export function HotelPickerModal({
  city,
  open,
  selectedId,
  onSelect,
  onClose,
}: {
  city: CityId;
  open: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [stars, setStars] = useState<number | "all">("all");
  const [sort, setSort] = useState<SortKey>("distance");

  const all = useMemo(() => hotelsIn(city), [city]);
  const starOptions = useMemo(() => [...new Set(all.map((h) => h.stars))].sort((a, b) => b - a), [all]);
  const list = useMemo(() => {
    const filtered = stars === "all" ? all : all.filter((h) => h.stars === stars);
    return [...filtered].sort((a, b) => {
      if (sort === "price") return lowestRate(a) - lowestRate(b);
      if (sort === "rating") return b.stars - a.stars || a.distanceM - b.distanceM;
      return a.distanceM - b.distanceM;
    });
  }, [all, stars, sort]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const cityName = city === "makkah" ? "Makkah" : "Madinah";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/60 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Choose a hotel in ${cityName}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            {/* Header */}
            <div className="border-b border-border p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">{cityName}</p>
                  <h2 className="mt-1 text-xl font-extrabold text-navy">Choose your hotel</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Distances are approximate walking distance to {CITY_LANDMARK[city]}.
                  </p>
                </div>
                <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2" aria-label="Filter by rating">
                  {(["all", ...starOptions] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={stars === s}
                      onClick={() => setStars(s)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                        stars === s
                          ? "border-primary bg-primary text-white"
                          : "border-border text-navy hover:border-primary/50",
                      )}
                    >
                      {s === "all" ? "All" : s}
                      {s !== "all" && <Star className="size-3.5 fill-current" />}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <ArrowUpDown className="size-4 text-muted-foreground" />
                  <span className="sr-only">Sort hotels</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="distance">Nearest first</option>
                    <option value="price">Lowest price</option>
                    <option value="rating">Highest rating</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Profiles */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface p-4 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {list.map((h) => (
                  <HotelProfile
                    key={h.id}
                    hotel={h}
                    selected={h.id === selectedId}
                    onSelect={() => {
                      onSelect(h.id);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HotelProfile({ hotel: h, selected, onSelect }: { hotel: Hotel; selected: boolean; onSelect: () => void }) {
  const closeness = Math.max(0.06, 1 - h.distanceM / 3000);
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border-2 bg-white transition",
        selected ? "border-cta shadow-lg shadow-cta/15" : "border-transparent hover:border-primary/30",
      )}
    >
      <div className="relative bg-gradient-to-br from-navy to-primary p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10">
            <Building2 className="size-5" />
          </span>
          <span
            className="flex items-center gap-0.5 rounded-full bg-white/10 px-2 py-1"
            aria-label={`${h.stars} star hotel`}
          >
            {Array.from({ length: h.stars }).map((_, i) => (
              <Star key={i} className="size-3 fill-cta text-cta" />
            ))}
          </span>
        </div>
        <h3 className="mt-3 font-bold leading-snug">{h.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
          <MapPin className="size-3.5" />
          {h.area}
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="flex items-center gap-1">
              {h.shuttle ? <Bus className="size-3.5" /> : <Footprints className="size-3.5" />}
              {formatDistance(h.distanceM)}
            </span>
            <span className="text-white/70">{h.shuttle ? "Shuttle" : `~${walkMinutes(h.distanceM)} min walk`}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-cta"
              style={{ width: `${closeness * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <ul className="flex flex-wrap gap-1.5">
          {h.perks.map((p) => (
            <li
              key={p}
              className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-navy"
            >
              {p.toLowerCase().includes("breakfast") ? (
                <Coffee className="size-3 text-cta" />
              ) : (
                <Check className="size-3 text-cta" strokeWidth={3} />
              )}
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {ROOM_TYPES.map((r) => (
            <div key={r.id} className="rounded-xl border border-border px-1 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">{r.label}</p>
              <p className="mt-0.5 text-xs font-extrabold text-navy">{h.rates[r.id].toLocaleString("en-PK")}</p>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          PKR per room, per night{breakfastIncluded(h) ? " · breakfast included" : ""}
        </p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[11px] text-muted-foreground">From</p>
            <p className="font-extrabold text-primary">{formatPKR(lowestRate(h))}</p>
          </div>
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition",
              selected ? "bg-emerald-600 text-white" : "bg-cta text-white hover:bg-cta-hover",
            )}
          >
            {selected && <Check className="size-4" strokeWidth={3} />}
            {selected ? "Selected" : "Select hotel"}
          </button>
        </div>
      </div>
    </article>
  );
}
