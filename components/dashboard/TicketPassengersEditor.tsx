"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultTicketPassenger, type TicketPassenger } from "@/lib/dashboard/types";
import { Plus, Trash2 } from "lucide-react";

export default function TicketPassengersEditor({
  value,
  onChange,
}: {
  value: TicketPassenger[];
  onChange: (next: TicketPassenger[]) => void;
}) {
  const passengers = Array.isArray(value) ? value : [];

  const update = (id: string, patch: Partial<TicketPassenger>) => {
    onChange(passengers.map((pax) => (pax.id === id ? { ...pax, ...patch } : pax)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Label className="text-base text-foreground">Passengers</Label>
          <p className="text-xs text-muted-foreground mt-1">
            One card per passenger. Pricing units follow this count.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 self-center"
          onClick={() => onChange([...passengers, defaultTicketPassenger()])}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add passenger
        </Button>
      </div>

      {passengers.length === 0 ? (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-4">
          No passengers yet. Import a ticket PDF or add manually.
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {passengers.map((pax, index) => (
            <div
              key={pax.id}
              className="rounded-lg border border-border bg-muted/20 p-3 sm:p-4 space-y-3 sm:space-y-4 min-w-0"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-primary">Passenger {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() => onChange(passengers.filter((item) => item.id !== pax.id))}
                  aria-label="Remove passenger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 min-w-0 sm:col-span-2">
                  <Label>Full name</Label>
                  <Input
                    value={pax.name}
                    onChange={(e) => update(pax.id, { name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label>Ticket no.</Label>
                  <Input
                    value={pax.ticketNo}
                    onChange={(e) => update(pax.id, { ticketNo: e.target.value })}
                    placeholder="e.g. 1414858016047-048"
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label>Passport</Label>
                  <Input
                    value={pax.passport}
                    onChange={(e) => update(pax.id, { passport: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label>Passport expiry</Label>
                  <Input
                    type="date"
                    value={pax.passportExpiry}
                    onChange={(e) => update(pax.id, { passportExpiry: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label>Nationality</Label>
                  <Input
                    value={pax.nationality}
                    onChange={(e) => update(pax.id, { nationality: e.target.value })}
                    placeholder="PK"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
