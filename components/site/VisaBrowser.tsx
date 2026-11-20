"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, FileCheck2, Info, Lightbulb, PartyPopper, Stamp } from "lucide-react";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site/contact";
import {
  TRAVELLERS,
  VISA_IS_PLACEHOLDER,
  visaSteps,
  visaTypes,
  type Traveller,
  type VisaType,
} from "@/lib/site/visa";
import { useInquire } from "./InquireContext";
import { WhatsAppIcon } from "./icons";

/** "an Umrah visa" / "a Saudi tourist visa". */
const withArticle = (name: string) => `${/^[aeiou]/i.test(name) ? "an" : "a"} ${name}`;

export default function VisaBrowser() {
  const [visaId, setVisaId] = useState(visaTypes[0].id);
  const visa = visaTypes.find((v) => v.id === visaId)!;

  return (
    <section className="bg-white pb-20 pt-8 md:pb-28">
      <div className="container-site">
        {/* Visa type switch */}
        <div role="tablist" aria-label="Choose visa type" className="grid gap-3 sm:grid-cols-2">
          {visaTypes.map((v) => {
            const active = v.id === visaId;
            return (
              <button
                key={v.id}
                role="tab"
                aria-selected={active}
                onClick={() => setVisaId(v.id)}
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
                  <Stamp className="size-7" />
                </span>
                <span>
                  <span className="block text-xl font-extrabold">{v.name}</span>
                  <span className={cn("block text-sm", active ? "text-white/70" : "text-muted-foreground")}>
                    {v.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {VISA_IS_PLACEHOLDER && (
          <p className="mt-6 flex items-start gap-2 rounded-2xl border border-cta/30 bg-cta/10 px-4 py-3 text-sm text-navy">
            <Info className="mt-0.5 size-4 shrink-0 text-cta" />
            Sample fees shown for illustration. Saudi visa rules change often, so message us to
            confirm the latest requirements and fee.
          </p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={visa.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Overview visa={visa} />
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
              <Checklist visa={visa} />
              <div className="space-y-8">
                <Steps />
                <Notes notes={visa.notes} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Overview({ visa }: { visa: VisaType }) {
  const { openWith } = useInquire();
  const message = `Assalam o Alaikum, I'd like to apply for ${withArticle(visa.name)}.`;

  return (
    <div className="mt-6 grid overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-primary text-white lg:grid-cols-[1.4fr_1fr]">
      <div className="p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Who it&apos;s for</p>
        <p className="mt-2 max-w-xl text-white/85">{visa.eligibility}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {visa.facts.map((f) => (
            <div key={f.label} className="rounded-2xl bg-white/10 p-4">
              <dt className="text-xs font-medium text-white/60">{f.label}</dt>
              <dd className="mt-1 font-bold">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-col justify-between gap-6 border-t border-white/10 bg-white/5 p-6 md:p-8 lg:border-l lg:border-t-0">
        <div>
          <p className="text-xs font-medium text-white/60">Service fee from</p>
          <p className="mt-1 text-3xl font-extrabold">PKR {visa.fee.toLocaleString("en-PK")}</p>
          <p className="mt-1 text-sm text-white/70">{visa.feeNote}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openWith({ interest: "Visa", message })}
            className="rounded-full bg-cta px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover"
          >
            Apply now
          </button>
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp us
          </a>
        </div>
      </div>
    </div>
  );
}

function Checklist({ visa }: { visa: VisaType }) {
  const [traveller, setTraveller] = useState<Traveller>("adult");
  const [ticked, setTicked] = useState<Record<string, boolean>>({});

  const docs = visa.documents.filter((d) => d.for.includes(traveller));
  const isReady = (id: string, weArrange?: boolean) => weArrange || !!ticked[`${visa.id}:${id}`];
  const ready = docs.filter((d) => isReady(d.id, d.weArrange)).length;
  const missing = docs.filter((d) => !isReady(d.id, d.weArrange));
  const done = missing.length === 0;
  const travellerLabel = TRAVELLERS.find((t) => t.id === traveller)!.label.toLowerCase();

  const waText = done
    ? `Assalam o Alaikum, I have all documents ready for ${withArticle(visa.name)} (${travellerLabel}). How do I send them?`
    : `Assalam o Alaikum, I'm applying for ${withArticle(visa.name)} (${travellerLabel}). I still need help with: ${missing
        .map((d) => d.title)
        .join(", ")}.`;

  return (
    <div className="rounded-[2rem] border border-border p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-xl font-extrabold text-navy md:text-2xl">
          <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
            <FileCheck2 className="size-5" />
          </span>
          Document checklist
        </h2>
        <div className="flex gap-1 rounded-full bg-surface p-1" role="group" aria-label="Traveller type">
          {TRAVELLERS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={traveller === t.id}
              title={t.hint}
              onClick={() => setTraveller(t.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                traveller === t.id ? "bg-white text-primary shadow-sm" : "text-navy/70 hover:text-navy"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Tick off what you already have. We&apos;ll help with the rest.
      </p>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-semibold text-navy">
          <span>
            {ready} of {docs.length} ready
          </span>
          <span className="text-muted-foreground">{Math.round((ready / docs.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
          <motion.div
            animate={{ width: `${(ready / docs.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "h-full rounded-full",
              done ? "bg-emerald-500" : "bg-gradient-to-r from-brand-cyan to-cta"
            )}
          />
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {docs.map((d) => {
          const checked = isReady(d.id, d.weArrange);
          return (
            <li key={d.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={d.weArrange}
                onClick={() => setTicked((t) => ({ ...t, [`${visa.id}:${d.id}`]: !t[`${visa.id}:${d.id}`] }))}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
                  checked ? "border-primary/20 bg-secondary/60" : "border-border hover:border-primary/40",
                  d.weArrange && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border-2 transition",
                    checked ? "border-primary bg-primary text-white" : "border-border bg-white"
                  )}
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-semibold text-navy">
                    {d.title}
                    {d.weArrange && (
                      <span className="rounded-full bg-cta/15 px-2 py-0.5 text-[11px] font-bold text-cta">
                        We arrange this
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{d.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        className={cn(
          "mt-6 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between",
          done ? "bg-emerald-50" : "bg-surface"
        )}
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-navy">
          {done ? (
            <>
              <PartyPopper className="size-5 text-emerald-600" />
              You&apos;re ready to apply!
            </>
          ) : (
            <>
              <BadgeCheck className="size-5 text-primary" />
              {missing.length} item{missing.length > 1 ? "s" : ""} left. We can help you get them.
            </>
          )}
        </p>
        <a
          href={waLink(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
        >
          <WhatsAppIcon className="size-4" />
          {done ? "Send documents" : "Ask for help"}
        </a>
      </div>
    </div>
  );
}

function Steps() {
  return (
    <div className="rounded-[2rem] bg-surface p-6 md:p-8">
      <h2 className="text-xl font-extrabold text-navy">How it works</h2>
      <ol className="relative mt-6 space-y-6 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-0.5 before:bg-primary/15">
        {visaSteps.map((s, i) => (
          <li key={s.title} className="relative flex gap-4">
            <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white ring-4 ring-surface">
              {i + 1}
            </span>
            <div>
              <p className="font-bold text-navy">{s.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Notes({ notes }: { notes: string[] }) {
  return (
    <div className="rounded-[2rem] border border-border p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy">
        <Lightbulb className="size-5 text-cta" />
        Good to know
      </h2>
      <ul className="mt-4 space-y-3">
        {notes.map((n) => (
          <li key={n} className="flex gap-2 text-sm text-foreground/80">
            <Check className="mt-0.5 size-4 shrink-0 text-cta" strokeWidth={3} />
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
