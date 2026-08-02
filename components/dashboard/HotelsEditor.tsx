"use client";

import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  defaultHotel,
  defaultHotelPackage,
  defaultTransport,
  type RoomOccupancy,
  type StayCity,
  type TripHotel,
  type TripHotelPackage,
  type TripTransport,
} from "@/lib/dashboard/types";
import { Plus, Trash2 } from "lucide-react";

function makeHotel(city: StayCity = "makkah"): TripHotel {
  return {
    ...defaultHotel(city),
    id: `hotel_${Math.random().toString(36).slice(2, 10)}`,
  };
}

function makeTransport(): TripTransport {
  return {
    ...defaultTransport(),
    id: `transport_${Math.random().toString(36).slice(2, 10)}`,
  };
}

function hotelSummary(hotel: TripHotel, index: number): string {
  return [
    `Hotel ${index + 1}`,
    STAY_CITY_LABELS[hotel.city],
    hotel.hotelName,
    hotel.nights ? `${hotel.nights}n` : "",
    hotel.reservationNumber,
  ]
    .filter(Boolean)
    .join(" · ");
}

function transportSummary(row: TripTransport, index: number): string {
  return [
    `Transfer ${index + 1}`,
    row.service,
    row.pickupDate,
    row.vehicle,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function HotelsEditor({
  hotelPackage,
  onPackageChange,
  hotels,
  onHotelsChange,
  transports,
  onTransportsChange,
}: {
  hotelPackage: TripHotelPackage;
  onPackageChange: (next: TripHotelPackage) => void;
  hotels: TripHotel[];
  onHotelsChange: (next: TripHotel[]) => void;
  transports: TripTransport[];
  onTransportsChange: (next: TripTransport[]) => void;
}) {
  const pkg = { ...defaultHotelPackage(), ...hotelPackage };
  const [openHotelIds, setOpenHotelIds] = useState<string[]>(() =>
    hotels.length ? [hotels[hotels.length - 1].id] : []
  );
  const [openTransportIds, setOpenTransportIds] = useState<string[]>(() =>
    transports.length ? [transports[transports.length - 1].id] : []
  );
  const prevHotelIdsRef = useRef<string[]>(hotels.map((h) => h.id));
  const prevTransportIdsRef = useRef<string[]>(transports.map((t) => t.id));

  useEffect(() => {
    const ids = hotels.map((h) => h.id);
    const prev = prevHotelIdsRef.current;
    const added = ids.filter((id) => !prev.includes(id));
    prevHotelIdsRef.current = ids;
    setOpenHotelIds((current) => {
      const stillOpen = current.filter((id) => ids.includes(id));
      return added.length
        ? [...stillOpen, ...added.filter((id) => !stillOpen.includes(id))]
        : stillOpen;
    });
  }, [hotels]);

  useEffect(() => {
    const ids = transports.map((t) => t.id);
    const prev = prevTransportIdsRef.current;
    const added = ids.filter((id) => !prev.includes(id));
    prevTransportIdsRef.current = ids;
    setOpenTransportIds((current) => {
      const stillOpen = current.filter((id) => ids.includes(id));
      return added.length
        ? [...stillOpen, ...added.filter((id) => !stillOpen.includes(id))]
        : stillOpen;
    });
  }, [transports]);

  const updateHotel = (id: string, patch: Partial<TripHotel>) => {
    onHotelsChange(hotels.map((hotel) => (hotel.id === id ? { ...hotel, ...patch } : hotel)));
  };

  const updateTransport = (id: string, patch: Partial<TripTransport>) => {
    onTransportsChange(
      transports.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="space-y-1">
          <Label className="text-base text-foreground">Voucher details</Label>
          <p className="text-xs text-muted-foreground">
            Shared fields from the Umrah package hotel voucher.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 min-w-0">
            <Label>Voucher no.</Label>
            <Input
              value={pkg.voucherNumber}
              onChange={(e) => onPackageChange({ ...pkg, voucherNumber: e.target.value })}
              placeholder="e.g. HV-0215"
            />
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label>Issue date</Label>
            <Input
              type="date"
              value={pkg.issueDate}
              onChange={(e) => onPackageChange({ ...pkg, issueDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 min-w-0 sm:col-span-2">
            <Label>Party name</Label>
            <Input
              value={pkg.partyName}
              onChange={(e) => onPackageChange({ ...pkg, partyName: e.target.value })}
              placeholder="e.g. SARFARAZ BALOCH"
            />
          </div>
          <div className="space-y-1.5 min-w-0 sm:col-span-2">
            <Label>Saudi Umrah company</Label>
            <Input
              value={pkg.saudiCompany}
              onChange={(e) => onPackageChange({ ...pkg, saudiCompany: e.target.value })}
              placeholder="e.g. ETLALAT MAKKAH FOR UMRAH SERVICE"
            />
          </div>
          <div className="space-y-1.5 min-w-0 sm:col-span-2">
            <Label>Package category</Label>
            <Input
              value={pkg.packageCategory}
              onChange={(e) => onPackageChange({ ...pkg, packageCategory: e.target.value })}
              placeholder="e.g. EXECUTIVE"
            />
          </div>
          <div className="space-y-1.5 min-w-0 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={pkg.notes}
              onChange={(e) => onPackageChange({ ...pkg, notes: e.target.value })}
              placeholder="e.g. Check-in 1600 / Check-out 1200"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <Label className="text-base text-foreground">Hotels</Label>
            <p className="text-xs text-muted-foreground mt-1">
              One card per hotel stay — click a header to expand or collapse.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() =>
              onHotelsChange([
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
            No hotels yet. Import a voucher PDF or add manually.
          </p>
        ) : (
          <Accordion
            type="multiple"
            value={openHotelIds}
            onValueChange={setOpenHotelIds}
            className="space-y-3"
          >
            {hotels.map((hotel, index) => (
              <AccordionItem
                key={hotel.id}
                value={hotel.id}
                className="rounded-lg border border-border bg-muted/20 px-3 sm:px-4 not-last:border-b-border"
              >
                <div className="flex w-full items-center gap-1">
                  <div className="min-w-0 flex-1">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary text-left">
                        {hotelSummary(hotel, index)}
                      </span>
                    </AccordionTrigger>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onHotelsChange(hotels.filter((item) => item.id !== hotel.id));
                    }}
                    aria-label="Remove hotel"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <AccordionContent className="pb-4">
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5 min-w-0 sm:col-span-2">
                        <Label>Hotel name</Label>
                        <Input
                          value={hotel.hotelName}
                          onChange={(e) => updateHotel(hotel.id, { hotelName: e.target.value })}
                          placeholder="e.g. Gulnar Taiba"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>City</Label>
                        <Select
                          value={hotel.city}
                          onValueChange={(city) =>
                            updateHotel(hotel.id, { city: city as StayCity })
                          }
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
                      <div className="space-y-1.5 min-w-0">
                        <Label>HN#</Label>
                        <Input
                          value={hotel.hotelNumber || ""}
                          onChange={(e) => updateHotel(hotel.id, { hotelNumber: e.target.value })}
                          placeholder="e.g. 385"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Reservation</Label>
                        <Input
                          value={hotel.reservationNumber || ""}
                          onChange={(e) =>
                            updateHotel(hotel.id, { reservationNumber: e.target.value })
                          }
                          placeholder="e.g. HB-4075"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Rooms</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={hotel.rooms ?? 1}
                          onChange={(e) =>
                            updateHotel(hotel.id, {
                              rooms: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0 sm:col-span-2">
                        <Label>Room type</Label>
                        <Input
                          value={hotel.roomType || ""}
                          onChange={(e) => updateHotel(hotel.id, { roomType: e.target.value })}
                          placeholder="e.g. Quint bedroom with Haram view"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
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
                      <div className="space-y-1.5 min-w-0">
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
                      <div className="space-y-1.5 min-w-0">
                        <Label>Check-in</Label>
                        <Input
                          type="date"
                          value={hotel.checkIn}
                          onChange={(e) => updateHotel(hotel.id, { checkIn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Check-out</Label>
                        <Input
                          type="date"
                          value={hotel.checkOut}
                          onChange={(e) => updateHotel(hotel.id, { checkOut: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Distance</Label>
                        <Input
                          value={hotel.distance}
                          onChange={(e) => updateHotel(hotel.id, { distance: e.target.value })}
                          placeholder="e.g. Haram view"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0 sm:col-span-2">
                        <Label>Contact</Label>
                        <Input
                          value={hotel.contact || ""}
                          onChange={(e) => updateHotel(hotel.id, { contact: e.target.value })}
                          placeholder="e.g. Medinah Operations: +966…"
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
                            onCheckedChange={(checked) =>
                              updateHotel(hotel.id, { [key]: checked })
                            }
                          />
                        </label>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Notes</Label>
                      <Textarea
                        rows={2}
                        value={hotel.notes}
                        onChange={(e) => updateHotel(hotel.id, { notes: e.target.value })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <Label className="text-base text-foreground">Transport</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Airport transfers and ziyarat movements from the voucher.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => onTransportsChange([...transports, makeTransport()])}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add transfer
          </Button>
        </div>

        {transports.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-4">
            No transport yet. Import a voucher PDF or add manually.
          </p>
        ) : (
          <Accordion
            type="multiple"
            value={openTransportIds}
            onValueChange={setOpenTransportIds}
            className="space-y-3"
          >
            {transports.map((row, index) => (
              <AccordionItem
                key={row.id}
                value={row.id}
                className="rounded-lg border border-border bg-muted/20 px-3 sm:px-4 not-last:border-b-border"
              >
                <div className="flex w-full items-center gap-1">
                  <div className="min-w-0 flex-1">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary text-left">
                        {transportSummary(row, index)}
                      </span>
                    </AccordionTrigger>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onTransportsChange(transports.filter((item) => item.id !== row.id));
                    }}
                    aria-label="Remove transfer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Service</Label>
                      <Input
                        value={row.service}
                        onChange={(e) => updateTransport(row.id, { service: e.target.value })}
                        placeholder="e.g. MED APT - MED HTL"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>TN#</Label>
                      <Input
                        value={row.tnNumber}
                        onChange={(e) => updateTransport(row.id, { tnNumber: e.target.value })}
                        placeholder="e.g. 371"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Vehicle</Label>
                      <Input
                        value={row.vehicle}
                        onChange={(e) => updateTransport(row.id, { vehicle: e.target.value })}
                        placeholder="e.g. H1"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Pick-up date</Label>
                      <Input
                        type="date"
                        value={row.pickupDate}
                        onChange={(e) => updateTransport(row.id, { pickupDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Booking ref.</Label>
                      <Input
                        value={row.bookingRef}
                        onChange={(e) => updateTransport(row.id, { bookingRef: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Contact person</Label>
                      <Input
                        value={row.contactPerson}
                        onChange={(e) =>
                          updateTransport(row.id, { contactPerson: e.target.value })
                        }
                        placeholder="e.g. NAZIR AHMED (+966…)"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        rows={2}
                        value={row.notes}
                        onChange={(e) => updateTransport(row.id, { notes: e.target.value })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </div>
  );
}
