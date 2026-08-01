"use client";

import AirportSelect from "@/components/dashboard/AirportSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIRLINE_OPTIONS, airlineLabel } from "@/lib/airlines";
import {
  formatConnectingDuration,
  formatConnectingStay,
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
      next.connectingTime = "";
      next.connectingDuration = "";
      next.connectingStay = "";
    }
    onChange(next);
  };

  const routeCols =
    value.flightType === "connecting"
      ? "sm:grid-cols-[1.2fr_1.2fr_90px_1.2fr]"
      : "sm:grid-cols-2";

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
          <>
            <div className="space-y-2 min-w-0">
              <Label>Via</Label>
              <AirportSelect
                value={value.connectingAirport || ""}
                onChange={(connectingAirport) => patch({ connectingAirport })}
                placeholder="Connecting airport"
              />
              <Input
                type="time"
                value={value.connectingTime || ""}
                onChange={(e) => patch({ connectingTime: e.target.value })}
                aria-label="Via time"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input
                type="number"
                min={0}
                max={72}
                value={parseConnectingDuration(value.connectingDuration).hours || ""}
                onChange={(e) => {
                  const hours = Math.max(0, Math.min(72, Number(e.target.value) || 0));
                  patch({ connectingDuration: formatConnectingDuration(hours) });
                }}
                placeholder="Hours"
              />
            </div>
          </>
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
          {value.departureAirport || "—"} → {value.connectingStay} →{" "}
          {value.arrivalAirport || "—"}
        </p>
      )}
    </div>
  );
}
