"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";
import { interestOptions } from "@/lib/site/content";
import type { InquiryType } from "@/lib/inquire/types";
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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          email,
          phone,
          interest: interest || undefined,
          message,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setInterest("");
      setMessage("");
      onSuccess?.();
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
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
              className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"
            >
              <CircleCheck className="size-9" />
            </motion.span>
            <h3 className="mt-4 text-lg font-bold">JazakAllah — message received!</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Our team will get back to you shortly on your phone or email.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-5 text-sm font-semibold text-primary hover:underline"
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
                rows={compact ? 4 : 5}
                placeholder="Travel dates, number of travellers, hotel preference…"
                className={cn(fieldClass, "h-auto resize-none py-3")}
              />
            </Field>

            {status === "error" && (
              <p className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cta px-6 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-hover disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Send inquiry
                  <Send className="size-4 transition group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                </>
              )}
            </button>
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
