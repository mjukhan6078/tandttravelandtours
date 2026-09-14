"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { interestOptions } from "@/lib/site/content";
import type { InquiryType } from "@/lib/inquire/types";

type InquiryFormProps = {
  type: InquiryType;
  onSuccess?: () => void;
  className?: string;
};

export default function InquiryForm({
  type,
  onSuccess,
  className = "",
}: InquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
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

  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => setStatus("idle"), 4000);
    return () => clearTimeout(t);
  }, [status]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor={`${type}-name`}>Full Name</Label>
        <Input
          id={`${type}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Your full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-email`}>Email</Label>
        <Input
          id={`${type}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="your@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-phone`}>Phone</Label>
        <Input
          id={`${type}-phone`}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoComplete="tel"
          placeholder="+92 300 0000000"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-interest`}>Interest (optional)</Label>
        <select
          id={`${type}-interest`}
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">Select…</option>
          {interestOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-message`}>Message</Label>
        <Textarea
          id={`${type}-message`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          placeholder="How can we help?"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {status === "success" && (
        <p className="text-sm text-primary" role="status">
          Thank you. We received your message and will get back to you soon.
        </p>
      )}
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-primary text-primary-foreground hover:bg-[#0c3270] px-6 py-3 h-auto"
      >
        {status === "loading" ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}
