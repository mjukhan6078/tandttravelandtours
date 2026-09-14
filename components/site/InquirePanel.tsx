"use client";

import { X } from "lucide-react";
import { useInquire } from "./InquireContext";
import InquiryForm from "./InquiryForm";
import { cn } from "@/lib/utils";

export default function InquirePanel() {
  const { open, setOpen } = useInquire();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0 right-0" : "translate-x-full right-0"
        )}
        aria-hidden={!open}
        aria-label="Inquire now"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-primary">
            Inquire Now
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-2 text-foreground hover:bg-muted"
            aria-label="Close inquire panel"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <InquiryForm
            type="inquire"
            onSuccess={() => {
              setTimeout(() => setOpen(false), 1200);
            }}
          />
        </div>
      </aside>
    </>
  );
}
