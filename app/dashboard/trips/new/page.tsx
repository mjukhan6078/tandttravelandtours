"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
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
import { TRIP_STATUS_LABELS, type TripStatus } from "@/lib/dashboard/types";

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<TripStatus>("draft");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      clientName: String(form.get("clientName") || ""),
      clientPhone: String(form.get("clientPhone") || ""),
      clientEmail: String(form.get("clientEmail") || ""),
      destination: String(form.get("destination") || "Umrah"),
      startDate: String(form.get("startDate") || ""),
      endDate: String(form.get("endDate") || ""),
      makkahNights: Number(form.get("makkahNights") || 0),
      madinaNights: Number(form.get("madinaNights") || 0),
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
                <Input id="startDate" name="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="makkahNights">Makkah nights</Label>
                <Input id="makkahNights" name="makkahNights" type="number" min={0} defaultValue={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="madinaNights">Madina nights</Label>
                <Input id="madinaNights" name="madinaNights" type="number" min={0} defaultValue={5} />
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
