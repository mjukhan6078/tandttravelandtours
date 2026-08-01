"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRIP_STATUS_LABELS, type TripStatus } from "@/lib/dashboard/types";
import { Plus, ArrowRight, KeyRound } from "lucide-react";

type TripRow = {
  id: string;
  clientName: string;
  destination: string;
  startDate: string;
  endDate: string;
  itinerarySummary?: string;
  totalNights?: number;
  status: TripStatus;
  apiKey?: string | null;
  documents: { id: string }[];
  updatedAt: string;
};

export default function DashboardHomePage() {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/trips")
      .then((res) => res.json())
      .then((data) => setTrips(data.trips || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell
      title="Client trips"
      actions={
        <Button asChild size="sm">
          <Link href="/dashboard/trips/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New trip
          </Link>
        </Button>
      }
    >
      {loading ? (
        <p className="text-muted-foreground">Loading trips…</p>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">No client trips yet.</p>
            <Button asChild>
              <Link href="/dashboard/trips/new">Create first trip</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <Card key={trip.id} className="border-primary/10 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{trip.clientName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {trip.destination || "Umrah"}
                      {trip.startDate ? ` · ${trip.startDate}` : ""}
                      {trip.endDate ? ` → ${trip.endDate}` : ""}
                    </p>
                    {trip.itinerarySummary && (
                      <p className="text-sm text-foreground/80 mt-1">{trip.itinerarySummary}</p>
                    )}
                  </div>
                  <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                    {TRIP_STATUS_LABELS[trip.status]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span>{trip.documents.length} document(s)</span>
                  <span className="inline-flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5" />
                    {trip.apiKey ? "API key ready" : "No API key"}
                  </span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/trips/${trip.id}`}>
                    Open
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
