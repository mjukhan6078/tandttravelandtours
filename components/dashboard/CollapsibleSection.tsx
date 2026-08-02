"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CollapsibleSection({
  id,
  title,
  description,
  summary,
  defaultOpen = true,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  /** Shown next to the title when collapsed / as subtitle in header */
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen ? [id] : []}
      className="min-w-0"
    >
      <AccordionItem
        value={id}
        className="rounded-lg border border-border bg-muted/10 px-3 sm:px-4 not-last:border-b-border"
      >
        <AccordionTrigger className="py-3 hover:no-underline">
          <div className="min-w-0 flex-1 text-left pr-2 space-y-0.5">
            <p className="text-base font-medium text-foreground leading-none">{title}</p>
            {(summary || description) && (
              <p className="text-xs text-muted-foreground truncate font-normal">
                {summary || description}
              </p>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-3 pt-1">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
