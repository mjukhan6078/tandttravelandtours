"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Bus,
  Car,
  Check,
  Clock,
  Info,
  MapPin,
  Minus,
  Plus,
  Route,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site/contact";
import {
  MAX_PASSENGERS,
  ROUTE_GROUPS,
  TRANSPORT_IS_PLACEHOLDER,
  transportRoutes,
  transportVehicles,
  type RouteGroup,
  type TransportRoute,
  type TransportVehicle,
} from "@/lib/site/transport";
import { useInquire } from "./InquireContext";
import { WhatsAppIcon } from "./icons";

const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString("en-PK")}`;
const largest = Math.max(...transportVehicles.map((v) => v.seats));

export default function TransportBrowser() {
  const [group, setGroup] = useState<RouteGroup>("airport");
  const [routeId, setRouteId] = useState(transportRoutes[0].id);
  const [passengers, setPassengers] = useState(4);

  const groupRoutes = transportRoutes.filter((r) => r.group === group);
  const route = transportRoutes.find((r) => r.id === routeId)!;

  // Cheapest vehicle that seats everyone.
  const bestFit = useMemo(() => {
    const fitting = transportVehicles.filter((v) => v.seats >= passengers);
    return fitting.sort((a, b) => route.rates[a.id] - route.rates[b.id])[0]?.id;
  }, [passengers, route]);

  function pickGroup(g: RouteGroup) {
    setGroup(g);
    setRouteId(transportRoutes.find((r) => r.group === g)!.id);
  }

  return (
    <section className="bg-white pb-20 pt-8 md:pb-28">
      <div className="container-site">
        {/* Step 1: route */}
        <StepLabel n={1} title="Choose your route" />
        <div role="tablist" aria-label="Route type" className="mt-4 flex flex-wrap gap-2">
          {ROUTE_GROUPS.map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={group === g.id}
              onClick={() => pickGroup(g.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                group === g.id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-navy hover:border-primary/50",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groupRoutes.map((r) => {
            const active = r.id === routeId;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={active}
                onClick={() => setRouteId(r.id)}
                className={cn(
                  "rounded-3xl border p-5 text-left transition",
                  active
                    ? "border-transparent bg-navy text-white shadow-xl shadow-navy/20"
                    : "border-border bg-surface text-navy hover:border-primary/40",
                )}
              >
                <span className="flex items-center gap-2 text-base font-bold">
                  {r.from}
                  <ArrowRight className={cn("size-4 shrink-0", active ? "text-cta" : "text-primary")} />
                  {r.to}
                </span>
                <span
                  className={cn(
                    "mt-2 flex items-center gap-3 text-sm",
                    active ? "text-white/70" : "text-muted-foreground",
                  )}
                >
                  {r.distanceKm && (
                    <span className="flex items-center gap-1">
                      <Route className="size-3.5" />
                      {r.distanceKm} km
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {r.duration}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <RouteStrip route={route} />

        {/* Step 2: passengers */}
        <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <StepLabel n={2} title="How many passengers?" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Fewer passengers"
              disabled={passengers <= 1}
              onClick={() => setPassengers((p) => Math.max(1, p - 1))}
              className="grid size-11 place-items-center rounded-full border border-border text-navy transition hover:border-primary disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="flex min-w-28 items-center justify-center gap-2 rounded-full bg-surface px-5 py-2.5 text-lg font-extrabold text-navy">
              <Users className="size-5 text-primary" />
              <span aria-live="polite">{passengers}</span>
            </span>
            <button
              type="button"
              aria-label="More passengers"
              disabled={passengers >= MAX_PASSENGERS}
              onClick={() => setPassengers((p) => Math.min(MAX_PASSENGERS, p + 1))}
              className="grid size-11 place-items-center rounded-full border border-border text-navy transition hover:border-primary disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {TRANSPORT_IS_PLACEHOLDER && (
          <p className="mt-6 flex items-start gap-2 rounded-2xl border border-cta/30 bg-cta/10 px-4 py-3 text-sm text-navy">
            <Info className="mt-0.5 size-4 shrink-0 text-cta" />
            Sample rates shown for illustration. Prices change by season, so message us for today&apos;s rate.
          </p>
        )}

        {passengers > largest && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-primary/20 bg-secondary px-4 py-3 text-sm text-navy">
            <Users className="mt-0.5 size-4 shrink-0 text-primary" />
            {`Groups of more than ${largest} need more than one vehicle. Send us your group size and we'll arrange the right mix.`}
          </p>
        )}

        {/* Vehicles */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {transportVehicles.map((v, i) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              route={route}
              passengers={passengers}
              best={v.id === bestFit}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepLabel({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-extrabold text-navy md:text-2xl">
      <span className="grid size-9 place-items-center rounded-full bg-cta text-sm text-white">{n}</span>
      {title}
    </h2>
  );
}

function RouteStrip({ route }: { route: TransportRoute }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={route.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="mt-5 rounded-3xl bg-gradient-to-br from-navy to-primary p-6 text-white md:p-8"
      >
        <div className="flex items-center gap-3 md:gap-5">
          <Stop label="From" place={route.from} />
          <div className="relative flex-1">
            <div className="h-0.5 w-full border-t-2 border-dashed border-white/30" />
            <motion.span
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cta shadow-lg shadow-cta/40"
            >
              <Car className="size-4" />
            </motion.span>
          </div>
          <Stop label="To" place={route.to} alignEnd />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          {route.distanceKm && (
            <span className="flex items-center gap-1.5">
              <Route className="size-4 text-brand-cyan" />
              {route.distanceKm} km
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-brand-cyan" />
            {route.duration}
          </span>
          <span className="flex items-start gap-1.5">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-cyan" />
            {route.note}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Stop({ label, place, alignEnd }: { label: string; place: string; alignEnd?: boolean }) {
  return (
    <div className={cn("max-w-[40%] shrink-0", alignEnd && "text-right")}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cta">{label}</p>
      <p
        className={cn(
          "mt-1 flex items-center gap-1.5 text-base font-bold md:text-xl",
          alignEnd && "justify-end",
        )}
      >
        <MapPin className="hidden size-4 shrink-0 sm:block" />
        {place}
      </p>
    </div>
  );
}

function VehicleCard({
  vehicle: v,
  route,
  passengers,
  best,
  index,
}: {
  vehicle: TransportVehicle;
  route: TransportRoute;
  passengers: number;
  best: boolean;
  index: number;
}) {
  const { openWith } = useInquire();
  const fits = v.seats >= passengers;
  const price = route.rates[v.id];
  const Icon = v.seats > 7 ? Bus : Car;
  const message = `Assalam o Alaikum, I'd like a ${v.name} (${v.model}) for ${route.from} → ${route.to}, ${passengers} passenger${passengers > 1 ? "s" : ""}.`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.06 }}
      className="relative"
    >
      <div
        className={cn(
          "flex h-full flex-col rounded-3xl border bg-white p-6 transition duration-300",
          best
            ? "border-cta shadow-xl shadow-cta/15"
            : "border-border hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
          !fits && "opacity-50 grayscale-[40%]",
        )}
      >
        {best && (
          <span className="absolute -top-3 left-6 rounded-full bg-cta px-3 py-1 text-xs font-bold text-white">
            Best fit for {passengers}
          </span>
        )}

        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "grid size-14 place-items-center rounded-2xl",
              best ? "bg-cta/10 text-cta" : "bg-secondary text-primary",
            )}
          >
            <Icon className="size-7" />
          </span>
          <div className="flex gap-2 text-xs font-semibold text-navy">
            <span className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
              <Users className="size-3.5 text-primary" />
              {v.seats}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
              <Briefcase className="size-3.5 text-primary" />
              {v.bags}
            </span>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-bold text-navy">{v.name}</h3>
        <p className="text-sm text-muted-foreground">{v.model}</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {v.perks.map((p) => (
            <li
              key={p}
              className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-navy"
            >
              <Check className="size-3 text-cta" strokeWidth={3} />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {route.group === "ziaraat" ? "Per vehicle, full tour" : "Per vehicle, one way"}
              </p>
              <p className="text-xl font-extrabold text-primary">{pkr(price)}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {fits ? `≈ ${pkr(price / passengers)} per person` : `Seats up to ${v.seats}`}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={waLink(message)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ask about the ${v.name} on WhatsApp`}
                className="grid size-10 place-items-center rounded-full border border-border text-[#25D366] transition hover:border-[#25D366] hover:bg-[#25D366]/10"
              >
                <WhatsAppIcon className="size-5" />
              </a>
              <button
                type="button"
                onClick={() => openWith({ interest: "Transport", message })}
                className="rounded-full bg-cta px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cta-hover"
              >
                Book now
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
