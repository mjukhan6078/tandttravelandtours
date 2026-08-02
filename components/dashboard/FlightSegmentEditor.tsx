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
    <div className="space-y-3 rounded-lg border border-border bg-background p-3 sm:p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 min-w-0 ${className}`}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ColumnCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-sm font-semibold text-primary leading-none">{title}</p>
      <div className="flex flex-1 flex-col gap-3">{children}</div>
    </div>
  );
}

function LayoverSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (hours: number) => void;
  className?: string;
}) {
  const hours = parseConnectingDuration(value).hours;
  return (
    <Select
      value={hours > 0 ? String(hours) : undefined}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger className={className || "w-full"}>
        <SelectValue placeholder="Hours" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
          <SelectItem key={h} value={String(h)}>
            {h}h
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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

  const isConnecting = value.flightType === "connecting";

  return (
    <div className="space-y-3 sm:space-y-4 rounded-lg border border-border bg-muted/10 p-3 sm:p-4">
      {(title || hint) && (
        <div className="space-y-1">
          {title && <p className="text-sm font-medium text-foreground">{title}</p>}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      )}

      <Section title="Airline & flight">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Airline">
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
          </Field>
          <Field label="Flight type">
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
          </Field>
          <Field label="Flight date">
            <Input
              type="date"
              value={value.flightDate || ""}
              onChange={(e) => patch({ flightDate: e.target.value })}
            />
          </Field>
          <Field label="Flight number">
            <Input
              value={value.flightNumber}
              onChange={(e) => patch({ flightNumber: e.target.value })}
              placeholder="e.g. FZ 336"
            />
          </Field>
          {isConnecting && (
            <Field label="Connecting flight number" className="sm:col-span-2">
              <Input
                value={value.connectingFlightNumber || ""}
                onChange={(e) => patch({ connectingFlightNumber: e.target.value })}
                placeholder="e.g. FZ 827"
              />
            </Field>
          )}
        </div>
      </Section>

      <Section title="Route">
        <div
          className={
            isConnecting
              ? "grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch"
              : "grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch"
          }
        >
          <ColumnCard title="Departure">
            <Field label="Airport">
              <AirportSelect
                value={value.departureAirport}
                onChange={(departureAirport) => patch({ departureAirport })}
                placeholder="Select airport"
              />
            </Field>
            <Field label="Time">
              <Input
                type="time"
                value={value.departureTime || ""}
                onChange={(e) => patch({ departureTime: e.target.value })}
              />
            </Field>
            <Field label="Terminal">
              <Input
                value={value.departureTerminal || ""}
                onChange={(e) => patch({ departureTerminal: e.target.value })}
                placeholder="e.g. M"
              />
            </Field>
          </ColumnCard>

          {isConnecting && (
            <ColumnCard title="Via">
              <Field label="Airport">
                <AirportSelect
                  value={value.connectingAirport || ""}
                  onChange={(connectingAirport) => patch({ connectingAirport })}
                  placeholder="Select airport"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3">
                <Field label="Arrive time">
                  <Input
                    type="time"
                    value={value.connectingArrivalTime || ""}
                    onChange={(e) => updateViaArrival(e.target.value)}
                  />
                </Field>
                <Field label="Layover" className="sm:w-[92px]">
                  <LayoverSelect
                    value={value.connectingDuration}
                    onChange={updateViaDuration}
                    className="w-full"
                  />
                </Field>
                <Field label="Depart time">
                  <Input
                    type="time"
                    value={value.connectingDepartureTime || ""}
                    onChange={(e) => updateViaDeparture(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Arrive terminal">
                  <Input
                    value={value.connectingArrivalTerminal || ""}
                    onChange={(e) => patch({ connectingArrivalTerminal: e.target.value })}
                    placeholder="e.g. 2"
                  />
                </Field>
                <Field label="Depart terminal">
                  <Input
                    value={value.connectingDepartureTerminal || ""}
                    onChange={(e) => patch({ connectingDepartureTerminal: e.target.value })}
                    placeholder="e.g. 2"
                  />
                </Field>
              </div>
            </ColumnCard>
          )}

          <ColumnCard title="Arrival">
            <Field label="Airport">
              <AirportSelect
                value={value.arrivalAirport}
                onChange={(arrivalAirport) => patch({ arrivalAirport })}
                placeholder="Select airport"
              />
            </Field>
            <Field label="Time">
              <Input
                type="time"
                value={value.arrivalTime || ""}
                onChange={(e) => patch({ arrivalTime: e.target.value })}
              />
            </Field>
            <Field label="Terminal">
              <Input
                value={value.arrivalTerminal || ""}
                onChange={(e) => patch({ arrivalTerminal: e.target.value })}
                placeholder="e.g. 1"
              />
            </Field>
          </ColumnCard>
        </div>

        {isConnecting && value.connectingStay && (
          <p className="mt-3 text-sm text-muted-foreground rounded-md border border-border bg-muted/30 px-3 py-2.5 break-words leading-relaxed">
            <span className="font-medium text-foreground">
              {value.departureAirport || "—"}
            </span>
            {value.departureTime ? ` ${value.departureTime}` : ""}
            {" → "}
            <span className="font-medium text-foreground">{value.connectingStay}</span>
            {value.connectingArrivalTime || value.connectingDepartureTime
              ? ` (${value.connectingArrivalTime || "—"} → ${value.connectingDepartureTime || "—"})`
              : ""}
            {" → "}
            <span className="font-medium text-foreground">
              {value.arrivalAirport || "—"}
            </span>
            {value.arrivalTime ? ` ${value.arrivalTime}` : ""}
          </p>
        )}
      </Section>

      <Section title="Status & services">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Booking class">
            <Input
              value={value.bookingClass || ""}
              onChange={(e) => patch({ bookingClass: e.target.value })}
              placeholder="e.g. Y / Economy"
            />
          </Field>
          <Field label="Status">
            <Input
              value={value.status || ""}
              onChange={(e) => patch({ status: e.target.value })}
              placeholder="e.g. HK - Confirmed"
            />
          </Field>
          <Field label="Luggage allowance" className="sm:col-span-2">
            <Input
              value={value.luggageAllowance}
              onChange={(e) => patch({ luggageAllowance: e.target.value })}
              placeholder="e.g. 30kg"
            />
          </Field>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2.5 sm:col-span-2">
            <span className="text-sm font-medium text-foreground">Meal included</span>
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
