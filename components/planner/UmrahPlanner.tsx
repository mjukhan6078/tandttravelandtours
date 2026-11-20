"use client";

import { Fragment, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedSingle,
  Bus,
  CalendarDays,
  Check,
  ChevronUp,
  CircleCheck,
  Info,
  Landmark,
  LoaderCircle,
  Minus,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  Send,
  Shuffle,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import {
  ADDONS,
  BOOKING,
  CITY_LABEL,
  COMFORT_LEVELS,
  HOTEL_TIERS,
  PRICING_IS_PLACEHOLDER,
  SHARING_OPTIONS,
  VEHICLES,
  buildLegs,
  calculateQuote,
  defaultNights,
  formatPKR,
  type CityId,
  type PlannerState,
} from "@/lib/site/pricing";
import { waLink } from "@/lib/site/contact";
import { WhatsAppIcon } from "@/components/site/icons";
import { AnimatedPKR, Stars } from "./PlannerParts";
import { cn } from "@/lib/utils";

/* ───────────── helpers ───────────── */

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}
function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const ARABIC: Record<CityId, string> = { makkah: "مكة المكرمة", madinah: "المدينة المنورة" };
const AIRPORT: Record<CityId, string> = { makkah: "JED", madinah: "MED" };

const INITIAL: PlannerState = {
  startCity: "makkah",
  roundTrip: false,
  startDate: "",
  nights: defaultNights("makkah", false),
  adults: 2,
  children: 0,
  infants: 0,
  sharing: "quad",
  hotels: { makkah: "standard", madinah: "standard" },
  vehicleId: "gmc",
  ziaraat: true,
  flights: false,
};

type Quote = ReturnType<typeof calculateQuote>;
type Update = (patch: Partial<PlannerState>) => void;

/* ───────────── main ───────────── */

