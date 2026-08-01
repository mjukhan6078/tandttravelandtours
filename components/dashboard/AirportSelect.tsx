"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { airportShortLabel, searchAirports } from "@/lib/airports";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";

export default function AirportSelect({
  value,
  onChange,
  placeholder = "Search airport…",
  id,
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => searchAirports(query, 100), [query]);
  const display = value ? airportShortLabel(value) : "";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
          "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        )}
        onClick={() => {
          setOpen((prev) => !prev);
          setQuery("");
        }}
      >
        <span className={cn("truncate text-left", !display && "text-muted-foreground")}>
          {display || placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-md">
          <div className="p-2 border-b border-border">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type city, airport, or code…"
              className="h-9"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {value && (
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  Clear selection
                </button>
              </li>
            )}
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">No airports found</li>
            ) : (
              options.map((airport) => {
                const selected = airport.code === value;
                return (
                  <li key={airport.code}>
                    <button
                      type="button"
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                        selected && "bg-primary/10 text-primary"
                      )}
                      onClick={() => {
                        onChange(airport.code);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="font-medium">{airport.code}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        — {airport.city}, {airport.country}
                      </span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {airport.name}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
