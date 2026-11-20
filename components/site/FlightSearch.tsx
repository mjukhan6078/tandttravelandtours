"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  CalendarClock,
  Info,
  Minus,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  Headset,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site/contact";
import {
  AIRPORT_REGIONS,
  CABINS,
  airlines,
  airportByCode,
  airports,
  type Cabin,
} from "@/lib/site/flights";
import { useInquire } from "./InquireContext";
import { WhatsAppIcon } from "./icons";

type TripType = "oneway" | "return";

const label = (code: string) => {
  const a = airportByCode(code);
  return `${a.city} (${a.code})`;
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prettyDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const extras = [
  {
    icon: Users,
    title: "Group fares",
    text: "Special arrangements and discounts for groups of 10 or more.",
  },
  {
    icon: CalendarClock,
    title: "Flexible dates",
    text: "Tell us your window and we'll find the best day to fly.",
  },
  {
    icon: Headset,
    title: "Changes handled",
    text: "Date changes and re-issues handled by our team, not a call centre.",
  },
];

export default function FlightSearch() {
  const { openWith } = useInquire();

  const [trip, setTrip] = useState<TripType>("return");
  const [from, setFrom] = useState("KHI");
  const [to, setTo] = useState("JED");
  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState<Cabin>("Economy");
  const [error, setError] = useState("");

  function validate(): string {
    if (from === to) return "Departure and destination can't be the same.";
    if (!depart) return "Choose a departure date.";
    if (depart < todayISO()) return "The departure date is in the past.";
    if (trip === "return") {
      if (!ret) return "Choose a return date, or switch to one way.";
      if (ret < depart) return "The return date must be after departure.";
    }
    return "";
  }

  function buildMessage() {
    const pax = [
      `${adults} adult${adults > 1 ? "s" : ""}`,
      children ? `${children} child${children > 1 ? "ren" : ""}` : "",
      infants ? `${infants} infant${infants > 1 ? "s" : ""}` : "",
    ]
      .filter(Boolean)
      .join(", ");
    const dates =
      trip === "return"
        ? `departing ${prettyDate(depart)}, returning ${prettyDate(ret)}`
        : `one way on ${prettyDate(depart)}`;
    return `Assalam o Alaikum, I'd like fares for ${label(from)} → ${label(to)}, ${dates}. ${pax}, ${cabin}.`;
  }

  function submit(via: "form" | "whatsapp") {
    const problem = validate();
    setError(problem);
    if (problem) return;
    const message = buildMessage();
    if (via === "form") openWith({ interest: "Tickets", message });
    else window.open(waLink(message), "_blank", "noopener,noreferrer");
  }

  function setAdultCount(n: number) {
    setAdults(n);
    setInfants((i) => Math.min(i, n)); // one infant per adult lap
  }

  return (
    <section className="bg-white pb-20 pt-8 md:pb-28">
      <div className="container-site">
        {/* Search */}
        <div className="rounded-[2rem] border border-border bg-white p-5 shadow-2xl shadow-primary/10 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full bg-surface p-1" role="group" aria-label="Trip type">
              {(
                [
                  ["return", "Return"],
                  ["oneway", "One way"],
                ] as const
              ).map(([id, text]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={trip === id}
                  onClick={() => setTrip(id)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold transition",
                    trip === id ? "bg-primary text-white shadow-sm" : "text-navy/70 hover:text-navy"
                  )}
                >
                  {text}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-navy">
              <span className="sr-only">Cabin class</span>
              <select
                value={cabin}
                onChange={(e) => setCabin(e.target.value as Cabin)}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CABINS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Route + dates */}
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_auto_1fr_0.8fr_0.8fr]">
            <AirportSelect label="From" icon={PlaneTakeoff} value={from} onChange={setFrom} />
            <button
              type="button"
              aria-label="Swap from and to"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              className="mx-auto grid size-11 place-items-center self-center rounded-full border border-border bg-white text-primary transition hover:rotate-180 hover:border-primary"
            >
              <ArrowLeftRight className="size-4" />
            </button>
            <AirportSelect label="To" icon={PlaneLanding} value={to} onChange={setTo} />
            <div className="grid grid-cols-2 gap-3 md:col-span-3 lg:col-span-2">
              <DateField label="Depart" value={depart} onChange={setDepart} />
              <DateField
                label="Return"
                value={trip === "return" ? ret : ""}
                onChange={setRet}
                disabled={trip === "oneway"}
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Counter label="Adults" hint="12+ years" value={adults} min={1} max={9} onChange={setAdultCount} />
            <Counter label="Children" hint="2–11 years" value={children} min={0} max={9} onChange={setChildren} />
            <Counter label="Infants" hint="Under 2, on lap" value={infants} min={0} max={adults} onChange={setInfants} />
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              We check every airline and send you the best fares, usually within the hour.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => submit("whatsapp")}
                aria-label="Request fares on WhatsApp"
                className="grid size-12 place-items-center rounded-full border border-border text-[#25D366] transition hover:border-[#25D366] hover:bg-[#25D366]/10"
              >
                <WhatsAppIcon className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => submit("form")}
                className="group inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover"
              >
                <Plane className="size-4" />
                Request fares
              </button>
            </div>
          </div>
        </div>

        {/* Extras + airlines */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {extras.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl bg-surface p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold text-navy">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            We book with
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {airlines.map((a) => (
              <li key={a} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AirportSelect({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  icon: typeof Plane;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-border px-4 py-2.5 transition focus-within:border-primary">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full bg-transparent text-base font-bold text-navy outline-none"
      >
        {AIRPORT_REGIONS.map((region) => (
          <optgroup key={region} label={region}>
            {airports
              .filter((a) => a.region === region)
              .map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "block rounded-2xl border border-border px-4 py-2.5 transition focus-within:border-primary",
        disabled && "bg-surface opacity-60"
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <CalendarDays className="size-3.5 text-primary" />
        {label}
      </span>
      <input
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full bg-transparent text-base font-bold text-navy outline-none disabled:cursor-not-allowed"
      />
    </label>
  );
}

function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-2.5">
      <div>
        <p className="text-sm font-bold text-navy">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid size-8 place-items-center rounded-full border border-border text-navy transition hover:border-primary disabled:opacity-40"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center font-extrabold text-navy" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="grid size-8 place-items-center rounded-full border border-border text-navy transition hover:border-primary disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
