"use client";

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
import {
  endDateFromNights,
  fitItineraryToNights,
  itineraryTotalNights,
  nightsBetween,
} from "@/lib/dashboard/duration";
import {
  STAY_CITY_LABELS,
  defaultItinerary,
  type StayCity,
  type TripStay,
} from "@/lib/dashboard/types";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

function makeStay(city: StayCity = "makkah", nights = 1): TripStay {
  return {
    id: `stay_${Math.random().toString(36).slice(2, 10)}`,
    city,
    nights,
  };
}

export function ensureItinerary(value?: TripStay[] | null): TripStay[] {
  if (Array.isArray(value) && value.length > 0) return value;
  return defaultItinerary();
}

export default function ItineraryEditor({
  value,
  onChange,
  startDate,
  endDate,
  onEndDateChange,
}: {
  value: TripStay[];
  onChange: (next: TripStay[]) => void;
  startDate?: string;
  endDate?: string;
  /** When stay nights change, parent can update end date to match */
  onEndDateChange?: (endDate: string) => void;
}) {
  const stays = ensureItinerary(value);
  const totalNights = itineraryTotalNights(stays);
  const durationNights =
    startDate && endDate ? nightsBetween(startDate, endDate) : 0;
  const durationLocked = Boolean(startDate && endDate && durationNights > 0);
  const matchesDuration = !durationLocked || totalNights === durationNights;

  const makkahNights = stays
    .filter((stay) => stay.city === "makkah")
    .reduce((sum, stay) => sum + Number(stay.nights || 0), 0);
  const madinaNights = stays
    .filter((stay) => stay.city === "madina")
    .reduce((sum, stay) => sum + Number(stay.nights || 0), 0);

  const schedule = (() => {
    if (!startDate) return [];
    let cursor = new Date(`${startDate}T12:00:00`);
    return stays.map((stay) => {
      const from = new Date(cursor);
      const to = new Date(cursor);
      to.setDate(to.getDate() + stay.nights);
      cursor = new Date(to);
      return {
        id: stay.id,
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      };
    });
  })();

  const commitStays = (next: TripStay[], syncEndFromStays = false) => {
    let staysNext = ensureItinerary(next);
    if (durationLocked && !syncEndFromStays) {
      staysNext = fitItineraryToNights(staysNext, durationNights);
    }
    onChange(staysNext);
    if (syncEndFromStays && startDate && onEndDateChange) {
      onEndDateChange(endDateFromNights(startDate, itineraryTotalNights(staysNext)));
    }
  };

  const updateStayNights = (id: string, nights: number) => {
    const next = stays.map((stay) => (stay.id === id ? { ...stay, nights } : stay));
    // Editing nights updates end date to keep stay order as chosen
    commitStays(next, true);
  };

  const updateStay = (id: string, patch: Partial<TripStay>) => {
    if (patch.nights !== undefined) {
      updateStayNights(id, patch.nights);
      return;
    }
    onChange(stays.map((stay) => (stay.id === id ? { ...stay, ...patch } : stay)));
  };

  const moveStay = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= stays.length) return;
    const next = [...stays];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const removeStay = (id: string) => {
    if (stays.length <= 1) return;
    commitStays(
      stays.filter((stay) => stay.id !== id),
      !durationLocked
    );
  };

  const addStay = () => {
    const city = stays.at(-1)?.city === "makkah" ? "madina" : "makkah";
    commitStays([...stays, makeStay(city, 1)], !durationLocked);
  };

  const fillToDuration = () => {
    if (!durationLocked) return;
    onChange(fitItineraryToNights(stays, durationNights));
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label className="text-base">Trip stay order</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Arrange city stays in order (e.g. Makkah → Madina → Makkah). Start/end dates set the
            total nights; stay nights fill that duration.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addStay}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add stay
        </Button>
      </div>

      {durationLocked && (
        <div
          className={`rounded-md border px-3 py-2 text-xs ${
            matchesDuration
              ? "border-primary/20 bg-primary/5 text-foreground"
              : "border-amber-500/30 bg-amber-500/10 text-foreground"
          }`}
        >
          Trip duration: <strong>{durationNights}</strong> night
          {durationNights === 1 ? "" : "s"} ({startDate} → {endDate}). Stay order total:{" "}
          <strong>{totalNights}</strong>.
          {!matchesDuration && (
            <>
              {" "}
              <button
                type="button"
                className="underline font-medium text-primary"
                onClick={fillToDuration}
              >
                Adjust stays to match
              </button>
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        {stays.map((stay, index) => {
          const range = schedule.find((item) => item.id === stay.id);
          return (
            <div
              key={stay.id}
              className="grid gap-3 sm:grid-cols-[auto_1fr_120px_auto] items-end rounded-md border border-border bg-background p-3"
            >
              <div className="text-sm font-semibold text-primary pt-2 sm:pt-0">
                {index + 1}.
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Select
                  value={stay.city}
                  onValueChange={(city) => updateStay(stay.id, { city: city as StayCity })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="makkah">{STAY_CITY_LABELS.makkah}</SelectItem>
                    <SelectItem value="madina">{STAY_CITY_LABELS.madina}</SelectItem>
                  </SelectContent>
                </Select>
                {range && (
                  <p className="text-[11px] text-muted-foreground">
                    {range.from} → {range.to}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nights</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={stay.nights}
                  onChange={(e) =>
                    updateStay(stay.id, {
                      nights: Math.max(1, Math.min(60, Number(e.target.value) || 1)),
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveStay(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveStay(index, 1)}
                  disabled={index === stays.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeStay(stay.id)}
                  disabled={stays.length <= 1}
                  aria-label="Remove stay"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>
          Order:{" "}
          <strong className="text-foreground">
            {stays.map((stay) => `${STAY_CITY_LABELS[stay.city]} ${stay.nights}n`).join(" → ")}
          </strong>
        </span>
        <span>
          Total nights: <strong className="text-foreground">{totalNights}</strong>
        </span>
        <span>
          Makkah: <strong className="text-foreground">{makkahNights}</strong>
        </span>
        <span>
          Madina: <strong className="text-foreground">{madinaNights}</strong>
        </span>
      </div>
    </div>
  );
}
