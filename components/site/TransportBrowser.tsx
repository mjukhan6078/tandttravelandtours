"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Bus, Car, Check, ChevronDown, Clock, Info, MapPin, Minus, Plus, Route, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site/contact";
import {
  MAX_PASSENGERS,
  TRANSPORT_IS_PLACEHOLDER,
  findTransfer,
  suggestNextTransfer,
  transferById,
  transferDestinations,
  transferStarts,
  transportRoutes,
  transportVehicles,
  type TransferOption,
  type TransportVehicle,
  type VehicleId,
} from "@/lib/site/transport";
import { useInquire } from "./InquireContext";
import { WhatsAppIcon } from "./icons";

const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString("en-PK")}`;
const largest = Math.max(...transportVehicles.map((v) => v.seats));
const mostBags = Math.max(...transportVehicles.map((v) => v.bags));
const MAX_LUGGAGE = 60;
const routeById = (id: string) => transportRoutes.find((r) => r.id === id)!;

type Leg = { key: number; optionId: string };

const MAX_LEGS = 8;

export default function TransportBrowser() {
  const [legs, setLegs] = useState<Leg[]>([{ key: 0, optionId: "jed-makkah" }]);
  const [nextKey, setNextKey] = useState(1);
  const [passengers, setPassengers] = useState(4);
  const [luggage, setLuggage] = useState(4);

  const transfers = legs.map((l) => transferById(l.optionId));
  const legRates = (v: VehicleId) => transfers.map((t) => routeById(t.routeId).rates[v]);
  const totalFor = (v: VehicleId) => legRates(v).reduce((a, b) => a + b, 0);

  // Cheapest vehicle that seats everyone.
  const bestFit = transportVehicles
    .filter((v) => v.seats >= passengers && v.bags >= luggage)
    .sort((a, b) => totalFor(a.id) - totalFor(b.id))[0]?.id;

  function addLeg() {
    const next = suggestNextTransfer(transfers[transfers.length - 1]);
    setLegs((l) => [...l, { key: nextKey, optionId: next.id }]);
    setNextKey((k) => k + 1);
  }
  const changeLeg = (key: number, optionId: string) =>
    setLegs((l) => l.map((leg) => (leg.key === key ? { ...leg, optionId } : leg)));
  const removeLeg = (key: number) => setLegs((l) => l.filter((leg) => leg.key !== key));

  return (
    <section className="bg-white pb-20 pt-8 md:pb-28">
      <div className="container-site">
        {/* Step 1: transfers */}
        <StepLabel n={1} title="Plan your transfers" />
        <p className="mt-2 text-muted-foreground">
          Start with your first transfer, then add as many as you need: between cities, to the airport or a
          ziaraat tour.
        </p>

        <div className="mt-5 rounded-3xl bg-gradient-to-br from-navy to-primary p-6 text-white md:p-8">
          <ol className="divide-y divide-white/15">
            <AnimatePresence initial={false}>
              {legs.map((leg, i) => (
                <motion.li
                  key={leg.key}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative py-6 first:pt-0 last:pb-0"
                >
                  <LegStrip
                    index={i}
                    count={legs.length}
                    transfer={transferById(leg.optionId)}
                    onChange={(id) => changeLeg(leg.key, id)}
                    onRemove={() => removeLeg(leg.key)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          <button
            type="button"
            onClick={addLeg}
            disabled={legs.length >= MAX_LEGS}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/25 py-3.5 text-sm font-bold text-white transition hover:border-cta hover:bg-white/5 disabled:opacity-40"
          >
            <span className="grid size-7 place-items-center rounded-full bg-cta text-white shadow-lg shadow-cta/40">
              <Plus className="size-4" />
            </span>
            {legs.length >= MAX_LEGS ? `Up to ${MAX_LEGS} transfers` : "Add another transfer"}
          </button>
        </div>

        {/* Step 2: passengers and luggage */}
        <div className="mt-12">
          <StepLabel n={2} title="Passengers and luggage" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Counter
              icon={Users}
              label="Passengers"
              hint="Adults and children"
              value={passengers}
              min={1}
              max={MAX_PASSENGERS}
              onChange={setPassengers}
            />
            <Counter
              icon={Briefcase}
              label="Luggage"
              hint="Large suitcases"
              value={luggage}
              min={0}
              max={MAX_LUGGAGE}
              onChange={setLuggage}
            />
          </div>
        </div>

        {TRANSPORT_IS_PLACEHOLDER && (
          <p className="mt-6 flex items-start gap-2 rounded-2xl border border-cta/30 bg-cta/10 px-4 py-3 text-sm text-navy">
            <Info className="mt-0.5 size-4 shrink-0 text-cta" />
            Sample rates shown for illustration. Prices change by season, so message us for today&apos;s rate.
          </p>
        )}

        {(passengers > largest || luggage > mostBags) && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-primary/20 bg-secondary px-4 py-3 text-sm text-navy">
            <Users className="mt-0.5 size-4 shrink-0 text-primary" />
            {`That's more than one vehicle can take (up to ${largest} passengers and ${mostBags} bags). Send us your group size and luggage and we'll arrange the right mix.`}
          </p>
        )}

        {/* Step 3: vehicle */}
        <div className="mt-12">
          <StepLabel n={3} title="Choose your vehicle" />
          <p className="mt-2 text-muted-foreground">
            {transfers.length === 1
              ? "Prices are per vehicle for this transfer."
              : `Prices are per vehicle for all ${transfers.length} transfers together.`}
          </p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {transportVehicles.map((v, i) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              transfers={transfers}
              price={totalFor(v.id)}
              passengers={passengers}
              luggage={luggage}
              best={v.id === bestFit}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** One transfer: From → To with a moving car, then distance, time and a note. */
function LegStrip({
  index,
  count,
  transfer: t,
  onChange,
  onRemove,
}: {
  index: number;
  count: number;
  transfer: TransferOption;
  onChange: (optionId: string) => void;
  onRemove: () => void;
}) {
  return (
    <>
      {count > 1 && (
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
            Transfer {index + 1}
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove transfer ${index + 1}`}
            className="grid size-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:gap-5">
        <Place
          label="From"
          ariaLabel={`Transfer ${index + 1} from`}
          value={t.from}
          options={transferStarts}
          onChange={(from) => onChange(findTransfer(from, t.to).id)}
        />
        {/* Phones: vertical connector */}
        <div className="flex items-center gap-3 pl-1 sm:hidden" aria-hidden>
          <span className="h-6 border-l-2 border-dashed border-white/30" />
          <span className="grid size-8 place-items-center rounded-full bg-cta shadow-lg shadow-cta/40">
            <Car className="size-4" />
          </span>
        </div>
        <div className="relative hidden flex-1 sm:block" aria-hidden>
          <div className="h-0.5 w-full border-t-2 border-dashed border-white/30" />
          <motion.span
            key={t.id}
            initial={{ left: "0%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cta shadow-lg shadow-cta/40"
          >
            <Car className="size-4" />
          </motion.span>
        </div>
        <Place
          label="To"
          ariaLabel={`Transfer ${index + 1} to`}
          value={t.to}
          options={transferDestinations(t.from).map((o) => o.to)}
          onChange={(to) => onChange(findTransfer(t.from, to).id)}
          alignEnd
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
        {t.distanceKm && (
          <span className="flex items-center gap-1.5">
            <Route className="size-4 text-brand-cyan" />
            {t.distanceKm} km
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="size-4 text-brand-cyan" />
          {t.duration}
        </span>
        <span className="flex items-start gap-1.5">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-cyan" />
          {t.note}
        </span>
      </div>
    </>
  );
}

/** "From"/"To" with a place name that opens a native dropdown (the select sits invisibly on top). */
function Place({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  alignEnd,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  alignEnd?: boolean;
}) {
  return (
    <div className={cn("shrink-0 sm:max-w-[42%]", alignEnd && "sm:text-right")}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cta">{label}</p>
      <div
        className={cn(
          "relative mt-1 inline-flex items-center gap-1.5 rounded-lg text-base font-bold transition focus-within:ring-2 focus-within:ring-cta hover:text-cta md:text-xl",
        )}
      >
        <MapPin className="size-4 shrink-0" aria-hidden />
        {value}
        <ChevronDown className="size-4 shrink-0 text-white/60" aria-hidden />
        <select
          aria-label={ariaLabel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Counter({
  icon: Icon,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  icon: typeof Users;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-navy">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid size-10 place-items-center rounded-full border border-border bg-white text-navy transition hover:border-primary disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-8 text-center text-lg font-extrabold text-navy" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="grid size-10 place-items-center rounded-full border border-border bg-white text-navy transition hover:border-primary disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
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

function VehicleCard({
  vehicle: v,
  transfers,
  price,
  passengers,
  luggage,
  best,
  index,
}: {
  vehicle: TransportVehicle;
  transfers: TransferOption[];
  price: number;
  passengers: number;
  luggage: number;
  best: boolean;
  index: number;
}) {
  const { openWith } = useInquire();
  const seatsOk = v.seats >= passengers;
  const bagsOk = v.bags >= luggage;
  const fits = seatsOk && bagsOk;
  const Icon = v.seats > 7 ? Bus : Car;
  const pax = `${passengers} passenger${passengers > 1 ? "s" : ""}${
    luggage ? ` and ${luggage} bag${luggage > 1 ? "s" : ""}` : ", no large luggage"
  }`;
  const message =
    transfers.length === 1
      ? `Assalam o Alaikum, I'd like a ${v.name} (${v.model}) for ${transfers[0].from} → ${transfers[0].to}, ${pax}.`
      : `Assalam o Alaikum, I'd like a ${v.name} (${v.model}) for ${pax}, for these transfers:\n${transfers
          .map((t, i) => `${i + 1}. ${t.from} → ${t.to}`)
          .join("\n")}`;
  const priceLabel =
    transfers.length > 1
      ? `Per vehicle, ${transfers.length} transfers`
      : transfers[0].group === "ziaraat"
        ? "Per vehicle, full tour"
        : "Per vehicle, one way";

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
            Best fit{luggage ? ` for ${passengers} + ${luggage} bags` : ` for ${passengers}`}
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{priceLabel}</p>
              <p className="text-xl font-extrabold text-primary">{pkr(price)}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {fits
                  ? `≈ ${pkr(price / passengers)} per person`
                  : !seatsOk
                    ? `Seats up to ${v.seats}`
                    : `Takes up to ${v.bags} bags`}
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
                className="whitespace-nowrap rounded-full bg-cta px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cta-hover"
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
