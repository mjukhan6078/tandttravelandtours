"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import ItineraryEditor, { ensureItinerary } from "@/components/dashboard/ItineraryEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { defaultItinerary, TRIP_STATUS_LABELS, type TripStatus, type TripStay } from "@/lib/dashboard/types";

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<TripStatus>("draft");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itinerary, setItinerary] = useState<TripStay[]>(defaultItinerary());

  const syncStaysToDates = (nextStart: string, nextEnd: string, currentStays: TripStay[]) => {
    const stays = ensureItinerary(currentStays);
    if (!nextStart || !nextEnd) return stays;
    const nights = nightsBetween(nextStart, nextEnd);
    if (nights <= 0) {
      const fallbackEnd = endDateFromNights(nextStart, itineraryTotalNights(stays));
      setEndDate(fallbackEnd);
      return stays;
    }
    return fitItineraryToNights(stays, nights);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (!value) return;
    if (endDate) {
      setItinerary(syncStaysToDates(value, endDate, itinerary));
    } else {
      setEndDate(endDateFromNights(value, itineraryTotalNights(ensureItinerary(itinerary))));
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (!startDate || !value) return;
    setItinerary(syncStaysToDates(startDate, value, itinerary));
  };

  const handleItineraryChange = (next: TripStay[]) => {
    const stays = ensureItinerary(next);
    setItinerary(stays);
    if (startDate) {
      setEndDate(endDateFromNights(startDate, itineraryTotalNights(stays)));
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const stays = ensureItinerary(itinerary);
    const finalEnd =
      endDate ||
      (startDate ? endDateFromNights(startDate, itineraryTotalNights(stays)) : "");
    const payload = {
      clientName: String(form.get("clientName") || ""),
      clientPhone: String(form.get("clientPhone") || ""),
      clientEmail: String(form.get("clientEmail") || ""),
      destination: String(form.get("destination") || "Umrah"),
      startDate,
      endDate: finalEnd,
      itinerary:
        startDate && finalEnd
          ? fitItineraryToNights(stays, nightsBetween(startDate, finalEnd) || itineraryTotalNights(stays))
          : stays,
      notes: String(form.get("notes") || ""),
      status,
    };

    const response = await fetch("/api/dashboard/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Could not create trip");
      return;
    }

    router.push(`/dashboard/trips/${data.trip.id}`);
  };

  return (
    <DashboardShell
      title="New trip"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Back</Link>
        </Button>
      }
    >
      <Card className="max-w-3xl border-primary/10">
        <CardHeader>
          <CardTitle>Client trip details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="clientName">Client name *</Label>
                <Input id="clientName" name="clientName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone</Label>
                <Input id="clientPhone" name="clientPhone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" name="clientEmail" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" name="destination" defaultValue="Umrah" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TripStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRIP_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
                {startDate && endDate && (
                  <p className="text-[11px] text-muted-foreground">
                    {nightsBetween(startDate, endDate)} night
                    {nightsBetween(startDate, endDate) === 1 ? "" : "s"} — stay order fills this
                    duration.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <ItineraryEditor
                  value={itinerary}
                  onChange={handleItineraryChange}
                  startDate={startDate}
                  endDate={endDate}
                  onEndDateChange={setEndDate}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={4} placeholder="Flight prefs, special requests…" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create trip"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
