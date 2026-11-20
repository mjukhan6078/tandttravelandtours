"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Bus,
  CalendarDays,
  Check,
  FileImage,
  Info,
  Landmark,
  Plane,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site/contact";
import {
  PACKAGE_INCLUDES,
  PACKAGE_SEASON,
  PACKAGE_SHARING,
  SHOW_SEASON_NOTICE,
  umrahPackages,
  type PackageHotel,
  type PackageSharing,
  type PackageTier,
  type UmrahPackage,
} from "@/lib/site/umrah-packages";
import { useInquire } from "./InquireContext";
import { WhatsAppIcon } from "./icons";

const durations = [...new Set(umrahPackages.map((p) => p.days))].sort((a, b) => a - b);

const tierStyle: Record<PackageTier, string> = {
  Economy: "bg-secondary text-primary",
  Standard: "bg-brand-cyan/15 text-brand-cyan",
  Comfort: "bg-primary/10 text-primary",
  Premium: "bg-cta text-white",
};

const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export default function UmrahPackages() {
  const [days, setDays] = useState<number | "all">("all");
  const [sharing, setSharing] = useState<PackageSharing>("quad");
  const [flyer, setFlyer] = useState<UmrahPackage | null>(null);
  const closeFlyer = useCallback(() => setFlyer(null), []);

  const list = useMemo(() => {
    const filtered = days === "all" ? umrahPackages : umrahPackages.filter((p) => p.days === days);
    return [...filtered].sort(
      (a, b) => (a.prices[sharing] ?? Infinity) - (b.prices[sharing] ?? Infinity)
    );
  }, [days, sharing]);

  return (
    <section className="bg-white pb-20 pt-8 md:pb-28">
      <div className="container-site">
        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Duration</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip active={days === "all"} onClick={() => setDays("all")}>
                All
              </Chip>
              {durations.map((d) => (
                <Chip key={d} active={days === d} onClick={() => setDays(d)}>
                  {d} days
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Room sharing
            </p>
            <div className="mt-2 flex gap-1 rounded-full bg-surface p-1" role="group" aria-label="Room sharing">
              {PACKAGE_SHARING.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={sharing === s.id}
                  title={`${s.perRoom} people per room`}
                  onClick={() => setSharing(s.id)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                    sharing === s.id ? "bg-primary text-white shadow-sm" : "text-navy/70 hover:text-navy"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {SHOW_SEASON_NOTICE && (
          <p className="mt-5 flex items-start gap-2 rounded-2xl border border-cta/30 bg-cta/10 px-4 py-3 text-sm text-navy">
            <Info className="mt-0.5 size-4 shrink-0 text-cta" />
            Prices are from our {PACKAGE_SEASON} packages. Dates and rates change every season, so
            message us for the latest offer.
          </p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          {list.length} packages · prices per person in{" "}
          <span className="font-semibold text-navy">
            {PACKAGE_SHARING.find((s) => s.id === sharing)!.label.toLowerCase()}
          </span>{" "}
          sharing, lowest first
        </p>

        <motion.div layout className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <PackageCard key={p.id} pkg={p} sharing={sharing} onFlyer={() => setFlyer(p)} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Build your own */}
        <div className="mt-14 flex flex-col items-start gap-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-primary p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-cta">
              <Sparkles className="size-7" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">Want different dates or hotels?</h2>
              <p className="mt-1 max-w-xl text-white/75">
                Build your own Umrah: pick your route, hotels, travellers and transport, and see an
                estimate instantly.
              </p>
            </div>
          </div>
          <Link
            href="/umrah-planner"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-bold shadow-xl shadow-cta/30 transition hover:bg-cta-hover"
          >
            Open Umrah builder
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <FlyerModal pkg={flyer} onClose={closeFlyer} />
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
        active ? "border-primary bg-primary text-white" : "border-border bg-white text-navy hover:border-primary/50"
      )}
    >
      {children}
    </button>
  );
}

function HotelRow({ city, hotel }: { city: string; hotel: PackageHotel }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-primary">
        {city === "Makkah" ? <Landmark className="size-4" /> : <Building2 className="size-4" />}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{city}</p>
        <p className="font-semibold leading-snug text-navy">{hotel.name}</p>
        {(hotel.distance || hotel.shuttle) && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            {hotel.shuttle && <Bus className="size-3.5 text-cta" />}
            {[hotel.distance, hotel.shuttle && "shuttle service"].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

function PackageCard({
  pkg: p,
  sharing,
  onFlyer,
}: {
  pkg: UmrahPackage;
  sharing: PackageSharing;
  onFlyer: () => void;
}) {
  const { openWith } = useInquire();
  const price = p.prices[sharing];
  const sharingLabel = PACKAGE_SHARING.find((s) => s.id === sharing)!.label;
  const hotels = p.makkah.shuttle && p.madinah.shuttle ? "shuttle hotels" : `${p.makkah.name} / ${p.madinah.name}`;
  const message = `Assalam o Alaikum, I'm interested in the ${p.days}-day ${p.tier} Umrah package (${hotels}), ${sharingLabel.toLowerCase()} sharing. Please share the latest dates and price.`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border bg-white transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
        p.tier === "Premium" ? "border-cta/50" : "border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-2xl bg-navy text-white">
            <span className="text-center leading-none">
              <span className="block text-xl font-extrabold">{p.days}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/70">days</span>
            </span>
          </span>
          <div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", tierStyle[p.tier])}>{p.tier}</span>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy">
              <Plane className="size-4 text-primary" />
              {p.airline}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onFlyer}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-primary hover:text-primary"
        >
          <FileImage className="size-3.5" />
          Flyer
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-4">
          <HotelRow city="Makkah" hotel={p.makkah} />
          <HotelRow city="Madinah" hotel={p.madinah} />
        </div>

        {(p.flights || p.departure) && (
          <div className="mt-4 rounded-2xl bg-surface p-3 text-xs text-navy">
            {p.departure && (
              <p className="flex items-center gap-1.5 font-semibold">
                <CalendarDays className="size-3.5 text-primary" />
                Departure: {p.departure}
              </p>
            )}
            {p.flights?.map((f) => (
              <p key={f} className="flex items-center gap-1.5 font-medium">
                <Plane className="size-3.5 text-primary" />
                {f}
              </p>
            ))}
          </div>
        )}

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {PACKAGE_INCLUDES.map((i) => (
            <li key={i} className="inline-flex items-center gap-1 text-xs font-medium text-foreground/75">
              <Check className="size-3 text-cta" strokeWidth={3} />
              {i}
            </li>
          ))}
        </ul>

        {/* All sharing prices */}
        <div className="mt-5 grid grid-cols-4 gap-1.5">
          {PACKAGE_SHARING.map((s) => {
            const v = p.prices[s.id];
            const active = s.id === sharing;
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-xl px-1 py-2 text-center transition",
                  active ? "bg-primary text-white" : "bg-surface text-navy"
                )}
              >
                <p className={cn("text-[10px] font-semibold uppercase", active ? "text-white/75" : "text-muted-foreground")}>
                  {s.label}
                </p>
                <p className="mt-0.5 text-xs font-bold">{v ? `${Math.round(v / 1000)}k` : "—"}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-muted-foreground">{sharingLabel} · per person</p>
            {price ? (
              <p className="text-2xl font-extrabold text-primary">{pkr(price)}</p>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground">Not offered in {sharingLabel.toLowerCase()}</p>
            )}
          </div>
          <div className="flex gap-2">
            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ask about this package on WhatsApp"
              className="grid size-10 place-items-center rounded-full border border-border text-[#25D366] transition hover:border-[#25D366] hover:bg-[#25D366]/10"
            >
              <WhatsAppIcon className="size-5" />
            </a>
            <button
              type="button"
              onClick={() => openWith({ interest: "Umrah", message })}
              className="rounded-full bg-cta px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cta-hover"
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function FlyerModal({ pkg, onClose }: { pkg: UmrahPackage | null; onClose: () => void }) {
  useEffect(() => {
    if (!pkg) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [pkg, onClose]);

  return (
    <AnimatePresence>
      {pkg && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/90 p-4 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Package flyer"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          <motion.div
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            className="relative h-[85vh] w-[min(92vw,calc(85vh*0.72))] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={pkg.flyer}
              alt={`${pkg.days}-day ${pkg.tier} Umrah package flyer`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
