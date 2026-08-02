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
import { defaultTicketPassenger, type TicketPassenger } from "@/lib/dashboard/types";
import { Plus, Trash2 } from "lucide-react";

function passengerSummary(pax: TicketPassenger, index: number): string {
  return [
    `Passenger ${index + 1}`,
    pax.name,
    pax.ticketNo && `#${pax.ticketNo}`,
    pax.passport && `Passport ${pax.passport}`,
    pax.nationality,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function TicketPassengersEditor({
  value,
  onChange,
  showHeader = true,
}: {
  value: TicketPassenger[];
  onChange: (next: TicketPassenger[]) => void;
  showHeader?: boolean;
}) {
  const passengers = Array.isArray(value) ? value : [];
  const [openIds, setOpenIds] = useState<string[]>(() =>
    passengers.length ? [passengers[passengers.length - 1].id] : []
  );
  const prevIdsRef = useRef<string[]>(passengers.map((pax) => pax.id));

  useEffect(() => {
    const ids = passengers.map((pax) => pax.id);
    const prevIds = prevIdsRef.current;
    const added = ids.filter((id) => !prevIds.includes(id));
    prevIdsRef.current = ids;

    setOpenIds((prev) => {
      const stillOpen = prev.filter((id) => ids.includes(id));
      if (added.length > 0) {
        return [...stillOpen, ...added.filter((id) => !stillOpen.includes(id))];
      }
      return stillOpen;
    });
  }, [passengers]);

  const update = (id: string, patch: Partial<TicketPassenger>) => {
    onChange(passengers.map((pax) => (pax.id === id ? { ...pax, ...patch } : pax)));
  };

  const addPassenger = () => {
    const next = defaultTicketPassenger();
    onChange([...passengers, next]);
    setOpenIds((prev) => [...prev.filter((id) => id !== next.id), next.id]);
  };

  return (
    <div className="space-y-4">
      <div
        className={`flex flex-wrap items-center gap-3 ${
          showHeader ? "justify-between" : "justify-end"
        }`}
      >
        {showHeader && (
          <div className="min-w-0">
            <Label className="text-base text-foreground">Passengers</Label>
            <p className="text-xs text-muted-foreground mt-1">
              One card per passenger — click a header to expand or collapse. Pricing units follow
              this count.
            </p>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 self-center"
          onClick={addPassenger}
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
        <Accordion
          type="multiple"
          value={openIds}
          onValueChange={setOpenIds}
          className="space-y-3"
        >
          {passengers.map((pax, index) => (
            <AccordionItem
              key={pax.id}
              value={pax.id}
              className="rounded-lg border border-border bg-muted/20 px-3 sm:px-4 not-last:border-b-border"
            >
              <div className="flex w-full items-center gap-1">
                <div className="min-w-0 flex-1">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary text-left">
                      {passengerSummary(pax, index)}
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
                    onChange(passengers.filter((item) => item.id !== pax.id));
                  }}
                  aria-label="Remove passenger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <AccordionContent className="pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
