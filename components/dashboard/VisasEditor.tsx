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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VISA_STATUS_LABELS,
  defaultVisaRecord,
  type VisaRecord,
  type VisaStatus,
} from "@/lib/dashboard/types";
import { Plus, Trash2 } from "lucide-react";

function visaSummary(entry: VisaRecord, index: number): string {
  return [
    `Visa ${index + 1}`,
    entry.fullName,
    entry.visaNumber && `#${entry.visaNumber}`,
    entry.visaType,
    entry.status !== "not_applied" ? VISA_STATUS_LABELS[entry.status] : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function VisasEditor({
  value,
  onChange,
}: {
  value: VisaRecord[];
  onChange: (next: VisaRecord[]) => void;
}) {
  const entries = Array.isArray(value) ? value : [];
  const [openIds, setOpenIds] = useState<string[]>(() =>
    entries.length ? [entries[entries.length - 1].id] : []
  );
  const prevIdsRef = useRef<string[]>(entries.map((entry) => entry.id));

  useEffect(() => {
    const ids = entries.map((entry) => entry.id);
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
  }, [entries]);

  const update = (id: string, patch: Partial<VisaRecord>) => {
    onChange(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const addVisa = () => {
    const next = defaultVisaRecord();
    onChange([...entries, next]);
    setOpenIds((prev) => [...prev.filter((id) => id !== next.id), next.id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Label className="text-base text-foreground">Visas</Label>
          <p className="text-xs text-muted-foreground mt-1">
            One card per visa — click a header to expand or collapse. Cost units follow this
            count.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 self-center"
          onClick={addVisa}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add visa
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-4">
          No visas yet. Import a visa PDF or add manually.
        </p>
      ) : (
        <Accordion
          type="multiple"
          value={openIds}
          onValueChange={setOpenIds}
          className="space-y-3"
        >
          {entries.map((entry, index) => (
            <AccordionItem
              key={entry.id}
              value={entry.id}
              className="rounded-lg border border-border bg-muted/20 px-3 sm:px-4 not-last:border-b-border"
            >
              <div className="flex w-full items-center gap-1">
                <div className="min-w-0 flex-1">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary text-left">
                      {visaSummary(entry, index)}
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
                    onChange(entries.filter((item) => item.id !== entry.id));
                  }}
                  aria-label="Remove visa"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <AccordionContent className="pb-4">
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <Label>Visa status</Label>
                      <Select
                        value={entry.status}
                        onValueChange={(v) => update(entry.id, { status: v as VisaStatus })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(VISA_STATUS_LABELS).map(([optionValue, label]) => (
                            <SelectItem key={optionValue} value={optionValue}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Visa type</Label>
                      <Input
                        value={entry.visaType}
                        onChange={(e) => update(entry.id, { visaType: e.target.value })}
                        placeholder="e.g. Umrah"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Visa no.</Label>
                      <Input
                        value={entry.visaNumber}
                        onChange={(e) => update(entry.id, { visaNumber: e.target.value })}
                        placeholder="e.g. 6159522166"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Application no.</Label>
                      <Input
                        value={entry.applicationNumber}
                        onChange={(e) =>
                          update(entry.id, { applicationNumber: e.target.value })
                        }
                        placeholder="e.g. E810637607"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Valid from</Label>
                      <Input
                        type="date"
                        value={entry.validFrom}
                        onChange={(e) => update(entry.id, { validFrom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Valid until</Label>
                      <Input
                        type="date"
                        value={entry.validTo}
                        onChange={(e) => update(entry.id, { validTo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Duration of stay</Label>
                      <Input
                        value={entry.durationOfStay}
                        onChange={(e) => update(entry.id, { durationOfStay: e.target.value })}
                        placeholder="e.g. 90 Days"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Full name</Label>
                      <Input
                        value={entry.fullName}
                        onChange={(e) => update(entry.id, { fullName: e.target.value })}
                        placeholder="Full name as on visa"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Passport no.</Label>
                      <Input
                        value={entry.passportNumber}
                        onChange={(e) => update(entry.id, { passportNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Nationality</Label>
                      <Input
                        value={entry.nationality}
                        onChange={(e) => update(entry.id, { nationality: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Birth date</Label>
                      <Input
                        type="date"
                        value={entry.birthDate}
                        onChange={(e) => update(entry.id, { birthDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Border no.</Label>
                      <Input
                        value={entry.borderNumber}
                        onChange={(e) => update(entry.id, { borderNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Place of issue</Label>
                      <Input
                        value={entry.placeOfIssue}
                        onChange={(e) => update(entry.id, { placeOfIssue: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Umrah operator</Label>
                      <Input
                        value={entry.umrahOperator}
                        onChange={(e) => update(entry.id, { umrahOperator: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>External agent</Label>
                      <Input
                        value={entry.externalAgent}
                        onChange={(e) => update(entry.id, { externalAgent: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Vendor</Label>
                      <Input
                        value={entry.vendor}
                        onChange={(e) => update(entry.id, { vendor: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        rows={2}
                        value={entry.notes}
                        onChange={(e) => update(entry.id, { notes: e.target.value })}
                      />
                    </div>
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
