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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ROOM_OCCUPANCY_LABELS,
  STAY_CITY_LABELS,
  type RoomOccupancy,
  type StayCity,
  type TripHotel,
} from "@/lib/dashboard/types";
import { Plus, Trash2 } from "lucide-react";

function makeHotel(city: StayCity = "makkah"): TripHotel {
  return {
    id: `hotel_${Math.random().toString(36).slice(2, 10)}`,
    city,
    hotelName: "",
    nights: 1,
    checkIn: "",
    checkOut: "",
    occupancy: "separate",
    distance: "",
    breakfast: true,
    lunch: false,
    dinner: false,
    notes: "",
  };
}

export default function HotelsEditor({
  value,
  onChange,
}: {
  value: TripHotel[];
  onChange: (next: TripHotel[]) => void;
}) {
  const hotels = value;

  const updateHotel = (id: string, patch: Partial<TripHotel>) => {
    onChange(hotels.map((hotel) => (hotel.id === id ? { ...hotel, ...patch } : hotel)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <Label className="text-base">Hotels during trip</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Add each hotel stay with nights, occupancy, distance, and meals.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            onChange([
              ...hotels,
              makeHotel(hotels.at(-1)?.city === "makkah" ? "madina" : "makkah"),
            ])
          }
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add hotel
        </Button>
      </div>

      {hotels.length === 0 ? (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-4">
          No hotels yet. Add Makkah/Madina hotel stays for this trip.
        </p>
      ) : (
        <div className="space-y-4">
          {hotels.map((hotel, index) => (
            <div
              key={hotel.id}
              className="rounded-lg border border-border bg-muted/20 p-3 sm:p-4 space-y-3 sm:space-y-4 min-w-0"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-primary">Hotel {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() => onChange(hotels.filter((item) => item.id !== hotel.id))}
                  aria-label="Remove hotel"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Hotel name</Label>
                  <Input
                    value={hotel.hotelName}
                    onChange={(e) => updateHotel(hotel.id, { hotelName: e.target.value })}
                    placeholder="e.g. Pullman Zamzam Makkah"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select
                    value={hotel.city}
                    onValueChange={(city) => updateHotel(hotel.id, { city: city as StayCity })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="makkah">{STAY_CITY_LABELS.makkah}</SelectItem>
                      <SelectItem value="madina">{STAY_CITY_LABELS.madina}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nights</Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={hotel.nights}
                    onChange={(e) =>
                      updateHotel(hotel.id, {
                        nights: Math.max(1, Math.min(60, Number(e.target.value) || 1)),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input
                    type="date"
                    value={hotel.checkIn}
                    onChange={(e) => updateHotel(hotel.id, { checkIn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input
                    type="date"
                    value={hotel.checkOut}
                    onChange={(e) => updateHotel(hotel.id, { checkOut: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beds</Label>
                  <Select
                    value={hotel.occupancy}
                    onValueChange={(occupancy) =>
                      updateHotel(hotel.id, { occupancy: occupancy as RoomOccupancy })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROOM_OCCUPANCY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Distance</Label>
                  <Input
                    value={hotel.distance}
                    onChange={(e) => updateHotel(hotel.id, { distance: e.target.value })}
                    placeholder="e.g. 350m from Haram"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {(
                  [
                    ["breakfast", "Breakfast"],
                    ["lunch", "Lunch"],
                    ["dinner", "Dinner"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <span className="text-sm">{label}</span>
                    <Switch
                      checked={hotel[key]}
                      onCheckedChange={(checked) => updateHotel(hotel.id, { [key]: checked })}
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  rows={2}
                  value={hotel.notes}
                  onChange={(e) => updateHotel(hotel.id, { notes: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
