"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AnimatedSection from "./AnimatedSection";
import {
  CalendarRange,
  MapPin,
  Users,
  BedDouble,
  MessageCircle,
  Minus,
  Plus,
  Moon,
  Sun,
  AlertCircle,
  CheckCircle2,
  Plane,
} from "lucide-react";

const WHATSAPP_NUMBER = "923002062324";

const DISTANCE_OPTIONS = [
  { value: "100", label: "Within 100m" },
  { value: "200", label: "Within 200m" },
  { value: "500", label: "Within 500m" },
  { value: "1000", label: "Within 1km" },
  { value: "2000", label: "1–2km" },
] as const;

const AIRLINE_OPTIONS = [
  { value: "any", label: "Any airline" },
  { value: "saudia", label: "Saudia" },
  { value: "flynas", label: "flynas" },
  { value: "flyadeal", label: "flyadeal" },
  { value: "emirates", label: "Emirates" },
  { value: "etihad", label: "Etihad" },
  { value: "qatar", label: "Qatar Airways" },
  { value: "pia", label: "PIA" },
  { value: "airblue", label: "Airblue" },
  { value: "serene", label: "Serene Air" },
  { value: "turkish", label: "Turkish Airlines" },
  { value: "other", label: "Other / specify in chat" },
] as const;

const FLIGHT_TYPE_OPTIONS = [
  { value: "direct", label: "Direct flight preferred" },
  { value: "connecting", label: "Connecting is fine" },
  { value: "either", label: "Either is fine" },
] as const;

