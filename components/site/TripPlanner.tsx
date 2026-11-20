"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Minus, Plus, Send, Users } from "lucide-react";
import { tripTypes } from "@/lib/site/content";
import { waLink } from "@/lib/site/contact";
import { useInquire } from "./InquireContext";
import { iconMap, WhatsAppIcon } from "./icons";
import { cn } from "@/lib/utils";

type TripKey = (typeof tripTypes)[number]["key"];

const OPTIONS: Record<TripKey, { label: string; choices: string[] }> = {
  Umrah: { label: "Duration", choices: ["10 days", "15 days", "20 days", "25+ days"] },
  Hajj: { label: "Package", choices: ["Economy", "Standard", "Premium"] },
  Visa: { label: "Visa type", choices: ["Umrah", "Visit", "Tourist", "Business"] },
  Tours: { label: "Destination", choices: ["Pakistan", "Middle East", "Asia", "Europe"] },
};

const SHARING = ["Quint", "Quad", "Triple", "Double"];

function nextMonths(count: number) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return d.toLocaleString("en-US", { month: "short", year: "numeric" });
  });
}

export default function TripPlanner() {
  const { openWith } = useInquire();
  const [trip, setTrip] = useState<TripKey>("Umrah");
  const [choice, setChoice] = useState(OPTIONS.Umrah.choices[1]);
  const [sharing, setSharing] = useState("Quad");
  const [travellers, setTravellers] = useState(2);
  const months = useMemo(() => nextMonths(12), []);
  const [month, setMonth] = useState(months[1]);

  const selectTrip = (key: TripKey) => {
    setTrip(key);
    setChoice(OPTIONS[key].choices[0]);
  };

  const summary = [
    `Trip: ${trip}`,
    `${OPTIONS[trip].label}: ${choice}`,
    trip === "Umrah" || trip === "Hajj" ? `Room sharing: ${sharing}` : null,
    `Travellers: ${travellers}`,
    `Travel month: ${month}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="relative rounded-3xl border border-white/60 bg-white/95 p-5 shadow-2xl shadow-navy/40 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Smart trip planner</p>
          <h2 className="text-lg font-bold text-navy">Build your trip in 30 seconds</h2>
        </div>
      </div>

      {/* Trip type tabs */}
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-surface p-1" role="tablist" aria-label="Trip type">
        {tripTypes.map(({ key, icon }) => {
          const Icon = iconMap[icon];
          const active = trip === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTrip(key)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition",
                active ? "text-white" : "text-muted-foreground hover:text-primary"
              )}
            >
              {active && (
                <motion.span
                  layoutId="trip-tab"
                  className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/30"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative size-4" />
              <span className="relative">{key}</span>
            </button>
          );
        })}
      </div>

      {/* Main choice */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {OPTIONS[trip].label}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OPTIONS[trip].choices.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={choice === c}
              onClick={() => setChoice(c)}
              className={cn(
                "rounded-xl border px-2 py-2 text-xs font-semibold transition",
                choice === c
                  ? "border-primary bg-secondary text-primary"
                  : "border-border text-foreground/70 hover:border-primary/50"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {(trip === "Umrah" || trip === "Hajj") && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Room sharing
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SHARING.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sharing === s}
                onClick={() => setSharing(s)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-xs font-semibold transition",
                  sharing === s
                    ? "border-primary bg-secondary text-primary"
                    : "border-border text-foreground/70 hover:border-primary/50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border px-3 py-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Users className="size-3.5" /> Travellers
          </p>
          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setTravellers((n) => Math.max(1, n - 1))}
              className="grid size-7 place-items-center rounded-full bg-surface text-navy transition hover:bg-secondary disabled:opacity-40"
              disabled={travellers <= 1}
              aria-label="Fewer travellers"
            >
              <Minus className="size-3.5" />
            </button>
            <motion.span
              key={travellers}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-lg font-bold text-navy"
              aria-live="polite"
            >
              {travellers}
            </motion.span>
            <button
              type="button"
              onClick={() => setTravellers((n) => Math.min(50, n + 1))}
              className="grid size-7 place-items-center rounded-full bg-surface text-navy transition hover:bg-secondary"
              aria-label="More travellers"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
        <label className="rounded-xl border border-border px-3 py-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarDays className="size-3.5" /> Month
          </span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-bold text-navy outline-none"
            suppressHydrationWarning
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <a
          href={waLink(`Assalam o Alaikum, I'd like a quote.\n\n${summary}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta px-4 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:-translate-y-0.5 hover:bg-cta-hover"
        >
          <WhatsAppIcon className="size-4" /> Quote on WhatsApp
        </a>
        <button
          type="button"
          onClick={() =>
            openWith({
              interest: trip === "Tours" ? "Tours" : trip,
              message: `I'd like a quote.\n${summary}`,
            })
          }
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
        >
          <Send className="size-4" /> Send inquiry
        </button>
      </div>
    </div>
  );
}