export default function UmrahPlanner() {
  const [state, setState] = useState<PlannerState>(INITIAL);
  const [requestOpen, setRequestOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);

  const range = useMemo(() => {
    const today = isoDate(new Date());
    return { min: addDays(today, BOOKING.minLeadDays), max: addDays(today, BOOKING.maxAheadDays) };
  }, []);

  const legs = buildLegs(state.startCity, state.roundTrip);
  const totalNights = state.nights.reduce((a, b) => a + b, 0);
  const travellers = state.adults + state.children + state.infants;
  const quote = calculateQuote(state);
  const dateValid = !!state.startDate && state.startDate >= range.min && state.startDate <= range.max;
  const endDate = dateValid ? addDays(state.startDate, totalNights) : "";
  const comfort =
    state.hotels.makkah === state.hotels.madinah
      ? COMFORT_LEVELS.find((c) => c.id === state.hotels.makkah)?.name ?? "Custom"
      : "Custom mix";

  /** Merge a change and keep the chosen vehicle big enough for the group. */
  const update: Update = (patch) =>
    setState((prev) => {
      const next = { ...prev, ...patch };
      const people = next.adults + next.children + next.infants;
      const vehicle = VEHICLES.find((v) => v.id === next.vehicleId);
      if (!vehicle || vehicle.capacity < people) {
        next.vehicleId = (VEHICLES.find((v) => !v.perPerson && v.capacity >= people) ?? VEHICLES[0]).id;
      }
      return next;
    });

  const summaryText = [
    `Journey: Karachi → ${legs.map((c, i) => `${CITY_LABEL[c]} (${state.nights[i]}n)`).join(" → ")} → Karachi`,
    dateValid
      ? `Dates: ${shortDate(state.startDate)} – ${shortDate(endDate)} (${totalNights} nights)`
      : `Dates: flexible (${totalNights} nights)`,
    `Travellers: ${state.adults} adults, ${state.children} children, ${state.infants} infants`,
    `Rooms: ${state.sharing} sharing`,
    `Hotels: Makkah ${state.hotels.makkah}, Madinah ${state.hotels.madinah}`,
    `Transport: ${VEHICLES.find((v) => v.id === state.vehicleId)?.name}`,
    `Ziaraat: ${state.ziaraat ? "yes" : "no"} · Flights: ${state.flights ? "yes" : "no"}`,
    `Estimated total: ${formatPKR(quote.total)} (${formatPKR(quote.perPerson)} per person)`,
  ].join("\n");

  const pass = (
    <BoardingPass
      state={state}
      quote={quote}
      comfort={comfort}
      totalNights={totalNights}
      travellers={travellers}
      endDate={endDate}
      dateValid={dateValid}
      summaryText={summaryText}
      onRequest={() => {
        setPassOpen(false);
        setRequestOpen(true);
      }}
    />
  );

  return (
    <section className="container-site pb-28 pt-4 lg:pb-24">
      <JourneyMap
        state={state}
        update={update}
        legs={legs}
        range={range}
        totalNights={totalNights}
        endDate={endDate}
        dateValid={dateValid}
      />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel index="01" title="Pick your comfort" subtitle="One tap sets hotels in both cities — or mix and match.">
            <ComfortPicker state={state} update={update} />
          </Panel>
          <Panel index="02" title="Who's coming along?" subtitle="Add your travellers and choose how you'd like to share rooms.">
            <Travellers state={state} update={update} />
          </Panel>
          <Panel index="03" title="Getting around" subtitle="Airport transfers and the Makkah ⇄ Madinah drive, plus extras.">
            <Transport state={state} update={update} travellers={travellers} />
          </Panel>
        </div>
        <aside className="hidden lg:sticky lg:top-24 lg:block">{pass}</aside>
      </div>

      {/* Mobile pass bar + sheet */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <AnimatePresence>
          {passOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="max-h-[78vh] overflow-y-auto rounded-t-3xl bg-surface p-4 shadow-2xl"
            >
              {pass}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setPassOpen((v) => !v)}
          aria-expanded={passOpen}
          className="flex w-full items-center justify-between gap-3 bg-navy px-4 py-3 text-left text-white"
        >
          <span className="flex items-center gap-3">
            <Ticket className="size-5 text-cta" />
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/60">
                Your Umrah pass
              </span>
              <AnimatedPKR value={quote.total} className="text-lg font-extrabold" />
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-cta">
            {passOpen ? "Close" : "View pass"}
            <ChevronUp className={cn("size-4 transition", passOpen && "rotate-180")} />
          </span>
        </button>
      </div>

      <RequestDialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        summaryText={summaryText}
        total={quote.total}
      />
    </section>
  );
}

/* ───────────── journey map ───────────── */

function JourneyMap({
  state,
  update,
  legs,
  range,
  totalNights,
  endDate,
  dateValid,
}: {
  state: PlannerState;
  update: Update;
  legs: CityId[];
  range: { min: string; max: string };
  totalNights: number;
  endDate: string;
  dateValid: boolean;
}) {
  const setLeg = (i: number, value: number) => {
    const nights = [...state.nights];
    nights[i] = value;
    update({ nights });
  };
  const setRoute = (startCity: CityId, roundTrip: boolean) =>
    update({ startCity, roundTrip, nights: defaultNights(startCity, roundTrip) });

  return (
    <div className="relative overflow-clip rounded-[2rem] bg-navy p-5 text-white shadow-2xl shadow-navy/30 md:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/50 blur-3xl" aria-hidden />

      {/* controls */}
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Your journey</p>
          <p className="mt-1 text-2xl font-extrabold">
            {totalNights} nights · {legs.length} stops
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full bg-white/10 p-1 text-xs font-semibold" role="radiogroup" aria-label="First city">
            {(["makkah", "madinah"] as CityId[]).map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={state.startCity === c}
                onClick={() => setRoute(c, state.roundTrip)}
                className="relative rounded-full px-4 py-2"
              >
                {state.startCity === c && (
                  <motion.span layoutId="start-city" className="absolute inset-0 rounded-full bg-white" />
                )}
                <span className={cn("relative", state.startCity === c ? "text-navy" : "text-white/80")}>
                  Start in {CITY_LABEL[c]}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.roundTrip}
            onClick={() => setRoute(state.startCity, !state.roundTrip)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ring-1 transition",
              state.roundTrip ? "bg-cta text-white ring-cta" : "text-white/80 ring-white/20 hover:bg-white/10"
            )}
          >
            <Shuffle className="size-3.5" />
            Return to {CITY_LABEL[state.startCity]}
          </button>
        </div>
      </div>

      {/* stops */}
      <div className="relative mt-8 flex flex-col items-stretch gap-0 md:flex-row md:items-center">
        <EndpointStop icon={<PlaneTakeoff className="size-5" />} label="Depart Karachi" sub={`to ${AIRPORT[legs[0]]}`}>
          <label className="mt-2 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15 focus-within:ring-cta">
            <CalendarDays className="size-4 shrink-0 text-cta" />
            <input
              type="date"
              value={state.startDate}
              min={range.min}
              max={range.max}
              onChange={(e) => update({ startDate: e.target.value })}
              className="w-full min-w-0 bg-transparent text-xs font-semibold text-white outline-none [color-scheme:dark]"
              aria-label="Departure date"
              suppressHydrationWarning
            />
          </label>
          {state.startDate && !dateValid && (
            <p className="mt-1 text-[11px] text-red-300" suppressHydrationWarning>
              Choose {shortDate(range.min)} – {shortDate(range.max)}
            </p>
          )}
        </EndpointStop>

        <AnimatePresence initial={false} mode="popLayout">
          {legs.map((city, i) => (
            <Fragment key={`${i}-${city}`}>
              <Connector icon={i === 0 ? <Plane className="size-4" /> : <Bus className="size-4" />} />
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 rounded-2xl bg-white p-4 text-navy shadow-xl md:min-w-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stop {i + 1}</p>
                    <p className="text-lg font-extrabold">{CITY_LABEL[city]}</p>
                  </div>
                  <span className="text-sm text-primary/70" lang="ar" dir="rtl">
                    {ARABIC[city]}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-2 py-1.5">
                  <RoundBtn
                    label={`Fewer nights in ${CITY_LABEL[city]}`}
                    disabled={state.nights[i] <= 1 || totalNights <= BOOKING.minNights}
                    onClick={() => setLeg(i, state.nights[i] - 1)}
                  >
                    <Minus className="size-3.5" />
                  </RoundBtn>
                  <span className="text-center">
                    <span className="block text-xl font-extrabold leading-none">{state.nights[i]}</span>
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">nights</span>
                  </span>
                  <RoundBtn
                    label={`More nights in ${CITY_LABEL[city]}`}
                    disabled={totalNights >= BOOKING.maxNights}
                    onClick={() => setLeg(i, state.nights[i] + 1)}
                  >
                    <Plus className="size-3.5" />
                  </RoundBtn>
                </div>
              </motion.div>
            </Fragment>
          ))}
        </AnimatePresence>

        <Connector icon={<Plane className="size-4" />} />
        <EndpointStop
          icon={<PlaneLanding className="size-5" />}
          label="Back in Karachi"
          sub={`from ${AIRPORT[legs[legs.length - 1]]}`}
        >
          <p className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10">
            {dateValid ? shortDate(endDate) : "Pick a date"}
          </p>
        </EndpointStop>
      </div>
    </div>
  );
}

