"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import FlightSegmentEditor from "@/components/dashboard/FlightSegmentEditor";
import HotelsEditor from "@/components/dashboard/HotelsEditor";
import ItineraryEditor, { ensureItinerary } from "@/components/dashboard/ItineraryEditor";
import PaymentEditor from "@/components/dashboard/PaymentEditor";
import TicketPassengersEditor from "@/components/dashboard/TicketPassengersEditor";
import TripDocumentsPanel from "@/components/dashboard/TripDocumentsPanel";
import VisasEditor from "@/components/dashboard/VisasEditor";
import CollapsibleSection from "@/components/dashboard/CollapsibleSection";
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
  formatMoneyAmount,
  segmentCurrencyLabel,
  segmentHasFlightDetails,
  segmentLineTotal,
  syncSegmentTicketPrice,
  syncVisaCost,
  ticketGrandTotal,
  visaCurrencyLabel,
  visaLineTotal,
} from "@/lib/dashboard/ticket-pricing";
import {
  TICKET_CURRENCY_OPTIONS,
  TRIP_STATUS_LABELS,
  defaultFlightSegment,
  defaultHotelPackage,
  defaultPayment,
  defaultTicket,
  defaultVisa,
  type DocumentType,
  type FlightSegment,
  type TicketCurrency,
  type TicketPassenger,
  type TripHotel,
  type TripHotelPackage,
  type TripPayment,
  type TripStatus,
  type TripStay,
  type TripTicket,
  type TripTransport,
  type TripVisa,
  type VisaRecord,
} from "@/lib/dashboard/types";
import { syncTripPaymentFromServices } from "@/lib/dashboard/payment";
import { Copy, FileUp, KeyRound } from "lucide-react";

