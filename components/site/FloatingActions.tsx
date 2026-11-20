"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, X } from "lucide-react";
import { waLink, WHATSAPP_NAME } from "@/lib/site/contact";
import { WhatsAppIcon } from "./icons";
import { cn } from "@/lib/utils";

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [bubble, setBubble] = useState(false);
  // The Umrah planner has a fixed estimate bar at the bottom on mobile.
  const raised = usePathname() === "/umrah-planner";

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const show = setTimeout(() => setBubble(true), 2500);
    const hide = setTimeout(() => setBubble(false), 14000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <div className={cn("fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3", raised && "bottom-24 lg:bottom-5")}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="relative w-64 rounded-2xl border border-border bg-white p-4 pr-8 text-sm shadow-xl"
          >
            <button
              type="button"
              onClick={() => setBubble(false)}
              className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label="Dismiss chat prompt"
            >
              <X className="size-3.5" />
            </button>
            <p className="font-semibold text-foreground">Assalam o Alaikum 👋</p>
            <p className="mt-1 text-muted-foreground">
              Planning Umrah or a trip? Chat with {WHATSAPP_NAME.split(" ")[0]} on WhatsApp.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid size-11 place-items-center rounded-full border border-border bg-white text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-primary hover:text-white"
            aria-label="Back to top"
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <a
        href={waLink("Assalam o Alaikum, I'd like to know more about your packages.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping-soft" aria-hidden />
        <WhatsAppIcon className="relative size-7" />
      </a>
    </div>
  );
}
