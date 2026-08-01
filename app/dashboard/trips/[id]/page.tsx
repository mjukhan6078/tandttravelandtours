"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import FlightSegmentEditor from "@/components/dashboard/FlightSegmentEditor";
import HotelsEditor from "@/components/dashboard/HotelsEditor";
import ItineraryEditor, { ensureItinerary } from "@/components/dashboard/ItineraryEditor";
import TripDocumentsPanel from "@/components/dashboard/TripDocumentsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  endDateFromNights,
  fitItineraryToNights,
  itineraryTotalNights,
  nightsBetween,
} from "@/lib/dashboard/duration";
import {
  PAYMENT_STATUS_LABELS,
  TRIP_STATUS_LABELS,
  VISA_STATUS_LABELS,
  defaultFlightSegment,
  defaultPayment,
  defaultTicket,
  defaultVisa,
  type DocumentType,
  type PaymentStatus,
  type TripHotel,
  type TripPayment,
  type TripStatus,
  type TripStay,
  type TripTicket,
  type TripVisa,
  type VisaStatus,
} from "@/lib/dashboard/types";
import { Copy, KeyRound } from "lucide-react";

type TripDoc = {
  id: string;
  type: DocumentType;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

type Trip = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  destination: string;
  startDate: string;
  endDate: string;
  itinerary?: TripStay[];
  itinerarySummary?: string;
  makkahNights: number;
  madinaNights: number;
  notes: string;
  status: TripStatus;
  ticket?: TripTicket;
  visa?: TripVisa;
  hotels?: TripHotel[];
  payment?: TripPayment;
  documents: TripDoc[];
  apiKey?: string | null;
  apiKeyCreatedAt?: string | null;
};

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tripId = params.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<TripStatus>("draft");
  const [notes, setNotes] = useState("");
  const [itinerary, setItinerary] = useState<TripStay[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ticket, setTicket] = useState<TripTicket>(defaultTicket());
  const [visa, setVisa] = useState<TripVisa>(defaultVisa());
  const [hotels, setHotels] = useState<TripHotel[]>([]);
  const [payment, setPayment] = useState<TripPayment>(defaultPayment());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const applyTrip = (data: Trip) => {
    setTrip(data);
    setClientName(data.clientName || "");
    setClientPhone(data.clientPhone || "");
    setClientEmail(data.clientEmail || "");
    setDestination(data.destination || "");
    setStatus(data.status || "draft");
    setNotes(data.notes || "");
    setItinerary(ensureItinerary(data.itinerary));
    setStartDate(data.startDate || "");
    setEndDate(data.endDate || "");
    {
      const base = defaultTicket();
      const incoming = data.ticket;
      setTicket({
        ...base,
        ...(incoming || {}),
        departure: {
          ...defaultFlightSegment(),
          ...(incoming?.departure || {}),
        },
        arrival: {
          ...defaultFlightSegment(),
          ...(incoming?.arrival || {}),
        },
      });
    }
    setVisa({ ...defaultVisa(), ...(data.visa || {}) });
    setHotels(Array.isArray(data.hotels) ? data.hotels : []);
    setPayment({ ...defaultPayment(), ...(data.payment || {}) });
    setRevealedKey(data.apiKey || null);
  };

  const loadTrip = useCallback(async () => {
    const response = await fetch(`/api/dashboard/trips/${tripId}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Trip not found");
      setTrip(null);
    } else {
      applyTrip(data.trip);
    }
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

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

  const saveTrip = async () => {
    if (!trip) return;
    setSaving(true);
    setMessage("");
    setError("");
    const response = await fetch(`/api/dashboard/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        clientPhone,
        clientEmail,
        destination,
        startDate,
        endDate,
        itinerary: ensureItinerary(itinerary),
        notes,
        status,
        ticket,
        visa,
        hotels,
        payment,
      }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Save failed");
      return;
    }
    applyTrip(data.trip);
    setMessage("Trip saved");
  };

  const generateApiKey = async () => {
    if (!trip) return;
    if (trip.apiKey && !confirm("Generate a new key? The old key will stop working.")) return;
    const response = await fetch(`/api/dashboard/trips/${trip.id}/api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not create API key");
      return;
    }
    setTrip(data.trip);
    setRevealedKey(data.apiKey);
    setMessage("API key created — copy and share with the client");
  };

  const revokeApiKey = async () => {
    if (!trip || !confirm("Revoke this API key?")) return;
    const response = await fetch(`/api/dashboard/trips/${trip.id}/api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revoke: true }),
    });
    const data = await response.json();
    if (response.ok) {
      setTrip(data.trip);
      setRevealedKey(null);
      setMessage("API key revoked");
    }
  };

  const copyKey = async () => {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setMessage("API key copied");
  };

  const deleteTrip = async () => {
    if (!trip || !confirm("Delete this trip and all documents?")) return;
    await fetch(`/api/dashboard/trips/${trip.id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <DashboardShell title="Trip">
        <p className="text-muted-foreground">Loading…</p>
      </DashboardShell>
    );
  }

  if (!trip) {
    return (
      <DashboardShell title="Trip">
        <p className="text-destructive">{error || "Trip not found"}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to trips</Link>
        </Button>
      </DashboardShell>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <DashboardShell
      title={clientName || trip.clientName}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">All trips</Link>
          </Button>
          <Button size="sm" onClick={saveTrip} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {(message || error) && (
          <p className={`text-sm ${error ? "text-destructive" : "text-primary"}`}>
            {error || message}
          </p>
        )}

        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Personal info</TabsTrigger>
            <TabsTrigger value="duration">Trip duration</TabsTrigger>
            <TabsTrigger value="ticket">Ticket</TabsTrigger>
            <TabsTrigger value="visa">Visa</TabsTrigger>
            <TabsTrigger value="hotel">Hotel</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="api">API key</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Personal info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="clientName">Client name</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={saveTrip} disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button type="button" variant="destructive" onClick={deleteTrip}>
                    Delete trip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="duration">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Trip duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                    />
                    {startDate && endDate && (
                      <p className="text-[11px] text-muted-foreground">
                        {nightsBetween(startDate, endDate)} night
                        {nightsBetween(startDate, endDate) === 1 ? "" : "s"} total — stay order
                        adjusts to fill this duration.
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
                </div>
                <Button type="button" onClick={saveTrip} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ticket">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FlightSegmentEditor
                  title="Departure flight"
                  hint="Outbound flight going to Saudi Arabia."
                  value={ticket.departure}
                  onChange={(departure) => setTicket({ ...ticket, departure })}
                />

                <FlightSegmentEditor
                  title="Arrival flight"
                  hint="Return flight coming back — can differ from departure."
                  value={ticket.arrival}
                  onChange={(arrival) => setTicket({ ...ticket, arrival })}
                />

                <div className="grid sm:grid-cols-2 gap-4 rounded-lg border border-border p-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={ticket.currency}
                      onChange={(e) => setTicket({ ...ticket, currency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total ticket price</Label>
                    <Input
                      readOnly
                      value={(() => {
                        const dep = Number(ticket.departure.ticketPrice) || 0;
                        const ret = Number(ticket.arrival.ticketPrice) || 0;
                        const total = dep + ret;
                        return total > 0 ? String(total) : "";
                      })()}
                      placeholder="Auto from departure + return"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Luggage allowance</Label>
                    <Input
                      value={ticket.luggageAllowance}
                      onChange={(e) => setTicket({ ...ticket, luggageAllowance: e.target.value })}
                      placeholder="e.g. 2 × 23kg + 7kg cabin"
                    />
                  </div>
                  <label className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 sm:col-span-2">
                    <span className="text-sm">Meal included</span>
                    <Switch
                      checked={ticket.mealIncluded}
                      onCheckedChange={(checked) =>
                        setTicket({ ...ticket, mealIncluded: checked })
                      }
                    />
                  </label>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Ticket notes</Label>
                    <Textarea
                      rows={2}
                      value={ticket.notes}
                      onChange={(e) => setTicket({ ...ticket, notes: e.target.value })}
                    />
                  </div>
                </div>

                <TripDocumentsPanel
                  tripId={trip.id}
                  type="ticket"
                  documents={trip.documents}
                  onChanged={loadTrip}
                  titlePlaceholder="e.g. Outbound e-ticket"
                />

                <Button type="button" onClick={saveTrip} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visa">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Visa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Visa status</Label>
                    <Select
                      value={visa.status}
                      onValueChange={(v) => setVisa({ ...visa, status: v as VisaStatus })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VISA_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor applied with</Label>
                    <Input
                      value={visa.vendor}
                      onChange={(e) => setVisa({ ...visa, vendor: e.target.value })}
                      placeholder="e.g. Nusuk / agency name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Visa cost</Label>
                    <Input
                      value={visa.cost}
                      onChange={(e) => setVisa({ ...visa, cost: e.target.value })}
                      placeholder="e.g. 45000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={visa.currency}
                      onChange={(e) => setVisa({ ...visa, currency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid from</Label>
                    <Input
                      type="date"
                      value={visa.validFrom}
                      onChange={(e) => setVisa({ ...visa, validFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid to</Label>
                    <Input
                      type="date"
                      value={visa.validTo}
                      onChange={(e) => setVisa({ ...visa, validTo: e.target.value })}
                    />
                  </div>
                  <label className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 sm:col-span-2">
                    <span className="text-sm">Transport included with visa</span>
                    <Switch
                      checked={visa.transportIncluded}
                      onCheckedChange={(checked) =>
                        setVisa({ ...visa, transportIncluded: checked })
                      }
                    />
                  </label>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Visa notes</Label>
                    <Textarea
                      rows={2}
                      value={visa.notes}
                      onChange={(e) => setVisa({ ...visa, notes: e.target.value })}
                    />
                  </div>
                </div>

                <TripDocumentsPanel
                  tripId={trip.id}
                  type="visa"
                  documents={trip.documents}
                  onChanged={loadTrip}
                  titlePlaceholder="e.g. Umrah visa copy"
                />

                <Button type="button" onClick={saveTrip} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotel">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Hotel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <HotelsEditor value={hotels} onChange={setHotels} />
                <TripDocumentsPanel
                  tripId={trip.id}
                  type="hotel"
                  documents={trip.documents}
                  onChanged={loadTrip}
                  titlePlaceholder="e.g. Makkah hotel voucher"
                />
                <Button type="button" onClick={saveTrip} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total amount</Label>
                    <Input
                      value={payment.totalAmount}
                      onChange={(e) => setPayment({ ...payment, totalAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Paid amount</Label>
                    <Input
                      value={payment.paidAmount}
                      onChange={(e) => setPayment({ ...payment, paidAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={payment.currency}
                      onChange={(e) => setPayment({ ...payment, currency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment method</Label>
                    <Input
                      value={payment.method}
                      onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                      placeholder="e.g. Bank transfer / Cash"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment status</Label>
                    <Select
                      value={payment.status}
                      onValueChange={(v) =>
                        setPayment({ ...payment, status: v as PaymentStatus })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Payment notes</Label>
                    <Textarea
                      rows={2}
                      value={payment.notes}
                      onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
                    />
                  </div>
                </div>

                <TripDocumentsPanel
                  tripId={trip.id}
                  type="payment_receipt"
                  documents={trip.documents}
                  onChanged={loadTrip}
                  titlePlaceholder="e.g. Advance payment receipt"
                />

                <Button type="button" onClick={saveTrip} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card className="border-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-secondary" />
                  Client API key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create an API key for this client so they can view their trip plan from another
                  app.
                </p>

                {revealedKey ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                    <code className="block text-xs sm:text-sm break-all font-mono">
                      {revealedKey}
                    </code>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={copyKey}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy key
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={revokeApiKey}>
                        Revoke
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No API key yet.</p>
                )}

                <Button type="button" onClick={generateApiKey}>
                  {trip.apiKey ? "Rotate API key" : "Create API key"}
                </Button>

                <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm space-y-2">
                  <p className="font-medium">Client API usage</p>
                  <pre className="overflow-x-auto text-xs bg-background rounded-md p-3 border border-border whitespace-pre-wrap">{`GET ${origin}/api/v1/trip
Authorization: Bearer ${revealedKey || "<API_KEY>"}

# or
curl -H "X-API-Key: ${revealedKey || "<API_KEY>"}" \\
  ${origin}/api/v1/trip`}</pre>
                  <p className="text-xs text-muted-foreground">
                    Document downloads:{" "}
                    <code>/api/v1/documents/&lt;documentId&gt;</code> with the same API key.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