function EndpointStop({
  icon,
  label,
  sub,
  children,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:w-44 md:shrink-0">
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cta text-white">{icon}</span>
        <span>
          <span className="block text-sm font-bold">{label}</span>
          <span className="block text-[11px] text-white/60">{sub}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function Connector({ icon }: { icon: ReactNode }) {
  return (
    <div className="flex items-center justify-center py-1 text-white/50 md:w-12 md:shrink-0 md:py-0" aria-hidden>
      <span className="h-5 border-l-2 border-dashed border-white/25 md:hidden" />
      <span className="hidden h-0 flex-1 border-t-2 border-dashed border-white/25 md:block" />
      <span className="mx-1 hidden md:block">{icon}</span>
      <span className="hidden h-0 flex-1 border-t-2 border-dashed border-white/25 md:block" />
    </div>
  );
}

function RoundBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-8 place-items-center rounded-full bg-white text-navy shadow-sm ring-1 ring-border transition hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-navy"
    >
      {children}
    </button>
  );
}

/* ───────────── panels ───────────── */

function Panel({
  index,
  title,
  subtitle,
  children,
}: {
  index: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-white p-5 md:p-8">
      <header className="mb-6 flex items-start gap-4">
        <span className="text-3xl font-extrabold leading-none text-primary/15">{index}</span>
        <div>
          <h2 className="text-xl font-extrabold text-navy">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

const COMFORT_STYLE: Record<string, string> = {
  economy: "from-brand-cyan to-primary",
  standard: "from-primary to-navy",
  premium: "from-amber-500 to-cta",
};

function ComfortPicker({ state, update }: { state: PlannerState; update: Update }) {
  const [mix, setMix] = useState(state.hotels.makkah !== state.hotels.madinah);
  const uniform = state.hotels.makkah === state.hotels.madinah;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {COMFORT_LEVELS.map((c) => {
          const tier = HOTEL_TIERS.makkah.find((t) => t.id === c.id);
          const active = uniform && state.hotels.makkah === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => update({ hotels: { makkah: c.id, madinah: c.id } })}
              className={cn(
                "group relative overflow-hidden rounded-3xl border-2 bg-white text-left transition duration-300",
                active ? "border-primary shadow-xl shadow-primary/15" : "border-border hover:-translate-y-1 hover:shadow-lg"
              )}
            >
              <div className={cn("relative h-20 bg-gradient-to-br p-4 text-white", COMFORT_STYLE[c.id])}>
                <span className="text-amber-200">{"★".repeat(tier?.stars ?? 3)}</span>
                <p className="text-lg font-extrabold">{c.name}</p>
                <Landmark className="absolute -bottom-3 -right-2 size-16 text-white/15 transition group-hover:scale-110" />
                {active && (
                  <motion.span
                    layoutId="comfort-check"
                    className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-white text-primary"
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </motion.span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{c.tagline}</p>
                <ul className="mt-3 space-y-1.5">
                  {c.includes.map((x) => (
                    <li key={x} className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                      <span className="size-1.5 rounded-full bg-cta" /> {x}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  Makkah from{" "}
                  <span className="text-sm font-extrabold text-primary">{formatPKR(tier?.rates[state.sharing] ?? 0)}</span>
                  /night
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setMix((v) => !v)}
        aria-expanded={mix}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <Shuffle className="size-4" />
        {mix ? "Hide per-city hotels" : "Mix & match hotels per city"}
      </button>

      <AnimatePresence initial={false}>
        {mix && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(["makkah", "madinah"] as CityId[]).map((city) => {
                const tier = HOTEL_TIERS[city].find((t) => t.id === state.hotels[city]);
                return (
                  <div key={city} className="rounded-2xl bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-navy">{CITY_LABEL[city]}</p>
                      {tier && <Stars count={tier.stars} />}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-white p-1 ring-1 ring-border">
                      {HOTEL_TIERS[city].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          aria-pressed={state.hotels[city] === t.id}
                          onClick={() => update({ hotels: { ...state.hotels, [city]: t.id } })}
                          className={cn(
                            "rounded-lg px-2 py-2 text-xs font-semibold transition",
                            state.hotels[city] === t.id ? "bg-primary text-white" : "text-foreground/70 hover:bg-secondary"
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {tier?.distance} · {formatPKR(tier?.rates[state.sharing] ?? 0)}/night
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Travellers({ state, update }: { state: PlannerState; update: Update }) {
  const rows: {
    key: "adults" | "children" | "infants";
    label: string;
    hint: string;
    min: number;
    max: number;
    size: string;
  }[] = [
    { key: "adults", label: "Adults", hint: "12+ years", min: 1, max: BOOKING.maxTravellers, size: "size-5" },
    { key: "children", label: "Children", hint: "2–11 · half hotel", min: 0, max: 20, size: "size-4" },
    { key: "infants", label: "Infants", hint: "Under 2 · no bed", min: 0, max: 10, size: "size-3.5" },
  ];
  const sharers = state.adults + state.children;
  const perRoom = SHARING_OPTIONS.find((s) => s.id === state.sharing)?.perRoom ?? 4;
  const rooms = Math.ceil(sharers / perRoom);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-3">
        {rows.map((r) => {
          const n = state[r.key];
          const shown = Math.min(n, 10);
          return (
            <div key={r.key} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
              <div className="w-20 shrink-0 sm:w-24">
                <p className="text-sm font-bold text-navy">{r.label}</p>
                <p className="text-[11px] text-muted-foreground">{r.hint}</p>
              </div>
              <div className="flex min-h-6 flex-1 flex-wrap items-end gap-0.5 text-primary">
                <AnimatePresence initial={false}>
                  {Array.from({ length: shown }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, y: 6 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <UserRound className={r.size} strokeWidth={2.5} />
                    </motion.span>
                  ))}
                </AnimatePresence>
                {n > 10 && <span className="ml-1 text-xs font-bold text-primary">+{n - 10}</span>}
                {n === 0 && <span className="text-xs text-muted-foreground">None</span>}
              </div>
              <div className="flex items-center gap-2">
                <RoundBtn label={`Remove one from ${r.label}`} disabled={n <= r.min} onClick={() => update({ [r.key]: n - 1 })}>
                  <Minus className="size-3.5" />
                </RoundBtn>
                <span className="w-6 text-center font-extrabold text-navy">{n}</span>
                <RoundBtn label={`Add one to ${r.label}`} disabled={n >= r.max} onClick={() => update({ [r.key]: n + 1 })}>
                  <Plus className="size-3.5" />
                </RoundBtn>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room sharing</p>
        <div className="grid grid-cols-2 gap-2">
          {SHARING_OPTIONS.map((s) => {
            const active = state.sharing === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => update({ sharing: s.id })}
                className={cn(
                  "rounded-2xl border-2 p-3 text-left transition",
                  active ? "border-primary bg-secondary/60" : "border-border hover:border-primary/40"
                )}
              >
                <span className="flex gap-0.5 text-primary" aria-hidden>
                  {Array.from({ length: s.perRoom }).map((_, i) => (
                    <BedSingle key={i} className="size-4" />
                  ))}
                </span>
                <span className="mt-2 block text-sm font-bold text-navy">{s.label}</span>
                <span className="text-[11px] text-muted-foreground">{s.perRoom} beds per room</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs font-semibold text-primary">
          ≈ {rooms} room{rooms > 1 ? "s" : ""} for {sharers} guest{sharers > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

function Transport({ state, update, travellers }: { state: PlannerState; update: Update; travellers: number }) {
  const best = VEHICLES.find((v) => !v.perPerson && v.capacity >= travellers)?.id;
  return (
    <div>
      <div className="space-y-2.5">
        {VEHICLES.map((v) => {
          const tooSmall = v.capacity < travellers;
          const fill = v.perPerson ? 1 : Math.min(travellers / v.capacity, 1);
          const active = state.vehicleId === v.id;
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={active}
              disabled={tooSmall}
              onClick={() => update({ vehicleId: v.id })}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition md:gap-4 md:p-4",
                active ? "border-primary bg-secondary/50" : "border-border hover:border-primary/40",
                tooSmall && "cursor-not-allowed opacity-45 hover:border-border"
              )}
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl transition",
                  active ? "bg-primary text-white" : "bg-surface text-primary"
                )}
              >
                <Bus className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-navy">{v.name}</span>
                  {v.id === best && (
                    <span className="rounded-full bg-cta/15 px-2 py-0.5 text-[10px] font-bold uppercase text-cta">
                      Best fit
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-surface">
                  <motion.span
                    className={cn("block h-full rounded-full", tooSmall ? "bg-destructive" : "bg-brand-cyan")}
                    initial={false}
                    animate={{ width: `${fill * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {v.perPerson
                    ? "Shared seats · any group size"
                    : tooSmall
                      ? `Only ${v.capacity} seats — you need ${travellers}`
                      : `${travellers} of ${v.capacity} seats used`}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-extrabold text-primary">{formatPKR(v.price)}</span>
                <span className="text-[10px] text-muted-foreground">{v.perPerson ? "per person" : "per package"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Extras</p>
      <div className="flex flex-wrap gap-2">
        <ExtraChip
          active={state.ziaraat}
          onClick={() => update({ ziaraat: !state.ziaraat })}
          label="Guided ziaraat"
          price={`${formatPKR(ADDONS.ziaraat.perPerson)}/person`}
        />
        <ExtraChip
          active={state.flights}
          onClick={() => update({ flights: !state.flights })}
          label="Return flights"
          price={`from ${formatPKR(ADDONS.flights.adult)}`}
        />
      </div>
    </div>
  );
}

function ExtraChip({
  active,
  onClick,
  label,
  price,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  price: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
        active ? "border-cta bg-cta text-white" : "border-border text-navy hover:border-cta/50"
      )}
    >
      <span className={cn("grid size-4 place-items-center rounded-full", active ? "bg-white text-cta" : "ring-1 ring-border")}>
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
      {label}
      <span className={cn("text-xs", active ? "text-white/80" : "text-muted-foreground")}>{price}</span>
    </button>
  );
}

/* ───────────── boarding pass ───────────── */

function BoardingPass({
  state,
  quote,
  comfort,
  totalNights,
  travellers,
  endDate,
  dateValid,
  summaryText,
  onRequest,
}: {
  state: PlannerState;
  quote: Quote;
  comfort: string;
  totalNights: number;
  travellers: number;
  endDate: string;
  dateValid: boolean;
  summaryText: string;
  onRequest: () => void;
}) {
  const [showFare, setShowFare] = useState(false);
  const legs = buildLegs(state.startCity, state.roundTrip);

  return (
    <div className="relative drop-shadow-xl">
      <div className="rounded-t-[1.75rem] bg-gradient-to-br from-primary to-navy p-6 text-white">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
          <span>T&amp;T · Umrah pass</span>
          <Ticket className="size-4 text-cta" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-extrabold">KHI</p>
            <p className="text-[11px] text-white/60">Karachi</p>
          </div>
          <div className="flex flex-1 items-center px-3 text-white/50">
            <span className="h-0 flex-1 border-t-2 border-dashed border-white/30" />
            <Plane className="mx-1 size-4 text-cta" />
            <span className="h-0 flex-1 border-t-2 border-dashed border-white/30" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">{AIRPORT[legs[0]]}</p>
            <p className="text-[11px] text-white/60">{legs.map((c) => CITY_LABEL[c]).join(" · ")}</p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-xs">
          <PassField label="Depart" value={dateValid ? shortDate(state.startDate) : "Flexible"} />
          <PassField label="Return" value={dateValid ? shortDate(endDate) : "—"} />
          <PassField label="Nights" value={String(totalNights)} />
          <PassField label="Pilgrims" value={String(travellers)} />
          <PassField label="Comfort" value={comfort} />
          <PassField label="Room" value={state.sharing} />
        </dl>
      </div>

      {/* perforation */}
      <div className="relative h-6 bg-white">
        <span className="absolute -left-3 top-0 size-6 rounded-full bg-surface lg:bg-white" />
        <span className="absolute -right-3 top-0 size-6 rounded-full bg-surface lg:bg-white" />
        <span className="absolute inset-x-5 top-1/2 border-t-2 border-dashed border-border" />
      </div>

      <div className="rounded-b-[1.75rem] bg-white px-6 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Estimated total</p>
        <AnimatedPKR value={quote.total} className="text-3xl font-extrabold text-navy" />
        <p className="text-xs text-muted-foreground">≈ {formatPKR(quote.perPerson)} per person</p>

        <button
          type="button"
          onClick={() => setShowFare((v) => !v)}
          aria-expanded={showFare}
          className="mt-4 flex w-full items-center justify-between rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-navy"
        >
          Fare breakdown
          <ChevronUp className={cn("size-4 transition", !showFare && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {showFare && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {quote.lines.map((l) => (
                <li
                  key={l.label}
                  className="flex justify-between gap-3 border-b border-dashed border-border py-2 text-xs last:border-0"
                >
                  <span>
                    <span className="block font-semibold text-navy">{l.label}</span>
                    <span className="capitalize text-muted-foreground">{l.detail}</span>
                  </span>
                  <span className="whitespace-nowrap font-semibold text-navy">{formatPKR(l.amount)}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={onRequest}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:-translate-y-0.5 hover:bg-cta-hover"
          >
            <Send className="size-4" /> Request this package
          </button>
          <a
            href={waLink(`Assalam o Alaikum, I built an Umrah package on your website:\n\n${summaryText}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 text-sm font-bold text-[#1da851] transition hover:bg-[#25D366] hover:text-white"
          >
            <WhatsAppIcon className="size-4" /> Share on WhatsApp
          </a>
        </div>

        <div
          className="mx-auto mt-5 h-10 w-full max-w-[260px] opacity-80 [background-image:repeating-linear-gradient(90deg,#0a1f44_0_2px,transparent_2px_4px,#0a1f44_4px_5px,transparent_5px_8px,#0a1f44_8px_11px,transparent_11px_12px)]"
          aria-hidden
        />
        {PRICING_IS_PLACEHOLDER && (
          <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Sample rates for illustration only. Final prices are confirmed by our team.
          </p>
        )}
      </div>
    </div>
  );
}

function PassField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold capitalize">{value}</dd>
    </div>
  );
}

/* ───────────── request dialog ───────────── */

function RequestDialog({
  open,
  onClose,
  summaryText,
  total,
}: {
  open: boolean;
  onClose: () => void;
  summaryText: string;
  total: number;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          name,
          email,
          phone,
          interest: "Umrah",
          message: `Umrah builder request\n${summaryText}`,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  const input =
    "h-12 w-full rounded-xl border border-input bg-white px-4 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-brand-cyan/15";

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
            aria-label="Request this package"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Almost there</p>
                <h2 className="mt-1 text-xl font-extrabold text-navy">Request this package</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Estimated {formatPKR(total)} — our team will confirm availability and the final price.
                </p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>

            {status === "success" ? (
              <div className="flex flex-col items-center py-8 text-center" role="status">
                <CircleCheck className="size-12 text-emerald-600" />
                <p className="mt-3 font-bold text-navy">Request sent — JazakAllah!</p>
                <p className="mt-1 text-sm text-muted-foreground">We&apos;ll contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoComplete="name" aria-label="Full name" />
                <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" aria-label="Email" />
                <input className={input} type="tel" placeholder="Phone / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={7} autoComplete="tel" aria-label="Phone or WhatsApp" />
                {status === "error" && (
                  <p className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cta text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover disabled:opacity-70"
                >
                  {status === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {status === "loading" ? "Sending…" : "Send request"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
