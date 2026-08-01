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
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          One card per passenger. Pricing units follow this count.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...passengers, defaultTicketPassenger()])}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add passenger
        </Button>
      </div>

      {passengers.length === 0 ? (
        <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border px-3 py-4">
          No passengers yet. Import a ticket PDF or add manually.
        </p>
      ) : (
        <div className="space-y-3">
          {passengers.map((pax, index) => (
            <div key={pax.id} className="rounded-md border border-border bg-background p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-primary">Passenger {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onChange(passengers.filter((item) => item.id !== pax.id))}
                  aria-label="Remove passenger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Full name</Label>
                  <Input
                    value={pax.name}
                    onChange={(e) => update(pax.id, { name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticket no.</Label>
                  <Input
                    value={pax.ticketNo}
                    onChange={(e) => update(pax.id, { ticketNo: e.target.value })}
                    placeholder="e.g. 1414858016047-048"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passport</Label>
                  <Input
                    value={pax.passport}
                    onChange={(e) => update(pax.id, { passport: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passport expiry</Label>
                  <Input
                    type="date"
                    value={pax.passportExpiry}
                    onChange={(e) => update(pax.id, { passportExpiry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
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
