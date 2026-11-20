"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { interestOptions } from "@/lib/site/content";
import type { InquiryType } from "@/lib/inquire/types";
import { sendInquiry } from "@/lib/inquire/client";
import { WhatsAppIcon } from "./icons";
import { cn } from "@/lib/utils";

type InquiryFormProps = {
  type: InquiryType;
  onSuccess?: () => void;
  className?: string;
  /** Single-column layout for narrow containers (side panel). */
  compact?: boolean;
  defaultInterest?: string;
  defaultMessage?: string;
};

const fieldClass =
  "peer h-12 w-full rounded-xl border border-input bg-white px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-brand-cyan focus:ring-4 focus:ring-brand-cyan/15";

export default function InquiryForm({
  type,
  onSuccess,
  className = "",
  compact = false,
  defaultInterest = "",
  defaultMessage = "",
}: InquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(defaultInterest);
  const [message, setMessage] = useState(defaultMessage);
  const [sent, setSent] = useState<{ waUrl: string; opened: boolean } | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Runs synchronously so the browser lets the WhatsApp tab open.
    setSent(
      sendInquiry({ type, name, email, phone, interest: interest || undefined, message })
    );
    setName("");
    setEmail("");
    setPhone("");
    setInterest("");
    setMessage("");
    onSuccess?.();
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-10 text-center"
            role="status"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
              className="grid size-16 place-items-center rounded-full bg-[#25D366]/10 text-[#25D366]"
            >
              <WhatsAppIcon className="size-9" />
            </motion.span>
            <h3 className="mt-4 text-lg font-bold">Almost done — tap Send in WhatsApp</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {sent.opened
                ? "Your message is ready in WhatsApp. Send it and our agent will reply there."
                : "Open WhatsApp to send your message to our agent."}
            </p>
            <a
              href={sent.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              <WhatsAppIcon className="size-4" />
              {sent.opened ? "Open WhatsApp again" : "Open WhatsApp"}
            </a>
            <button
              type="button"
              onClick={() => setSent(null)}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
              <Field label="Full name" htmlFor={`${type}-name`} className={!compact ? "sm:col-span-2" : ""}>
                <input
                  id={`${type}-name`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Your full name"
                  className={fieldClass}
                />
              </Field>
              <Field label="Email" htmlFor={`${type}-email`}>
                <input
                  id={`${type}-email`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                  className={fieldClass}
                />
              </Field>
              <Field label="Phone / WhatsApp" htmlFor={`${type}-phone`}>
                <input
                  id={`${type}-phone`}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  minLength={7}
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="+92 300 0000000"
                  className={fieldClass}
                />
              </Field>
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                I&apos;m interested in
              </legend>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((opt) => {
                  const selected = interest === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setInterest(selected ? "" : opt)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                        selected
                          ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                          : "border-input bg-white text-foreground/80 hover:border-primary hover:text-primary"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Field label="Message" htmlFor={`${type}-message`}>
              <textarea
                id={`${type}-message`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={5}
                maxLength={5000}
                rows={compact ? 4 : 5}
                placeholder="Travel dates, number of travellers, hotel preference…"
                className={cn(fieldClass, "h-auto resize-none py-3")}
              />
            </Field>

            <button
              type="submit"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-95"
            >
              <WhatsAppIcon className="size-5" />
              Send on WhatsApp
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Opens WhatsApp with your details filled in. Our agent replies there.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
