"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, X } from "lucide-react";
import { PHONE_TEL, WHATSAPP_DISPLAY, waLink } from "@/lib/site/contact";
import { useInquire } from "./InquireContext";
import InquiryForm from "./InquiryForm";
import { WhatsAppIcon } from "./icons";

export default function InquirePanel() {
  const { open, setOpen, prefill } = useInquire();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Plan my trip"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-navy to-primary px-6 pb-6 pt-5 text-white">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-brand-cyan/20 blur-2xl" aria-hidden />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Plan my trip</p>
                  <h2 className="mt-1 text-xl font-bold">Tell us about your journey</h2>
                  <p className="mt-1 text-sm text-white/70">We usually reply within a few hours.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-white/80 transition hover:rotate-90 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="relative mt-4 flex gap-2">
                <a
                  href={waLink("Assalam o Alaikum, I'd like to plan a trip.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white"
                >
                  <WhatsAppIcon className="size-4" /> WhatsApp
                </a>
                <a
                  href={PHONE_TEL}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/20"
                >
                  <Phone className="size-3.5" /> {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <InquiryForm
                type="inquire"
                compact
                defaultInterest={prefill.interest}
                defaultMessage={prefill.message}
                onSuccess={() => setTimeout(() => setOpen(false), 2200)}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
