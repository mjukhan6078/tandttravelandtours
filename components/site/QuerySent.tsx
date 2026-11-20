"use client";

import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { WhatsAppIcon } from "./icons";

export type SentState =
  | { channel: "email" }
  | { channel: "whatsapp"; waUrl: string; opened: boolean };

/** Confirmation shown after "Send query" (email) or "Send on WhatsApp". */
export default function QuerySent({ sent, onReset }: { sent: SentState; onReset?: () => void }) {
  const isEmail = sent.channel === "email";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center py-8 text-center"
      role="status"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
        className={
          isEmail
            ? "grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"
            : "grid size-16 place-items-center rounded-full bg-[#25D366]/10 text-[#25D366]"
        }
      >
        {isEmail ? <CircleCheck className="size-9" /> : <WhatsAppIcon className="size-9" />}
      </motion.span>
      <h3 className="mt-4 text-lg font-bold text-navy">
        {isEmail ? "JazakAllah — query sent!" : "Almost done — tap Send in WhatsApp"}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {isEmail
          ? "Our team has your query and will contact you on WhatsApp or phone shortly."
          : sent.opened
            ? "Your query is ready in WhatsApp. Send it and our agent will reply there."
            : "Open WhatsApp to send your query to our agent."}
      </p>
      {!isEmail && (
        <a
          href={sent.waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:brightness-95"
        >
          <WhatsAppIcon className="size-4" />
          {sent.opened ? "Open WhatsApp again" : "Open WhatsApp"}
        </a>
      )}
      {onReset && (
        <button type="button" onClick={onReset} className="mt-4 text-sm font-semibold text-primary hover:underline">
          Send another query
        </button>
      )}
    </motion.div>
  );
}

/** The two send buttons. Both submit the form; the clicked one's data-channel says which. */
export function SendButtons({ loading }: { loading: boolean }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <button
        type="submit"
        data-channel="email"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta px-5 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover disabled:opacity-70"
      >
        {loading ? "Sending…" : "Send query"}
      </button>
      <button
        type="submit"
        data-channel="whatsapp"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-95 disabled:opacity-70"
      >
        <WhatsAppIcon className="size-5" />
        Send on WhatsApp
      </button>
    </div>
  );
}

/** Which send button submitted the form. */
export function submittedChannel(e: React.FormEvent): "email" | "whatsapp" {
  const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
  return submitter?.dataset.channel === "email" ? "email" : "whatsapp";
}