function formatDate(value: string) {
  if (!value) return "Not selected";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function distanceLabel(value: string) {
  return DISTANCE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function airlineLabel(value: string) {
  return AIRLINE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function flightTypeLabel(value: string) {
  return FLIGHT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return null;
  const startMs = new Date(`${start}T00:00:00`).getTime();
  const endMs = new Date(`${end}T00:00:00`).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return null;
  const nights = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
  return {
    nights,
    days: nights + 1,
  };
}

function plural(count: number, singular: string, pluralWord = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralWord}`;
}

export default function PlanYourTrip() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [makkahNights, setMakkahNights] = useState(5);
  const [madinaNights, setMadinaNights] = useState(5);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomType, setRoomType] = useState<"separate" | "sharing">("separate");
  const [preferredAirline, setPreferredAirline] = useState("any");
  const [flightType, setFlightType] = useState<"direct" | "connecting" | "either">("direct");
  const [makkahDistance, setMakkahDistance] = useState("200");
  const [madinaDistance, setMadinaDistance] = useState("200");

  const dateSpan = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);

  const stayNights = makkahNights + madinaNights;
  const stayDays = stayNights + 1;
  const totalGuests = adults + children;

  const makkahShare = stayNights > 0 ? (makkahNights / stayNights) * 100 : 50;
  const madinaShare = stayNights > 0 ? (madinaNights / stayNights) * 100 : 50;

  const matchStatus = useMemo(() => {
    if (!dateSpan) return "idle" as const;
    if (dateSpan.nights === stayNights) return "match" as const;
    return "mismatch" as const;
  }, [dateSpan, stayNights]);

  const syncStayToDates = () => {
    if (!dateSpan || dateSpan.nights < 2) return;
    const half = Math.floor(dateSpan.nights / 2);
    setMakkahNights(Math.max(1, dateSpan.nights - half));
    setMadinaNights(Math.max(1, half));
  };

  const syncDatesToStay = () => {
    if (!startDate) return;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + stayNights);
    setEndDate(end.toISOString().slice(0, 10));
  };

  const sendQuery = () => {
    const dateLine = dateSpan
      ? `${formatDate(startDate)} → ${formatDate(endDate)} (${plural(dateSpan.days, "day")} / ${plural(dateSpan.nights, "night")})`
      : `${formatDate(startDate)} → ${formatDate(endDate)}`;

    const message = `Assalamualaikum, I would like to plan my Umrah trip.

*Travel dates*
- ${dateLine}

*Trip duration*
- Total stay: ${plural(stayDays, "day")} / ${plural(stayNights, "night")}
- Makkah: ${plural(makkahNights, "night")} (~${plural(makkahNights + 1, "day")} including travel day)
- Madina: ${plural(madinaNights, "night")} (~${plural(madinaNights + 1, "day")} including travel day)

*Travelers*
- Adults: ${adults}
- Children: ${children}
- Total: ${totalGuests}

*Room*
- Preference: ${roomType === "separate" ? "Separate room" : "Sharing"}

*Flight preference*
- Airline: ${airlineLabel(preferredAirline)}
- Flight type: ${flightTypeLabel(flightType)}

*Hotel distance from Haram*
- Makkah: ${distanceLabel(makkahDistance)}
- Madina: ${distanceLabel(madinaDistance)}

Please share available options and a quote.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="plan-your-trip" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plan Your Trip</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Set your dates and nights in each city. We show your total days and nights as you plan.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <AnimatedSection delay={0.1}>
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-secondary" />
                  Trip details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-base">When do you want to go?</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Arrival / From</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => {
                          const next = e.target.value;
                          setStartDate(next);
                          if (endDate && next > endDate) setEndDate(next);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">Departure / To</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {dateSpan && (
                    <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <DurationChip
                          icon={<Sun className="h-4 w-4 text-secondary" />}
                          label="Calendar days"
                          value={plural(dateSpan.days, "day")}
                        />
                        <DurationChip
                          icon={<Moon className="h-4 w-4 text-secondary" />}
                          label="Hotel nights"
                          value={plural(dateSpan.nights, "night")}
                        />
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        From {formatDate(startDate)} to {formatDate(endDate)} you stay{" "}
                        <strong>{plural(dateSpan.nights, "night")}</strong> and are away for{" "}
                        <strong>{plural(dateSpan.days, "day")}</strong> (arrival + departure counted).
                      </p>
                      {dateSpan.nights >= 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={syncStayToDates}
                        >
                          Split these nights into Makkah & Madina
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Label className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      Nights in each city
                    </Label>
                    <Button type="button" variant="ghost" size="sm" onClick={syncDatesToStay} disabled={!startDate}>
                      Set end date from stay
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <NightStepper
                      label="Makkah nights"
                      value={makkahNights}
                      onChange={setMakkahNights}
                      hint={`~${plural(makkahNights + 1, "day")} on ground`}
                    />
                    <NightStepper
                      label="Madina nights"
                      value={madinaNights}
                      onChange={setMadinaNights}
                      hint={`~${plural(madinaNights + 1, "day")} on ground`}
                    />
                  </div>

                  {/* Visual stay split */}
                  <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-primary">Your stay split</span>
                      <span className="text-muted-foreground">
                        {plural(stayNights, "night")} · {plural(stayDays, "day")} total
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden flex bg-muted">
                      <div
                        className="bg-primary transition-all duration-300"
                        style={{ width: `${makkahShare}%` }}
                        title={`Makkah ${makkahNights}n`}
                      />
                      <div
                        className="bg-secondary transition-all duration-300"
                        style={{ width: `${madinaShare}%` }}
                        title={`Madina ${madinaNights}n`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        <span className="inline-block h-2 w-2 rounded-full bg-primary mr-1.5 align-middle" />
                        Makkah {makkahNights}n ({Math.round(makkahShare)}%)
                      </span>
                      <span>
                        <span className="inline-block h-2 w-2 rounded-full bg-secondary mr-1.5 align-middle" />
                        Madina {madinaNights}n ({Math.round(madinaShare)}%)
                      </span>
                    </div>
                  </div>

                  {matchStatus === "match" && (
                    <p className="flex items-start gap-2 text-sm text-primary">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      City nights match your date range — {plural(stayDays, "day")} /{" "}
                      {plural(stayNights, "night")}.
                    </p>
                  )}
                  {matchStatus === "mismatch" && dateSpan && (
                    <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      Date range is {plural(dateSpan.nights, "night")}, but city stays total{" "}
                      {plural(stayNights, "night")}. Adjust dates or nights so they match.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary" />
                    Travelers
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <NightStepper label="Adults" value={adults} onChange={setAdults} min={1} max={50} />
                    <NightStepper label="Children" value={children} onChange={setChildren} min={0} max={50} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-secondary" />
                    Room preference
                  </Label>
                  <Select
                    value={roomType}
                    onValueChange={(value) => setRoomType(value as "separate" | "sharing")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="separate">Separate room</SelectItem>
                      <SelectItem value="sharing">Sharing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base flex items-center gap-2">
                    <Plane className="h-4 w-4 text-secondary" />
                    Flight preference
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred airline</Label>
                      <Select value={preferredAirline} onValueChange={setPreferredAirline}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select airline" />
                        </SelectTrigger>
                        <SelectContent>
                          {AIRLINE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Flight type</Label>
                      <Select
                        value={flightType}
                        onValueChange={(value) =>
                          setFlightType(value as "direct" | "connecting" | "either")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select flight type" />
                        </SelectTrigger>
                        <SelectContent>
                          {FLIGHT_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Hotel distance from Haram</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Makkah</Label>
                      <Select value={makkahDistance} onValueChange={setMakkahDistance}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTANCE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Madina</Label>
                      <Select value={madinaDistance} onValueChange={setMadinaDistance}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTANCE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <aside className="lg:sticky lg:top-28 space-y-4">
              {/* Duration highlight panel */}
              <Card className="border-primary/20 bg-primary text-primary-foreground overflow-hidden">
                <CardContent className="pt-6 pb-5 space-y-4">
                  <p className="text-sm text-primary-foreground/75">You will remain on this trip</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-primary-foreground/10 p-3 text-center">
                      <div className="flex justify-center mb-1">
                        <Sun className="h-4 w-4 text-secondary" />
                      </div>
                      <p className="text-3xl font-heading font-bold tabular-nums">{stayDays}</p>
                      <p className="text-xs text-primary-foreground/70 mt-1">
                        {stayDays === 1 ? "Day" : "Days"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary-foreground/10 p-3 text-center">
                      <div className="flex justify-center mb-1">
                        <Moon className="h-4 w-4 text-secondary" />
                      </div>
                      <p className="text-3xl font-heading font-bold tabular-nums">{stayNights}</p>
                      <p className="text-xs text-primary-foreground/70 mt-1">
                        {stayNights === 1 ? "Night" : "Nights"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-primary-foreground/65 leading-relaxed">
                    {plural(makkahNights, "night")} in Makkah + {plural(madinaNights, "night")} in
                    Madina = {plural(stayNights, "night")} stay, which is{" "}
                    {plural(stayDays, "day")} including arrival and departure.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-secondary/30 bg-card shadow-lg overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
                <CardHeader>
                  <CardTitle>Your trip plan</CardTitle>
                  <p className="text-sm text-muted-foreground">Live summary as you adjust</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SummaryRow label="Travel dates">
                    {startDate || endDate
                      ? `${formatDate(startDate)} → ${formatDate(endDate)}`
                      : "Not selected"}
                  </SummaryRow>
                  {dateSpan && (
                    <SummaryRow label="Date span">
                      {plural(dateSpan.days, "day")} / {plural(dateSpan.nights, "night")}
                    </SummaryRow>
                  )}
                  <SummaryRow label="Makkah">
                    {plural(makkahNights, "night")} (~{makkahNights + 1}d)
                  </SummaryRow>
                  <SummaryRow label="Madina">
                    {plural(madinaNights, "night")} (~{madinaNights + 1}d)
                  </SummaryRow>
                  <SummaryRow label="Total duration">
                    {plural(stayDays, "day")} / {plural(stayNights, "night")}
                  </SummaryRow>
                  <SummaryRow label="Travelers">
                    {adults} adult{adults !== 1 ? "s" : ""}
                    {children > 0 ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""}
                  </SummaryRow>
                  <SummaryRow label="Room">
                    {roomType === "separate" ? "Separate room" : "Sharing"}
                  </SummaryRow>
                  <SummaryRow label="Airline">{airlineLabel(preferredAirline)}</SummaryRow>
                  <SummaryRow label="Flight type">{flightTypeLabel(flightType)}</SummaryRow>
                  <SummaryRow label="Makkah hotel">
                    {distanceLabel(makkahDistance)} from Haram
                  </SummaryRow>
                  <SummaryRow label="Madina hotel">
                    {distanceLabel(madinaDistance)} from Haram
                  </SummaryRow>

                  <Button
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-md"
                    onClick={sendQuery}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Query on WhatsApp
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Opens WhatsApp with your full trip plan ready to send
                  </p>
                </CardContent>
              </Card>
            </aside>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function DurationChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function NightStepper({
  label,
  value,
  onChange,
  min = 1,
  max = 60,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className="space-y-2 rounded-lg border border-border/80 bg-background p-3">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
          className="text-center font-semibold tabular-nums"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right text-foreground">{children}</span>
    </div>
  );
}
