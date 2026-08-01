"use client";

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

export default function FlightSegmentEditor({
  title,
  hint,
  value,
  onChange,
}: {
  title: string;
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
      next.connectingArrivalTime = "";
      next.connectingDuration = "";
      next.connectingDepartureTime = "";
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

  const routeCols =
    value.flightType === "connecting" ? "sm:grid-cols-[1fr_1.6fr_1fr]" : "sm:grid-cols-2";

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
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
        <div className="space-y-2">
          <Label>Flight number</Label>
          <Input
            value={value.flightNumber}
            onChange={(e) => patch({ flightNumber: e.target.value })}
            placeholder="e.g. SV 724"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Flight type</Label>
          <Select
            value={value.flightType}
            onValueChange={(flightType) => patch({ flightType: flightType as FlightType })}
          >
            <SelectTrigger className="w-full sm:max-w-xs">
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
      </div>

      <div className={`grid gap-3 ${routeCols}`}>
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
        </div>

        {value.flightType === "connecting" && (
          <div className="space-y-2 min-w-0">
            <Label>Via</Label>
            <AirportSelect
              value={value.connectingAirport || ""}
              onChange={(connectingAirport) => patch({ connectingAirport })}
              placeholder="Connecting airport"
            />
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <Input
                type="time"
                value={value.connectingArrivalTime || ""}
                onChange={(e) => updateViaArrival(e.target.value)}
                aria-label="Arrival time at connecting airport"
              />
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
              <Input
                type="time"
                value={value.connectingDepartureTime || ""}
                onChange={(e) => updateViaDeparture(e.target.value)}
                aria-label="Departure time from connecting airport"
              />
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
        </div>
      </div>

      {value.flightType === "connecting" && value.connectingStay && (
        <p className="text-sm text-muted-foreground rounded-md border border-border bg-background px-3 py-2">
          {value.departureAirport || "—"}
          {value.departureTime ? ` ${value.departureTime}` : ""} → {value.connectingStay}
          {value.connectingArrivalTime || value.connectingDepartureTime
            ? ` (${value.connectingArrivalTime || "—"} → ${value.connectingDepartureTime || "—"})`
            : ""}{" "}
          → {value.arrivalAirport || "—"}
          {value.arrivalTime ? ` ${value.arrivalTime}` : ""}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label>Luggage allowance</Label>
          <Input
            value={value.luggageAllowance}
            onChange={(e) => patch({ luggageAllowance: e.target.value })}
            placeholder="e.g. 2 × 23kg + 7kg cabin"
          />
        </div>
        <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 sm:col-span-2">
          <span className="text-sm">Meal included</span>
          <Switch
            checked={value.mealIncluded}
            onCheckedChange={(checked) => patch({ mealIncluded: checked })}
          />
        </label>
      </div>
    </div>
  );
}
