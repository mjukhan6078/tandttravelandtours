"use client";

import type { ReactNode } from "react";
import AirportSelect from "@/components/dashboard/AirportSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIRLINE_OPTIONS, airlineLabel } from "@/lib/airlines";
import {
  addHoursToTime,
  formatConnectingDuration,
  formatConnectingStay,
  hoursBetweenTimes,
  parseConnectingDuration,
} from "@/lib/dashboard/connecting";
import {
  FLIGHT_TYPE_LABELS,
  type FlightSegment,
  type FlightType,
} from "@/lib/dashboard/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border/70 bg-background/70 p-3 sm:p-3.5">
      <p className="text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}

export default function FlightSegmentEditor({
  title,
  hint,
  value,
  onChange,
}: {
  title?: string;
  hint?: string;
  value: FlightSegment;
  onChange: (next: FlightSegment) => void;
}) {
  const patch = (partial: Partial<FlightSegment>) => {
    const next = { ...value, ...partial };
    if (next.flightType === "connecting") {
      next.connectingStay = formatConnectingStay(
        next.connectingAirport || "",
        next.connectingDuration || ""
      );
    } else {
      next.connectingAirport = "";
      next.connectingFlightNumber = "";
      next.connectingArrivalTime = "";
      next.connectingDuration = "";
      next.connectingDepartureTime = "";
      next.connectingArrivalTerminal = "";
      next.connectingDepartureTerminal = "";
      next.connectingStay = "";
    }
    onChange(next);
  };

  const updateViaArrival = (connectingArrivalTime: string) => {
    const hours = parseConnectingDuration(value.connectingDuration).hours;
    const connectingDepartureTime =
      connectingArrivalTime && hours > 0
        ? addHoursToTime(connectingArrivalTime, hours)
        : value.connectingDepartureTime;
    patch({ connectingArrivalTime, connectingDepartureTime });
  };

  const updateViaDuration = (hours: number) => {
    const connectingDuration = formatConnectingDuration(hours);
    const connectingDepartureTime =
      value.connectingArrivalTime && hours > 0
        ? addHoursToTime(value.connectingArrivalTime, hours)
        : "";
    patch({ connectingDuration, connectingDepartureTime });
  };

  const updateViaDeparture = (connectingDepartureTime: string) => {
    if (value.connectingArrivalTime && connectingDepartureTime) {
      const hours = hoursBetweenTimes(value.connectingArrivalTime, connectingDepartureTime);
      patch({
        connectingDepartureTime,
        connectingDuration: formatConnectingDuration(hours),
      });
      return;
    }
    patch({ connectingDepartureTime });
  };

  return (
    <div className="space-y-3 sm:space-y-4 rounded-lg border border-border bg-muted/20 p-3 sm:p-4">
      {(title || hint) && (
        <div>
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
      )}

      <Section title="Airline & flight">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2 min-w-0">
            <Label>Airline</Label>
            <Select
              value={value.airline || undefined}
              onValueChange={(airline) => patch({ airline })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select airline" />
              </SelectTrigger>
              <SelectContent>
                {value.airline &&
                  !AIRLINE_OPTIONS.some((option) => option.value === value.airline) && (
                    <SelectItem value={value.airline}>{airlineLabel(value.airline)}</SelectItem>
                  )}
                {AIRLINE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 min-w-0">
            <Label>Flight type</Label>
            <Select
              value={value.flightType}
              onValueChange={(flightType) => patch({ flightType: flightType as FlightType })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FLIGHT_TYPE_LABELS).map(([optionValue, label]) => (
                  <SelectItem key={optionValue} value={optionValue}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 min-w-0">
            <Label>Flight date</Label>
            <Input
              type="date"
              value={value.flightDate || ""}
              onChange={(e) => patch({ flightDate: e.target.value })}
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label>Flight number</Label>
            <Input
              value={value.flightNumber}
              onChange={(e) => patch({ flightNumber: e.target.value })}
              placeholder="e.g. FZ 336"
            />
          </div>
          {value.flightType === "connecting" && (
            <div className="space-y-2 min-w-0 sm:col-span-2">
              <Label>Connecting flight number</Label>
              <Input
                value={value.connectingFlightNumber || ""}
                onChange={(e) => patch({ connectingFlightNumber: e.target.value })}
                placeholder="e.g. FZ 827"
              />
            </div>
          )}
        </div>
      </Section>

      <Section title="Route">
        <div
          className={
            value.flightType === "connecting"
              ? "grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] gap-4"
              : "grid grid-cols-1 sm:grid-cols-2 gap-4"
          }
        >
          <div className="space-y-2 min-w-0">
            <Label>Departure</Label>
            <AirportSelect
              value={value.departureAirport}
              onChange={(departureAirport) => patch({ departureAirport })}
              placeholder="Departure airport"
            />
            <Input
              type="time"
              value={value.departureTime || ""}
              onChange={(e) => patch({ departureTime: e.target.value })}
              aria-label="Departure time"
            />
            <Input
              value={value.departureTerminal || ""}
              onChange={(e) => patch({ departureTerminal: e.target.value })}
              placeholder="Terminal"
            />
          </div>

          {value.flightType === "connecting" && (
            <div className="space-y-2 min-w-0 rounded-md border border-border/60 bg-muted/30 p-3 md:border-0 md:bg-transparent md:p-0">
              <Label>Via</Label>
              <AirportSelect
                value={value.connectingAirport || ""}
                onChange={(connectingAirport) => patch({ connectingAirport })}
                placeholder="Connecting airport"
              />

              {/* Mobile: stacked arrive → layover → depart */}
              <div className="space-y-3 md:hidden">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Arrive at via</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      value={value.connectingArrivalTime || ""}
                      onChange={(e) => updateViaArrival(e.target.value)}
                      aria-label="Arrival time at connecting airport"
                    />
                    <Input
                      value={value.connectingArrivalTerminal || ""}
                      onChange={(e) => patch({ connectingArrivalTerminal: e.target.value })}
                      placeholder="Arrive terminal"
                      aria-label="Arrival terminal at connecting airport"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Layover</p>
                  <Select
                    value={
                      parseConnectingDuration(value.connectingDuration).hours > 0
                        ? String(parseConnectingDuration(value.connectingDuration).hours)
                        : undefined
                    }
                    onValueChange={(v) => updateViaDuration(Number(v))}
                  >
                    <SelectTrigger className="w-full" aria-label="Connecting stay duration hours">
                      <SelectValue placeholder="Hours" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((hours) => (
                        <SelectItem key={hours} value={String(hours)}>
                          {hours}h
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Depart from via</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      value={value.connectingDepartureTime || ""}
                      onChange={(e) => updateViaDeparture(e.target.value)}
                      aria-label="Departure time from connecting airport"
                    />
                    <Input
                      value={value.connectingDepartureTerminal || ""}
                      onChange={(e) => patch({ connectingDepartureTerminal: e.target.value })}
                      placeholder="Depart terminal"
                      aria-label="Departure terminal from connecting airport"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop: arrive | hours | depart */}
              <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] gap-2 items-start">
                <div className="space-y-2 min-w-0">
                  <Input
                    type="time"
                    value={value.connectingArrivalTime || ""}
                    onChange={(e) => updateViaArrival(e.target.value)}
                    aria-label="Arrival time at connecting airport"
                  />
                  <Input
                    value={value.connectingArrivalTerminal || ""}
                    onChange={(e) => patch({ connectingArrivalTerminal: e.target.value })}
                    placeholder="Arrive terminal"
                    aria-label="Arrival terminal at connecting airport"
                  />
                </div>
                <Select
                  value={
                    parseConnectingDuration(value.connectingDuration).hours > 0
                      ? String(parseConnectingDuration(value.connectingDuration).hours)
                      : undefined
                  }
                  onValueChange={(v) => updateViaDuration(Number(v))}
                >
                  <SelectTrigger className="w-[88px]" aria-label="Connecting stay duration hours">
                    <SelectValue placeholder="Hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((hours) => (
                      <SelectItem key={hours} value={String(hours)}>
                        {hours}h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-2 min-w-0">
                  <Input
                    type="time"
                    value={value.connectingDepartureTime || ""}
                    onChange={(e) => updateViaDeparture(e.target.value)}
                    aria-label="Departure time from connecting airport"
                  />
                  <Input
                    value={value.connectingDepartureTerminal || ""}
                    onChange={(e) => patch({ connectingDepartureTerminal: e.target.value })}
                    placeholder="Depart terminal"
                    aria-label="Departure terminal from connecting airport"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 min-w-0">
            <Label>Arrival</Label>
            <AirportSelect
              value={value.arrivalAirport}
              onChange={(arrivalAirport) => patch({ arrivalAirport })}
              placeholder="Arrival airport"
            />
            <Input
              type="time"
              value={value.arrivalTime || ""}
              onChange={(e) => patch({ arrivalTime: e.target.value })}
              aria-label="Arrival time"
            />
            <Input
              value={value.arrivalTerminal || ""}
              onChange={(e) => patch({ arrivalTerminal: e.target.value })}
              placeholder="Terminal"
            />
          </div>
        </div>

        {value.flightType === "connecting" && value.connectingStay && (
          <p className="text-xs sm:text-sm text-muted-foreground rounded-md border border-border px-3 py-2 break-words">
            {value.departureAirport || "—"}
            {value.departureTime ? ` ${value.departureTime}` : ""} → {value.connectingStay}
            {value.connectingArrivalTime || value.connectingDepartureTime
              ? ` (${value.connectingArrivalTime || "—"} → ${value.connectingDepartureTime || "—"})`
              : ""}{" "}
            → {value.arrivalAirport || "—"}
            {value.arrivalTime ? ` ${value.arrivalTime}` : ""}
          </p>
        )}
      </Section>

      <Section title="Status & services">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2 min-w-0">
            <Label>Booking class</Label>
            <Input
              value={value.bookingClass || ""}
              onChange={(e) => patch({ bookingClass: e.target.value })}
              placeholder="e.g. Y / Economy"
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label>Status</Label>
            <Input
              value={value.status || ""}
              onChange={(e) => patch({ status: e.target.value })}
              placeholder="e.g. HK - Confirmed"
            />
          </div>
          <div className="space-y-2 min-w-0 sm:col-span-2">
            <Label>Luggage allowance</Label>
            <Input
              value={value.luggageAllowance}
              onChange={(e) => patch({ luggageAllowance: e.target.value })}
              placeholder="e.g. 30kg"
            />
          </div>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 sm:col-span-2">
            <span className="text-sm">Meal included</span>
            <Switch
              checked={value.mealIncluded}
              onCheckedChange={(checked) => patch({ mealIncluded: checked })}
            />
          </label>
        </div>
      </Section>
    </div>
  );
}