function normalizeTicketState(incoming?: TripTicket | null): TripTicket {
  const base = defaultTicket();
  const next = {
    ...base,
    ...(incoming || {}),
    departure: syncSegmentTicketPrice({
      ...defaultFlightSegment(),
      ...(incoming?.departure || {}),
    }),
    arrival: syncSegmentTicketPrice({
      ...defaultFlightSegment(),
      ...(incoming?.arrival || {}),
    }),
    passengers: Array.isArray(incoming?.passengers) ? incoming.passengers : [],
  };
  if (next.passengers.length > 0) {
    const units = next.passengers.length;
    next.departure = syncSegmentTicketPrice({ ...next.departure, ticketUnits: units });
    if (segmentHasFlightDetails(next.arrival)) {
      next.arrival = syncSegmentTicketPrice({ ...next.arrival, ticketUnits: units });
    }
  }
  return next;
}

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
  hotelPackage?: TripHotelPackage;
  hotels?: TripHotel[];
  transports?: TripTransport[];
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
  const [hotelPackage, setHotelPackage] = useState<TripHotelPackage>(defaultHotelPackage());
  const [hotels, setHotels] = useState<TripHotel[]>([]);
  const [transports, setTransports] = useState<TripTransport[]>([]);
  const [payment, setPayment] = useState<TripPayment>(defaultPayment());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [parsingTicket, setParsingTicket] = useState(false);
  const [parsingVisa, setParsingVisa] = useState(false);
  const [parsingHotel, setParsingHotel] = useState(false);

  const normalizeVisaState = (incoming?: TripVisa | null): TripVisa =>
    syncVisaCost({
      ...defaultVisa(),
      ...(incoming || {}),
    });

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
    setTicket(normalizeTicketState(data.ticket));
    setVisa(normalizeVisaState(data.visa));
    setHotelPackage({ ...defaultHotelPackage(), ...(data.hotelPackage || {}) });
    setHotels(Array.isArray(data.hotels) ? data.hotels : []);
    setTransports(Array.isArray(data.transports) ? data.transports : []);
    setPayment(
      syncTripPaymentFromServices(
        { ...defaultPayment(), ...(data.payment || {}) },
        {
          ticket: normalizeTicketState(data.ticket),
          visa: normalizeVisaState(data.visa),
          hotels: Array.isArray(data.hotels) ? data.hotels : [],
          transports: Array.isArray(data.transports) ? data.transports : [],
        }
      )
    );
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

  useEffect(() => {
    setPayment((current) =>
      syncTripPaymentFromServices(current, { ticket, visa, hotels, transports })
    );
  }, [ticket, visa, hotels, transports]);

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
        hotelPackage,
        hotels,
        transports,
        payment: syncTripPaymentFromServices(payment, {
          ticket,
          visa,
          hotels,
          transports,
        }),
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
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(revealedKey);
      } else {
        const input = document.createElement("textarea");
        input.value = revealedKey;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setMessage("API key copied");
    } catch {
      setError("Could not copy API key — select and copy it manually");
    }
  };

  const deleteTrip = async () => {
    if (!trip || !confirm("Delete this trip and all documents?")) return;
    await fetch(`/api/dashboard/trips/${trip.id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  const parseTicketPdf = async (file: File | null) => {
    if (!trip || !file) return;
    setParsingTicket(true);
    setMessage("");
    setError("");
    const form = new FormData();
    form.set("file", file);
    const response = await fetch(`/api/dashboard/trips/${trip.id}/parse-ticket`, {
      method: "POST",
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    setParsingTicket(false);
    if (!response.ok) {
      setError(data.error || "Could not parse ticket PDF");
      return;
    }

    const parsedTicket = data.parsed?.ticket as TripTicket | undefined;
    if (!parsedTicket) {
      setError("No ticket details found in PDF");
      return;
    }

    setTicket(
      normalizeTicketState({
        ...parsedTicket,
        notes: parsedTicket.notes || ticket.notes,
      })
    );

    if (data.parsed?.clientNameHint && !clientName.trim()) {
      setClientName(data.parsed.clientNameHint);
    }

    setMessage(`Ticket details loaded: ${data.parsed?.summary || "OK"}`);
  };

  const parseVisaPdf = async (file: File | null) => {
    if (!trip || !file) return;
    setParsingVisa(true);
    setMessage("");
    setError("");
    const form = new FormData();
    form.set("file", file);
    const response = await fetch(`/api/dashboard/trips/${trip.id}/parse-visa`, {
      method: "POST",
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    setParsingVisa(false);
    if (!response.ok) {
      setError(data.error || "Could not parse visa PDF");
      return;
    }

    const parsedRecord = data.parsed?.record as VisaRecord | undefined;
    if (!parsedRecord) {
      setError("No visa details found in PDF");
      return;
    }

    const entries = [...(visa.entries || []), parsedRecord];
    setVisa(
      normalizeVisaState({
        ...visa,
        entries,
      })
    );

    if (data.parsed?.clientNameHint && !clientName.trim()) {
      setClientName(data.parsed.clientNameHint);
    }

    setMessage(`Visa added: ${data.parsed?.summary || "OK"}`);
  };

  const parseHotelPdf = async (file: File | null) => {
    if (!trip || !file) return;
    setParsingHotel(true);
    setMessage("");
    setError("");
    const form = new FormData();
    form.set("file", file);
    const response = await fetch(`/api/dashboard/trips/${trip.id}/parse-hotel`, {
      method: "POST",
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    setParsingHotel(false);
    if (!response.ok) {
      setError(data.error || "Could not parse hotel voucher PDF");
      return;
    }

    const parsedHotels = data.parsed?.hotels as TripHotel[] | undefined;
    const parsedTransports = data.parsed?.transports as TripTransport[] | undefined;
    const parsedPackage = data.parsed?.hotelPackage as TripHotelPackage | undefined;

    if (
      !parsedPackage &&
      !(parsedHotels && parsedHotels.length) &&
      !(parsedTransports && parsedTransports.length)
    ) {
      setError("No hotel or transport details found in PDF");
      return;
    }

    if (parsedPackage) {
      setHotelPackage({ ...defaultHotelPackage(), ...parsedPackage });
    }
    if (parsedHotels) setHotels(parsedHotels);
    if (parsedTransports) setTransports(parsedTransports);

    if (data.parsed?.clientNameHint && !clientName.trim()) {
      setClientName(data.parsed.clientNameHint);
    }

    setMessage(`Hotel & transport loaded: ${data.parsed?.summary || "OK"}`);
  };

  const updateVisaEntries = (entries: VisaRecord[]) => {
    setVisa(normalizeVisaState({ ...visa, entries }));
  };

  const updatePassengers = (passengers: TicketPassenger[]) => {
    const units = Math.max(1, passengers.length || ticket.departure.ticketUnits || 1);
    setTicket({
      ...ticket,
      passengers,
      departure: syncSegmentTicketPrice({
        ...ticket.departure,
        ticketUnits: passengers.length > 0 ? units : ticket.departure.ticketUnits,
      }),
      arrival: syncSegmentTicketPrice({
        ...ticket.arrival,
        ticketUnits:
          passengers.length > 0 && segmentHasFlightDetails(ticket.arrival)
            ? units
            : ticket.arrival.ticketUnits,
      }),
    });
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button asChild variant="outline" size="sm" className="px-2 sm:px-3">
            <Link href="/dashboard">
              <span className="sm:hidden">Trips</span>
              <span className="hidden sm:inline">All trips</span>
            </Link>
          </Button>
          <Button size="sm" onClick={saveTrip} disabled={saving} className="px-2 sm:px-3">
            {saving ? "Saving…" : "Save"}
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
            <TabsTrigger value="hotel">Hotel & Transport</TabsTrigger>
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
              <CardContent className="space-y-4 min-w-0">
                <CollapsibleSection
                  id="ticket-import"
                  title="Import ticket PDF"
                  description="Upload a Galileo e-ticket PDF to auto-fill booking, passengers, and flights."
                  defaultOpen
                >
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileUp className="h-4 w-4 text-primary shrink-0" />
                        Ticket PDF
                      </p>
                      <Label
                        htmlFor="ticket-pdf-upload"
                        className={`inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium cursor-pointer hover:bg-muted ${
                          parsingTicket ? "opacity-60 pointer-events-none" : ""
                        }`}
                      >
                        {parsingTicket ? "Reading PDF…" : "Choose PDF"}
                      </Label>
                      <Input
                        id="ticket-pdf-upload"
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        disabled={parsingTicket}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          void parseTicketPdf(file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  id="ticket-booking"
                  title="Booking details"
                  description="PNR, issue info, and payment form from the e-ticket."
                  summary={
                    [ticket.pnr && `PNR ${ticket.pnr}`, ticket.airlinePnr && `A/L ${ticket.airlinePnr}`]
                      .filter(Boolean)
                      .join(" · ") || undefined
                  }
                  defaultOpen
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <Label>GDS / Galileo PNR</Label>
                      <Input
                        value={ticket.pnr || ""}
                        onChange={(e) => setTicket({ ...ticket, pnr: e.target.value })}
                        placeholder="e.g. H9429R"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Airline PNR</Label>
                      <Input
                        value={ticket.airlinePnr || ""}
                        onChange={(e) => setTicket({ ...ticket, airlinePnr: e.target.value })}
                        placeholder="e.g. N1UGRP"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Issue date</Label>
                      <Input
                        type="date"
                        value={ticket.issueDate || ""}
                        onChange={(e) => setTicket({ ...ticket, issueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Form of payment</Label>
                      <Input
                        value={ticket.formOfPayment || ""}
                        onChange={(e) => setTicket({ ...ticket, formOfPayment: e.target.value })}
                        placeholder="e.g. INVOICE TT"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Issuing agent</Label>
                      <Input
                        value={ticket.issuingAgent || ""}
                        onChange={(e) => setTicket({ ...ticket, issuingAgent: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>IATA number</Label>
                      <Input
                        value={ticket.iataNumber || ""}
                        onChange={(e) => setTicket({ ...ticket, iataNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Tour code</Label>
                      <Input
                        value={ticket.tourCode || ""}
                        onChange={(e) => setTicket({ ...ticket, tourCode: e.target.value })}
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  id="ticket-passengers"
                  title="Passengers"
                  description="One card per passenger. Pricing units follow this count."
                  summary={
                    ticket.passengers?.length
                      ? `${ticket.passengers.length} passenger${
                          ticket.passengers.length === 1 ? "" : "s"
                        }`
                      : "No passengers yet"
                  }
                  defaultOpen
                >
                  <TicketPassengersEditor
                    value={ticket.passengers || []}
                    onChange={updatePassengers}
                    showHeader={false}
                  />
                </CollapsibleSection>

                <CollapsibleSection
                  id="ticket-departure"
                  title="Departure flight"
                  description="Outbound flight going to Saudi Arabia."
                  summary={
                    segmentHasFlightDetails(ticket.departure)
                      ? [
                          ticket.departure.airline,
                          ticket.departure.flightNumber,
                          ticket.departure.departureAirport &&
                            `${ticket.departure.departureAirport} → ${
                              ticket.departure.arrivalAirport || "—"
                            }`,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : "No flight details yet"
                  }
                  defaultOpen
                >
                  <FlightSegmentEditor
                    value={ticket.departure}
                    onChange={(departure) =>
                      setTicket({
                        ...ticket,
                        departure: syncSegmentTicketPrice({
                          ...departure,
                          ticketUnits:
                            ticket.passengers?.length ||
                            departure.ticketUnits ||
                            (segmentHasFlightDetails(departure) ? 1 : 0),
                        }),
                      })
                    }
                  />
                </CollapsibleSection>

                <CollapsibleSection
                  id="ticket-return"
                  title="Return flight"
                  description="Return flight coming back — can differ from departure."
                  summary={
                    segmentHasFlightDetails(ticket.arrival)
                      ? [
                          ticket.arrival.airline,
                          ticket.arrival.flightNumber,
                          ticket.arrival.departureAirport &&
                            `${ticket.arrival.departureAirport} → ${
                              ticket.arrival.arrivalAirport || "—"
                            }`,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : "No flight details yet"
                  }
                  defaultOpen
                >
                  <FlightSegmentEditor
                    value={ticket.arrival}
                    onChange={(arrival) =>
                      setTicket({
                        ...ticket,
                        arrival: syncSegmentTicketPrice({
                          ...arrival,
                          ticketUnits:
                            ticket.passengers?.length ||
                            arrival.ticketUnits ||
                            (segmentHasFlightDetails(arrival) ? 1 : 0),
                        }),
                      })
                    }
                  />
                </CollapsibleSection>

                <CollapsibleSection
                  id="ticket-pricing"
                  title="Ticket pricing"
                  description="Unit price × ticket units. Totals update automatically."
                  defaultOpen
                >
                  <div className="space-y-3 sm:space-y-4">
                    {(
                      [
                        ["departure", "Departure flight"],
                        ["arrival", "Return flight"],
                      ] as const
                    ).map(([key, label]) => {
                      const segment = ticket[key];
                      const ready = segmentHasFlightDetails(segment);
                      const updateSegment = (partial: Partial<FlightSegment>) => {
                        const next = syncSegmentTicketPrice({ ...segment, ...partial });
                        setTicket({ ...ticket, [key]: next });
                      };
                      return (
                        <div
                          key={key}
                          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_88px_minmax(0,1fr)] gap-3 items-end rounded-md border border-border p-3 ${
                            ready ? "bg-muted/20" : "bg-muted/10 opacity-70"
                          }`}
                        >
                          <div className="space-y-1 min-w-0 sm:col-span-2 lg:col-span-1">
                            <Label>{label}</Label>
                            <p className="text-xs text-muted-foreground break-words">
                              {ready
                                ? [
                                    segment.airline,
                                    segment.flightNumber,
                                    segment.flightDate,
                                    segment.departureAirport &&
                                      `${segment.departureAirport} → ${segment.arrivalAirport || "—"}`,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")
                                : "Enter flight details above to price this flight"}
                            </p>
                          </div>
                          <div className="space-y-2 min-w-0">
                            <Label>Unit price</Label>
                            <div className="flex min-w-0">
                              <Input
                                disabled={!ready}
                                value={segment.unitPrice}
                                onChange={(e) => updateSegment({ unitPrice: e.target.value })}
                                placeholder="Price per ticket"
                                className="min-w-0 rounded-r-none"
                              />
                              <Select
                                disabled={!ready}
                                value={segment.currency || "PKR"}
                                onValueChange={(currency) =>
                                  updateSegment({ currency: currency as TicketCurrency })
                                }
                              >
                                <SelectTrigger className="w-[96px] sm:w-[118px] shrink-0 rounded-l-none border-l-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TICKET_CURRENCY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {segment.currency === "OTHER" && (
                              <Input
                                disabled={!ready}
                                value={segment.currencyOther || ""}
                                onChange={(e) =>
                                  updateSegment({ currencyOther: e.target.value })
                                }
                                placeholder="Currency name / code"
                                className="mt-2"
                              />
                            )}
                          </div>
                          <div className="space-y-2 min-w-0">
                            <Label>Units</Label>
                            <Input
                              type="number"
                              min={1}
                              max={50}
                              disabled={!ready}
                              value={
                                segment.ticketUnits > 0
                                  ? segment.ticketUnits
                                  : ready
                                    ? 1
                                    : ""
                              }
                              onChange={(e) =>
                                updateSegment({
                                  ticketUnits: Math.max(
                                    1,
                                    Math.min(50, Number(e.target.value) || 1)
                                  ),
                                })
                              }
                              placeholder="Qty"
                            />
                          </div>
                          <div className="space-y-2 min-w-0 sm:col-span-2 lg:col-span-1">
                            <Label>Line total</Label>
                            <div className="relative">
                              <Input
                                readOnly
                                disabled={!ready}
                                value={formatMoneyAmount(segmentLineTotal(segment))}
                                placeholder="Auto"
                                className="pr-16"
                              />
                              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                                {segmentCurrencyLabel(segment)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="space-y-2">
                      <Label>Grand total</Label>
                      <Input
                        readOnly
                        value={(() => {
                          const depLabel = segmentCurrencyLabel(ticket.departure);
                          const arrLabel = segmentCurrencyLabel(ticket.arrival);
                          const depTotal = segmentLineTotal(ticket.departure);
                          const arrTotal = segmentLineTotal(ticket.arrival);
                          if (!depTotal && !arrTotal) return "";
                          if (depLabel === arrLabel) {
                            return `${formatMoneyAmount(ticketGrandTotal(ticket))} ${depLabel}`;
                          }
                          return [
                            depTotal ? `${formatMoneyAmount(depTotal)} ${depLabel}` : "",
                            arrTotal ? `${formatMoneyAmount(arrTotal)} ${arrLabel}` : "",
                          ]
                            .filter(Boolean)
                            .join(" + ");
                        })()}
                        placeholder="Auto from all tickets"
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  id="ticket-notes"
                  title="Notes & documents"
                  description="Ticket notes and uploaded documents."
                  defaultOpen={false}
                >
                  <div className="space-y-1.5">
                    <Label>Ticket notes</Label>
                    <Textarea
                      rows={2}
                      value={ticket.notes}
                      onChange={(e) => setTicket({ ...ticket, notes: e.target.value })}
                    />
                  </div>
                  <TripDocumentsPanel
                    tripId={trip.id}
                    type="ticket"
                    documents={trip.documents}
                    onChanged={loadTrip}
                    titlePlaceholder="e.g. Outbound e-ticket"
                  />
                </CollapsibleSection>

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
              <CardContent className="space-y-8 min-w-0">
                <section className="space-y-3 min-w-0">
                  <div className="space-y-1">
                    <Label className="text-base text-foreground">Import visa PDF</Label>
                    <p className="text-xs text-muted-foreground">
                      Each upload adds another visa card. Upload once per traveler.
                    </p>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileUp className="h-4 w-4 text-primary shrink-0" />
                        Visa PDF
                      </p>
                      <Label
                        htmlFor="visa-pdf-upload"
                        className={`inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium cursor-pointer hover:bg-muted ${
                          parsingVisa ? "opacity-60 pointer-events-none" : ""
                        }`}
                      >
                        {parsingVisa ? "Reading PDF…" : "Choose PDF"}
                      </Label>
                      <Input
                        id="visa-pdf-upload"
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        disabled={parsingVisa}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          void parseVisaPdf(file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-3 min-w-0">
                  <VisasEditor value={visa.entries || []} onChange={updateVisaEntries} />
                </section>

                <section className="space-y-3 min-w-0">
                  <div className="space-y-1">
                    <Label className="text-base text-foreground">Cost & extras</Label>
                    <p className="text-xs text-muted-foreground">
                      Unit price × visa count. Units follow the number of visa cards.
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4 rounded-lg border border-border bg-muted/10 p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] gap-3 items-end rounded-md border border-border bg-muted/20 p-3">
                      <div className="space-y-1.5 min-w-0">
                        <Label>Unit price</Label>
                        <div className="flex min-w-0">
                          <Input
                            value={visa.cost}
                            onChange={(e) =>
                              setVisa(syncVisaCost({ ...visa, cost: e.target.value }))
                            }
                            placeholder="Price per visa"
                            className="min-w-0 rounded-r-none"
                          />
                          <Select
                            value={visa.currency || "PKR"}
                            onValueChange={(currency) =>
                              setVisa(
                                syncVisaCost({
                                  ...visa,
                                  currency: currency as TicketCurrency,
                                })
                              )
                            }
                          >
                            <SelectTrigger className="w-[96px] sm:w-[118px] shrink-0 rounded-l-none border-l-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TICKET_CURRENCY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {visa.currency === "OTHER" && (
                          <Input
                            value={visa.currencyOther || ""}
                            onChange={(e) =>
                              setVisa(
                                syncVisaCost({ ...visa, currencyOther: e.target.value })
                              )
                            }
                            placeholder="Currency name / code"
                            className="mt-2"
                          />
                        )}
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Units</Label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          readOnly
                          value={visa.entries?.length || visa.units || 1}
                          title="Follows number of visa cards"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0 sm:col-span-2 lg:col-span-1">
                        <Label>Line total</Label>
                        <div className="relative">
                          <Input
                            readOnly
                            value={formatMoneyAmount(visaLineTotal(visa))}
                            placeholder="Auto"
                            className="pr-16"
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                            {visaCurrencyLabel(visa)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5">
                      <span className="text-sm font-medium text-foreground">
                        Transport included with visa
                      </span>
                      <Switch
                        checked={visa.transportIncluded}
                        onCheckedChange={(checked) =>
                          setVisa({ ...visa, transportIncluded: checked })
                        }
                      />
                    </label>
                  </div>
                </section>

                <section className="space-y-3 min-w-0">
                  <div className="space-y-1">
                    <Label className="text-base text-foreground">Notes & documents</Label>
                  </div>
                  <div className="space-y-1.5">
                    <Label>General visa notes</Label>
                    <Textarea
                      rows={2}
                      value={visa.notes}
                      onChange={(e) => setVisa({ ...visa, notes: e.target.value })}
                    />
                  </div>
                  <TripDocumentsPanel
                    tripId={trip.id}
                    type="visa"
                    documents={trip.documents}
                    onChanged={loadTrip}
                    titlePlaceholder="e.g. Umrah visa copy"
                  />
                </section>

                <Button type="button" onClick={saveTrip} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotel">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Hotel & Transport</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 min-w-0">
                <section className="space-y-3 min-w-0">
                  <div className="space-y-1">
                    <Label className="text-base text-foreground">Import hotel voucher PDF</Label>
                    <p className="text-xs text-muted-foreground">
                      Loads voucher details, hotel stays, and transport transfers into this tab.
                    </p>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileUp className="h-4 w-4 text-primary shrink-0" />
                        Hotel voucher PDF
                      </p>
                      <Label
                        htmlFor="hotel-pdf-upload"
                        className={`inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium cursor-pointer hover:bg-muted ${
                          parsingHotel ? "opacity-60 pointer-events-none" : ""
                        }`}
                      >
                        {parsingHotel ? "Reading PDF…" : "Choose PDF"}
                      </Label>
                      <Input
                        id="hotel-pdf-upload"
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        disabled={parsingHotel}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          void parseHotelPdf(file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </div>
                  </div>
                </section>

                <HotelsEditor
                  hotelPackage={hotelPackage}
                  onPackageChange={setHotelPackage}
                  hotels={hotels}
                  onHotelsChange={setHotels}
                  transports={transports}
                  onTransportsChange={setTransports}
                />

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
              <CardContent className="space-y-8 min-w-0">
                <PaymentEditor
                  payment={payment}
                  onChange={setPayment}
                  ticket={ticket}
                  visa={visa}
                  hotels={hotels}
                  transports={transports}
                  tripId={trip.id}
                  onReceiptImported={loadTrip}
                />

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
                    Response includes <code>summary</code>, ticket/visa/hotels/transports,
                    payment with <code>serviceLines</code> + transactions, <code>costs</code>,
                    and documents. Downloads:{" "}
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
