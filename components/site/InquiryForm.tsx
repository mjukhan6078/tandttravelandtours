"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { interestOptions } from "@/lib/site/content";
import type { InquiryType } from "@/lib/inquire/types";
import { emailInquiry, openWhatsAppInquiry } from "@/lib/inquire/client";
import QuerySent, { SendButtons, submittedChannel, type SentState } from "./QuerySent";
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
  const [sent, setSent] = useState<SentState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setInterest("");
    setMessage("");
    onSuccess?.();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const payload = { type, name, email, phone, interest: interest || undefined, message };
    if (submittedChannel(e) === "whatsapp") {
      // Before any await, so the browser lets the WhatsApp tab open.
      setSent({ channel: "whatsapp", ...openWhatsAppInquiry(payload) });
      reset();
      return;
    }
    setLoading(true);
    const problem = await emailInquiry(payload);
    setLoading(false);
    if (problem) {
      setError(problem);
      return;
    }
    setSent({ channel: "email" });
    reset();
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {sent ? (
          <QuerySent key="sent" sent={sent} onReset={() => setSent(null)} />
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
              <Field label="Email (optional)" htmlFor={`${type}-email`}>
                <input
                  id={`${type}-email`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
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

            {error && (
              <p className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <SendButtons loading={loading} />
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
