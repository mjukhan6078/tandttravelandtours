"use client";

import { Fragment, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Bus,
  CalendarDays,
  Car,
  Check,
  ChevronUp,
  CircleCheck,
  Coffee,
  Footprints,
  Info,
  Landmark,
  LoaderCircle,
  Minus,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  Route,
  Send,
  Stamp,
  Ticket,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import {
  AIRPORT,
  BOOKING,
  BREAKFAST_PER_PERSON_NIGHT,
  CITY_LABEL,
  COMFORT_LEVELS,
  FLIGHTS,
  NATIONALITIES,
  PRICING_IS_PLACEHOLDER,
  ROUTE_PRESETS,
  VISA_FEE,
  ZIARAAT_ROUTE,
  bedsIn,
  bestVehicle,
  breakfastIncluded,
  calculateQuote,
  carsNeeded,
  defaultNights,
  formatPKR,
  hotelById,
  hotelsIn,
  pickHotel,
  roomCount,
  seated,
  suggestRooms,
  transfersFor,
  vehicleById,
  type CityId,
  type ComfortId,
  type PlannerState,
  type RouteId,
  type Stop,
} from "@/lib/site/pricing";
import { ROOM_TYPES, formatDistance, walkMinutes, type RoomType } from "@/lib/site/hotels";
import { transportRoutes, transportVehicles, type VehicleId } from "@/lib/site/transport";
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
const DEFAULT_CHILD_AGE = 6;

function makeStops(cities: CityId[], comfort: ComfortId, guests: number, pref: RoomType): Stop[] {
  const nights = defaultNights(cities);
  return cities.map((city, i) => ({
    city,
    nights: nights[i],
    hotelId: pickHotel(city, comfort).id,
    rooms: suggestRooms(guests, pref),
    breakfast: false,
  }));
}

const INITIAL_GUESTS = 2;
const INITIAL: PlannerState = {
  route: "mk-md",
  stops: makeStops(["makkah", "madinah"], "standard", INITIAL_GUESTS, "quad"),
  startDate: "",
  adults: INITIAL_GUESTS,
  children: 0,
  childAges: [],
  infants: 0,
  nationality: "Pakistan",
  roomPref: "quad",
  comfort: "standard",
  transportMode: "full",
  vehicleId: bestVehicle(INITIAL_GUESTS),
  cars: 1,
  legVehicles: {},
  ziaraat: ["makkah", "madinah"],
  visa: true,
  flights: false,
};

type Quote = ReturnType<typeof calculateQuote>;
type Update = (patch: Partial<PlannerState>) => void;

/** Keep derived fields consistent after any change. */
function normalize(prev: PlannerState, next: PlannerState): PlannerState {
  const guests = seated(next);

  if (next.children !== prev.children) {
    next.childAges = Array.from({ length: next.children }, (_, i) => prev.childAges[i] ?? DEFAULT_CHILD_AGE);
  }
  next.infants = Math.min(next.infants, next.adults);

  // Re-suggest rooms when the group or room preference changes.
  if (guests !== seated(prev) || next.roomPref !== prev.roomPref) {
    next.stops = next.stops.map((s) => (s.hotelId ? { ...s, rooms: suggestRooms(guests, next.roomPref) } : s));
  }

  // Enough cars for everyone; reset to the minimum when the vehicle changes.
  const needed = carsNeeded(vehicleById(next.vehicleId), guests);
  if (next.vehicleId !== prev.vehicleId || next.cars < needed) next.cars = needed;

  const cities = new Set(next.stops.map((s) => s.city));
  next.ziaraat = next.ziaraat.filter((c) => cities.has(c));
  return next;
}

/* ───────────── main ───────────── */

export default function UmrahPlanner() {
  const [state, setState] = useState<PlannerState>(INITIAL);
  const [requestOpen, setRequestOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);

  const range = useMemo(() => {
    const today = isoDate(new Date());
    return { min: addDays(today, BOOKING.minLeadDays), max: addDays(today, BOOKING.maxAheadDays) };
  }, []);

  const update: Update = (patch) => setState((prev) => normalize(prev, { ...prev, ...patch }));

  const guests = seated(state);
  const totalNights = state.stops.reduce((a, s) => a + s.nights, 0);
  const travellers = guests + state.infants;
  const quote = calculateQuote(state);
  const dateValid = !!state.startDate && state.startDate >= range.min && state.startDate <= range.max;
  const endDate = dateValid ? addDays(state.startDate, totalNights) : "";
  const comfortName =
    state.comfort === "custom" ? "Custom" : COMFORT_LEVELS.find((c) => c.id === state.comfort)!.name;
  const shortOnBeds = state.stops.some((s) => s.hotelId && bedsIn(s.rooms) < guests);

  const summaryText = [
    `Route: ${AIRPORT[state.stops[0].city].code} → ${state.stops
      .map((s) => `${CITY_LABEL[s.city]} (${s.nights}n)`)
      .join(" → ")} → ${AIRPORT[state.stops[state.stops.length - 1].city].code}`,
    dateValid
      ? `Dates: ${shortDate(state.startDate)} – ${shortDate(endDate)} (${totalNights} nights)`
      : `Dates: flexible (${totalNights} nights)`,
    `Travellers: ${state.adults} adults, ${state.children} children${
      state.children ? ` (ages ${state.childAges.join(", ")})` : ""
    }, ${state.infants} infants · Nationality: ${state.nationality}`,
    ...state.stops.map((s, i) => {
      const h = hotelById(s.hotelId);
      if (!h) return `Stop ${i + 1} ${CITY_LABEL[s.city]}: transit only`;
      const rooms = ROOM_TYPES.filter((r) => s.rooms[r.id])
        .map((r) => `${s.rooms[r.id]} ${r.label.toLowerCase()}`)
        .join(", ");
      const bf = breakfastIncluded(h) ? "breakfast included" : s.breakfast ? "with breakfast" : "room only";
      return `Stop ${i + 1} ${CITY_LABEL[s.city]}: ${h.name} · ${rooms} · ${bf}`;
    }),
    state.transportMode === "full"
      ? `Transport: full · ${state.cars} × ${vehicleById(state.vehicleId).name}`
      : `Transport: selective · ${
          transfersFor(state.stops)
            .filter((t) => state.legVehicles[t.id])
            .map((t) => `${t.label} (${vehicleById(state.legVehicles[t.id] as VehicleId).name})`)
            .join("; ") || "none"
        }`,
    `Ziaraat: ${state.ziaraat.length ? state.ziaraat.map((c) => CITY_LABEL[c]).join(", ") : "no"} · Visa: ${
      state.visa ? "yes" : "no"
    } · Flights: ${state.flights ? "yes" : "no"}`,
    `Estimated total: ${formatPKR(quote.total)} (${formatPKR(quote.perPerson)} per person)`,
  ].join("\n");

  const pass = (
    <BoardingPass
      state={state}
      quote={quote}
      comfort={comfortName}
      totalNights={totalNights}
      travellers={travellers}
      endDate={endDate}
      dateValid={dateValid}
      shortOnBeds={shortOnBeds}
      summaryText={summaryText}
      onRequest={() => {
        setPassOpen(false);
        setRequestOpen(true);
      }}
    />
  );

  return (
    <section className="container-site pb-28 pt-4 lg:pb-24">
      <JourneyMap state={state} update={update} range={range} totalNights={totalNights} endDate={endDate} dateValid={dateValid} />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel index="01" title="Who's travelling?" subtitle="Your group, children's ages, nationality and room preference.">
            <Travellers state={state} update={update} />
          </Panel>
          <Panel index="02" title="Choose your hotels" subtitle="Pick a hotel, room types and breakfast for every stop — or skip a hotel for transit.">
            <Hotels state={state} update={update} />
          </Panel>
          <Panel index="03" title="Getting around" subtitle="One vehicle for every transfer, or choose per route.">
            <Transport state={state} update={update} />
          </Panel>
          <Panel index="04" title="Extras" subtitle="Visa processing, guided ziaraat and flights.">
            <Extras state={state} update={update} />
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

      <RequestDialog open={requestOpen} onClose={() => setRequestOpen(false)} summaryText={summaryText} total={quote.total} />
    </section>
  );
}

/* ───────────── journey map ───────────── */

function JourneyMap({
  state,
  update,
  range,
  totalNights,
  endDate,
  dateValid,
}: {
  state: PlannerState;
  update: Update;
  range: { min: string; max: string };
  totalNights: number;
  endDate: string;
  dateValid: boolean;
}) {
  const comfort: ComfortId = state.comfort === "custom" ? "standard" : state.comfort;
  const guests = seated(state);
  const first = state.stops[0]?.city;
  const last = state.stops[state.stops.length - 1]?.city;

  const setNights = (i: number, value: number) =>
    update({ stops: state.stops.map((s, j) => (j === i ? { ...s, nights: value } : s)) });

  const pickRoute = (id: RouteId) => {
    if (id === "custom") return update({ route: "custom" });
    const preset = ROUTE_PRESETS.find((r) => r.id === id)!;
    update({ route: id, stops: makeStops(preset.cities, comfort, guests, state.roomPref) });
  };

  const addCity = (city: CityId) => {
    const stop = makeStops([city], comfort, guests, state.roomPref)[0];
    update({ route: "custom", stops: [...state.stops, { ...stop, nights: 3 }] });
  };

  const removeStop = (i: number) => update({ route: "custom", stops: state.stops.filter((_, j) => j !== i) });

  // Removing a stop must not leave the same city twice in a row.
  const canRemove = (i: number) =>
    state.stops.length > 1 && !(state.stops[i - 1] && state.stops[i + 1] && state.stops[i - 1].city === state.stops[i + 1].city);

  return (
    <div className="relative overflow-clip rounded-[2rem] bg-navy p-5 text-white shadow-2xl shadow-navy/30 md:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/50 blur-3xl" aria-hidden />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Your journey</p>
          <p className="mt-1 text-2xl font-extrabold">
            {totalNights} nights · {state.stops.length} stop{state.stops.length > 1 ? "s" : ""}
          </p>
        </div>
        <p className="text-xs text-white/60" suppressHydrationWarning>
          Start dates: {shortDate(range.min)} – {shortDate(range.max)}
        </p>
      </div>

      {/* Route presets */}
      <div className="relative mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Route">
        {[...ROUTE_PRESETS, { id: "custom" as const, label: "Custom route", desc: "Your own city order" }].map((r) => {
          const active = state.route === r.id;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={r.desc}
              onClick={() => pickRoute(r.id)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold ring-1 transition",
                active ? "bg-white text-navy ring-white" : "text-white/80 ring-white/20 hover:bg-white/10"
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {state.route === "custom" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative overflow-hidden"
          >
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <span className="text-xs text-white/70">Add cities in your travel order:</span>
              {(["makkah", "madinah"] as CityId[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => addCity(c)}
                  disabled={state.stops.length >= BOOKING.maxStops || last === c}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cta px-3 py-1.5 text-xs font-bold text-white transition hover:bg-cta-hover disabled:opacity-40"
                >
                  <Plus className="size-3.5" /> {CITY_LABEL[c]}
                </button>
              ))}
              <span className="text-[11px] text-white/50">Up to {BOOKING.maxStops} stops. Remove a stop with ×.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* stops */}
      <div className="relative mt-8 flex flex-col items-stretch gap-0 md:flex-row md:items-center">
        <EndpointStop icon={<PlaneTakeoff className="size-5" />} label="Depart Karachi" sub={`to ${AIRPORT[first].code}`}>
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
          {state.stops.map((stop, i) => (
            <Fragment key={`${i}-${stop.city}`}>
              <Connector icon={i === 0 ? <Plane className="size-4" /> : <Bus className="size-4" />} />
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative flex-1 rounded-2xl bg-white p-4 text-navy shadow-xl md:min-w-0"
              >
                {state.route === "custom" && canRemove(i) && (
                  <button
                    type="button"
                    onClick={() => removeStop(i)}
                    aria-label={`Remove stop ${i + 1}`}
                    className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-white shadow"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stop {i + 1}</p>
                    <p className="text-lg font-extrabold">{CITY_LABEL[stop.city]}</p>
                  </div>
                  <span className="text-sm text-primary/70" lang="ar" dir="rtl">
                    {ARABIC[stop.city]}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-2 py-1.5">
                  <RoundBtn
                    label={`Fewer nights in ${CITY_LABEL[stop.city]}`}
                    disabled={stop.nights <= 1 || totalNights <= BOOKING.minNights}
                    onClick={() => setNights(i, stop.nights - 1)}
                  >
                    <Minus className="size-3.5" />
                  </RoundBtn>
                  <span className="text-center">
                    <span className="block text-xl font-extrabold leading-none">{stop.nights}</span>
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">nights</span>
                  </span>
                  <RoundBtn
                    label={`More nights in ${CITY_LABEL[stop.city]}`}
                    disabled={totalNights >= BOOKING.maxNights}
                    onClick={() => setNights(i, stop.nights + 1)}
                  >
                    <Plus className="size-3.5" />
                  </RoundBtn>
                </div>
              </motion.div>
            </Fragment>
          ))}
        </AnimatePresence>

        <Connector icon={<Plane className="size-4" />} />
        <EndpointStop icon={<PlaneLanding className="size-5" />} label="Back in Karachi" sub={`from ${AIRPORT[last].code}`}>
          <p className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10">
            {dateValid ? shortDate(endDate) : "Pick a date"}
          </p>
        </EndpointStop>
      </div>
    </div>
  );
}

function EndpointStop({ icon, label, sub, children }: { icon: ReactNode; label: string; sub: string; children: ReactNode }) {
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

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <RoundBtn label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="size-3.5" />
      </RoundBtn>
      <span className="w-6 text-center font-extrabold text-navy">{value}</span>
      <RoundBtn label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-3.5" />
      </RoundBtn>
    </div>
  );
}

/* ───────────── panels ───────────── */

function Panel({ index, title, subtitle, children }: { index: string; title: string; subtitle: string; children: ReactNode }) {
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

const selectCls =
  "h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-semibold text-navy outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

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
    { key: "children", label: "Children", hint: "2–11 years", min: 0, max: 20, size: "size-4" },
    { key: "infants", label: "Infants", hint: "Under 2 · on lap", min: 0, max: Math.min(10, state.adults), size: "size-3.5" },
  ];
  const guests = seated(state);
  const rooms = roomCount(suggestRooms(guests, state.roomPref));

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
              <Stepper value={n} min={r.min} max={r.max} label={r.label.toLowerCase()} onChange={(v) => update({ [r.key]: v })} />
            </div>
          );
        })}

        <AnimatePresence initial={false}>
          {state.children > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-dashed border-primary/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Child ages</p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {state.childAges.map((age, i) => (
                    <label key={i} className="block">
                      <span className="sr-only">Age of child {i + 1}</span>
                      <select
                        value={age}
                        onChange={(e) =>
                          update({ childAges: state.childAges.map((a, j) => (j === i ? Number(e.target.value) : a)) })
                        }
                        className={cn(selectCls, "h-10")}
                      >
                        {Array.from({ length: 10 }, (_, k) => k + 2).map((a) => (
                          <option key={a} value={a}>
                            Child {i + 1}: {a} yrs
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nationality</span>
          <select value={state.nationality} onChange={(e) => update({ nationality: e.target.value })} className={selectCls}>
            {NATIONALITIES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferred room</p>
          <div className="grid grid-cols-3 gap-2">
            {ROOM_TYPES.map((r) => {
              const active = state.roomPref === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ roomPref: r.id })}
                  className={cn(
                    "rounded-2xl border-2 p-3 text-left transition",
                    active ? "border-primary bg-secondary/60" : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="block text-sm font-bold text-navy">{r.label}</span>
                  <span className="text-[11px] text-muted-foreground">{r.guests} beds</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs font-semibold text-primary">
            ≈ {rooms} room{rooms > 1 ? "s" : ""} per stop for {guests} guest{guests > 1 ? "s" : ""}. Fine-tune each
            hotel below.
          </p>
        </div>
      </div>
    </div>
  );
}

function Hotels({ state, update }: { state: PlannerState; update: Update }) {
  const guests = seated(state);

  const setStop = (i: number, patch: Partial<Stop>, custom = true) =>
    update({
      stops: state.stops.map((s, j) => (j === i ? { ...s, ...patch } : s)),
      ...(custom ? { comfort: "custom" as const } : {}),
    });

  const applyComfort = (c: ComfortId) =>
    update({
      comfort: c,
      stops: state.stops.map((s) => ({
        ...s,
        hotelId: pickHotel(s.city, c).id,
        rooms: s.hotelId ? s.rooms : suggestRooms(guests, state.roomPref),
      })),
    });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick pick:</span>
        {COMFORT_LEVELS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.tagline}
            aria-pressed={state.comfort === c.id}
            onClick={() => applyComfort(c.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              state.comfort === c.id ? "border-primary bg-primary text-white" : "border-border text-navy hover:border-primary/50"
            )}
          >
            {c.name}
          </button>
        ))}
        {state.comfort === "custom" && (
          <span className="rounded-full bg-cta/10 px-3 py-1.5 text-xs font-bold text-cta">Custom selection</span>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {state.stops.map((stop, i) => {
          const hotel = hotelById(stop.hotelId);
          const beds = bedsIn(stop.rooms);
          const included = breakfastIncluded(hotel);
          const stayCost = hotel ? ROOM_TYPES.reduce((s, r) => s + stop.rooms[r.id] * hotel.rates[r.id], 0) * stop.nights : 0;
          return (
            <div key={`${i}-${stop.city}`} className="rounded-3xl border border-border p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-bold text-navy">
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs text-white">{i + 1}</span>
                  {CITY_LABEL[stop.city]}
                  <span className="text-sm font-medium text-muted-foreground">· {stop.nights} nights</span>
                </p>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-navy">
                  <input
                    type="checkbox"
                    checked={!hotel}
                    onChange={(e) =>
                      setStop(i, {
                        hotelId: e.target.checked ? null : pickHotel(stop.city, state.comfort === "custom" ? "standard" : state.comfort).id,
                        rooms: suggestRooms(guests, state.roomPref),
                      })
                    }
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Skip hotel (transit only)
                </label>
              </div>

              {hotel ? (
                <>
                  <label className="mt-4 block">
                    <span className="sr-only">Hotel in {CITY_LABEL[stop.city]}</span>
                    <select value={hotel.id} onChange={(e) => setStop(i, { hotelId: e.target.value })} className={selectCls}>
                      {hotelsIn(stop.city).map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} · {h.stars}★ · {formatDistance(h.distanceM)} · from {formatPKR(Math.min(...Object.values(h.rates)))}/night
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <Stars count={hotel.stars} />
                    <span className="flex items-center gap-1">
                      {hotel.shuttle ? <Bus className="size-3.5" /> : <Footprints className="size-3.5" />}
                      {formatDistance(hotel.distanceM)} · {hotel.shuttle ? "shuttle" : `~${walkMinutes(hotel.distanceM)} min walk`}
                    </span>
                    <span>{hotel.area}</span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {ROOM_TYPES.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-2xl bg-surface p-2.5 pl-3">
                        <div>
                          <p className="text-sm font-bold text-navy">{r.label}</p>
                          <p className="text-[11px] text-muted-foreground">{formatPKR(hotel.rates[r.id])}/night</p>
                        </div>
                        <Stepper
                          value={stop.rooms[r.id]}
                          min={0}
                          max={20}
                          label={`${r.label.toLowerCase()} rooms`}
                          onChange={(v) => setStop(i, { rooms: { ...stop.rooms, [r.id]: v } }, false)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold",
                        beds < guests ? "text-destructive" : "text-primary"
                      )}
                    >
                      {beds < guests ? <TriangleAlert className="size-3.5" /> : <BedDouble className="size-3.5" />}
                      {roomCount(stop.rooms)} room{roomCount(stop.rooms) === 1 ? "" : "s"} · {beds} beds for {guests} guest{guests === 1 ? "" : "s"}
                      {beds < guests && " — add a room"}
                    </p>
                    {included ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <Coffee className="size-3.5" /> Breakfast included
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-pressed={stop.breakfast}
                        onClick={() => setStop(i, { breakfast: !stop.breakfast }, false)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
                          stop.breakfast ? "border-cta bg-cta text-white" : "border-border text-navy hover:border-cta/50"
                        )}
                      >
                        <Coffee className="size-3.5" />
                        Add breakfast · {formatPKR(BREAKFAST_PER_PERSON_NIGHT)}/person/night
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-right text-sm text-muted-foreground">
                    Stay: <span className="font-extrabold text-navy">{formatPKR(stayCost)}</span>
                  </p>
                </>
              ) : (
                <p className="mt-3 rounded-2xl bg-surface px-4 py-3 text-sm text-muted-foreground">
                  No hotel at this stop — useful if you&apos;re staying with family or only passing through.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Transport({ state, update }: { state: PlannerState; update: Update }) {
  const guests = seated(state);
  const transfers = transfersFor(state.stops);
  const rate = (routeId: string, v: VehicleId) => transportRoutes.find((r) => r.id === routeId)!.rates[v];
  const tripCost = (v: VehicleId) => transfers.reduce((s, t) => s + rate(t.routeId, v), 0);
  const best = bestVehicle(guests);

  const setMode = (mode: "full" | "selective") => {
    if (mode === "selective" && !Object.keys(state.legVehicles).length) {
      update({
        transportMode: mode,
        legVehicles: Object.fromEntries(transfers.map((t) => [t.id, state.vehicleId])),
      });
    } else update({ transportMode: mode });
  };

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Transport type">
        {(
          [
            ["full", "Full transport", "One vehicle type for every airport and intercity transfer."],
            ["selective", "Selective transport", "Choose a vehicle per route. Routes left empty aren't charged."],
          ] as const
        ).map(([id, title, text]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={state.transportMode === id}
            onClick={() => setMode(id)}
            className={cn(
              "rounded-2xl border-2 p-4 text-left transition",
              state.transportMode === id ? "border-primary bg-secondary/50" : "border-border hover:border-primary/40"
            )}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-navy">
              {id === "full" ? <Car className="size-4 text-primary" /> : <Route className="size-4 text-primary" />}
              {title}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{text}</span>
          </button>
        ))}
      </div>

      {state.transportMode === "full" ? (
        <>
          <div className="mt-5 space-y-2.5">
            {transportVehicles.map((v) => {
              const active = state.vehicleId === v.id;
              const cars = carsNeeded(v, guests);
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ vehicleId: v.id })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition md:gap-4 md:p-4",
                    active ? "border-primary bg-secondary/50" : "border-border hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-xl transition",
                      active ? "bg-primary text-white" : "bg-surface text-primary"
                    )}
                  >
                    {v.seats > 7 ? <Bus className="size-5" /> : <Car className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-navy">{v.name}</span>
                      <span className="text-xs text-muted-foreground">{v.model}</span>
                      {v.id === best && (
                        <span className="rounded-full bg-cta/15 px-2 py-0.5 text-[10px] font-bold uppercase text-cta">Best fit</span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {v.seats} seats · {v.bags} bags{cars > 1 ? ` · needs ${cars} cars for ${guests}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-extrabold text-primary">{formatPKR(tripCost(v.id) * cars)}</span>
                    <span className="text-[10px] text-muted-foreground">{transfers.length} transfers</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface p-3 pl-4">
            <div>
              <p className="text-sm font-bold text-navy">Number of cars</p>
              <p className="text-[11px] text-muted-foreground">
                At least {carsNeeded(vehicleById(state.vehicleId), guests)} for {guests} guests
              </p>
            </div>
            <Stepper
              value={state.cars}
              min={carsNeeded(vehicleById(state.vehicleId), guests)}
              max={10}
              label="cars"
              onChange={(cars) => update({ cars })}
            />
          </div>
        </>
      ) : (
        <div className="mt-5 space-y-2.5">
          {transfers.map((t) => {
            const id = state.legVehicles[t.id] ?? "";
            const cars = id ? carsNeeded(vehicleById(id), guests) : 0;
            return (
              <div key={t.id} className="grid items-center gap-2 rounded-2xl border border-border p-3 md:grid-cols-[1fr_220px_110px]">
                <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <Route className="size-4 shrink-0 text-primary" />
                  {t.label}
                </p>
                <select
                  value={id}
                  onChange={(e) => update({ legVehicles: { ...state.legVehicles, [t.id]: e.target.value as VehicleId | "" } })}
                  className={cn(selectCls, "h-10")}
                  aria-label={`Vehicle for ${t.label}`}
                >
                  <option value="">No vehicle</option>
                  {transportVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.seats} seats)
                    </option>
                  ))}
                </select>
                <p className="text-right text-sm font-extrabold text-primary">
                  {id ? (
                    <>
                      {formatPKR(rate(t.routeId, id) * cars)}
                      {cars > 1 && <span className="block text-[10px] font-medium text-muted-foreground">{cars} cars</span>}
                    </>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">Not charged</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Extras({ state, update }: { state: PlannerState; update: Update }) {
  const guests = seated(state);
  const travellers = guests + state.infants;
  const cities = [...new Set(state.stops.map((s) => s.city))];
  const zVehicle = state.transportMode === "full" ? vehicleById(state.vehicleId) : vehicleById(bestVehicle(guests));
  const zCars = state.transportMode === "full" ? state.cars : carsNeeded(zVehicle, guests);
  const zPrice = (c: CityId) =>
    transportRoutes.find((r) => r.id === ZIARAAT_ROUTE[c])!.rates[zVehicle.id] * zCars;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ExtraCard
        icon={<Stamp className="size-5" />}
        active={state.visa}
        onClick={() => update({ visa: !state.visa })}
        title="Umrah visa processing"
        text={
          state.nationality === "Pakistan"
            ? `${formatPKR(VISA_FEE)} per person · ${travellers} travellers`
            : `${formatPKR(VISA_FEE)} per person · rules for ${state.nationality} passports confirmed by our team`
        }
      />
      <ExtraCard
        icon={<Plane className="size-5" />}
        active={state.flights}
        onClick={() => update({ flights: !state.flights })}
        title="Return flights from Karachi"
        text={`Estimate from ${formatPKR(FLIGHTS.adult)} per adult`}
      />
      {cities.map((c) => (
        <ExtraCard
          key={c}
          icon={<Landmark className="size-5" />}
          active={state.ziaraat.includes(c)}
          onClick={() =>
            update({ ziaraat: state.ziaraat.includes(c) ? state.ziaraat.filter((x) => x !== c) : [...state.ziaraat, c] })
          }
          title={`${CITY_LABEL[c]} ziaraat tour`}
          text={`${formatPKR(zPrice(c))} · ${zCars} × ${zVehicle.name}, guided`}
        />
      ))}
    </div>
  );
}

function ExtraCard({
  icon,
  active,
  onClick,
  title,
  text,
}: {
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition",
        active ? "border-cta bg-cta/5" : "border-border hover:border-cta/40"
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", active ? "bg-cta text-white" : "bg-surface text-primary")}>
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-navy">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{text}</span>
      </span>
      <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border-2", active ? "border-cta bg-cta text-white" : "border-border")}>
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
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
  shortOnBeds,
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
  shortOnBeds: boolean;
  summaryText: string;
  onRequest: () => void;
}) {
  const [showFare, setShowFare] = useState(false);
  const first = state.stops[0].city;

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
            <p className="text-3xl font-extrabold">{AIRPORT[first].code}</p>
            <p className="text-[11px] text-white/60">{state.stops.map((s) => CITY_LABEL[s.city]).join(" · ")}</p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-xs">
          <PassField label="Depart" value={dateValid ? shortDate(state.startDate) : "Flexible"} />
          <PassField label="Return" value={dateValid ? shortDate(endDate) : "—"} />
          <PassField label="Nights" value={String(totalNights)} />
          <PassField label="Pilgrims" value={String(travellers)} />
          <PassField label="Hotels" value={comfort} />
          <PassField label="Transport" value={state.transportMode} />
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

        {shortOnBeds && (
          <p className="mt-3 flex gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            Some hotels don&apos;t have enough beds for your group yet.
          </p>
        )}

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
              {quote.lines.map((l, i) => (
                <li key={`${l.label}-${i}`} className="flex justify-between gap-3 border-b border-dashed border-border py-2 text-xs last:border-0">
                  <span>
                    <span className="block font-semibold text-navy">{l.label}</span>
                    <span className="text-muted-foreground">{l.detail}</span>
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
