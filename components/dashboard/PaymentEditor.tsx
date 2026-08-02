"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  balanceDue,
  buildPaymentServiceLines,
  servicesTotalInPrimaryCurrency,
  syncTripPaymentFromServices,
} from "@/lib/dashboard/payment";
import {
  PAYMENT_STATUS_LABELS,
  defaultPaymentTransaction,
  type PaymentTransaction,
  type TripHotel,
  type TripPayment,
  type TripTicket,
  type TripTransport,
  type TripVisa,
} from "@/lib/dashboard/types";
import { FileUp, Plus, Trash2 } from "lucide-react";

function makeTxn(): PaymentTransaction {
  return {
    ...defaultPaymentTransaction(),
    id: `pay_txn_${Math.random().toString(36).slice(2, 10)}`,
    source: "manual",
  };
}

function txnSummary(txn: PaymentTransaction, index: number): string {
  return [
    `Payment ${index + 1}`,
    txn.amount && `${txn.currency || "PKR"} ${txn.amount}`,
    txn.method,
    txn.paidAt,
    txn.reference && `Ref ${txn.reference}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function PaymentEditor({
  payment,
  onChange,
  ticket,
  visa,
  hotels,
  transports,
  tripId,
  onReceiptImported,
}: {
  payment: TripPayment;
  onChange: (next: TripPayment) => void;
  ticket: TripTicket;
  visa: TripVisa;
  hotels: TripHotel[];
  transports: TripTransport[];
  tripId: string;
  onReceiptImported?: () => Promise<void> | void;
}) {
  const lines = useMemo(
    () => buildPaymentServiceLines({ ticket, visa, hotels, transports }),
    [ticket, visa, hotels, transports]
  );
  const serviceTotals = useMemo(() => servicesTotalInPrimaryCurrency(lines), [lines]);

  const synced = useMemo(
    () => syncTripPaymentFromServices(payment, { ticket, visa, hotels, transports }),
    [payment, ticket, visa, hotels, transports]
  );

  const transactions = payment.transactions || [];
  const [openIds, setOpenIds] = useState<string[]>(() =>
    transactions.length ? [transactions[transactions.length - 1].id] : []
  );
  const prevIdsRef = useRef<string[]>(transactions.map((t) => t.id));
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  useEffect(() => {
    const ids = transactions.map((t) => t.id);
    const prev = prevIdsRef.current;
    const added = ids.filter((id) => !prev.includes(id));
    prevIdsRef.current = ids;
    setOpenIds((current) => {
      const stillOpen = current.filter((id) => ids.includes(id));
      return added.length
        ? [...stillOpen, ...added.filter((id) => !stillOpen.includes(id))]
        : stillOpen;
    });
  }, [transactions]);

  const patchPayment = (partial: Partial<TripPayment>) => {
    onChange(
      syncTripPaymentFromServices(
        { ...payment, ...partial },
        { ticket, visa, hotels, transports }
      )
    );
  };

  const updateTxn = (id: string, patch: Partial<PaymentTransaction>) => {
    patchPayment({
      transactions: transactions.map((txn) =>
        txn.id === id ? { ...txn, ...patch } : txn
      ),
    });
  };

  const importReceipt = async (file: File | null) => {
    if (!file) return;
    setParsing(true);
    setParseError("");
    const form = new FormData();
    form.set("file", file);
    form.set("title", file.name);
    const response = await fetch(`/api/dashboard/trips/${tripId}/parse-payment`, {
      method: "POST",
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    setParsing(false);
    if (!response.ok) {
      setParseError(data.error || "Could not import receipt");
      return;
    }

    const txn = data.parsed?.transaction as PaymentTransaction | undefined;
    if (!txn) {
      setParseError("No payment details found in receipt");
      return;
    }

    patchPayment({
      transactions: [...transactions, txn],
      method: txn.method || payment.method,
    });
    await onReceiptImported?.();
  };

  const due = balanceDue(synced);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="space-y-1">
          <Label className="text-base text-foreground">Service costs</Label>
          <p className="text-xs text-muted-foreground">
            Auto-filled from Ticket, Visa, Hotel & Transport tabs. Add costs on those tabs to
            include them here.
          </p>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-4">
            No priced services yet. Enter ticket/visa/hotel/transport costs on their tabs.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex flex-wrap items-start justify-between gap-2 px-3 py-2.5 sm:px-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{line.label}</p>
                  {line.detail && (
                    <p className="text-xs text-muted-foreground">{line.detail}</p>
                  )}
                </div>
                <p className="text-sm font-medium tabular-nums shrink-0">
                  {line.currency} {line.amount}
                </p>
              </li>
            ))}
          </ul>
        )}

        {serviceTotals.mixed && (
          <p className="text-xs text-muted-foreground">
            Mixed currencies detected — package total uses {serviceTotals.currency} lines only.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <Label className="text-base text-foreground">Package total</Label>
          <p className="text-xs text-muted-foreground">
            Defaults to the service sum. Turn on manual total to override.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 min-w-0">
            <Label>Total amount</Label>
            <Input
              inputMode="decimal"
              value={synced.totalAmount}
              disabled={!payment.totalManual}
              onChange={(e) => patchPayment({ totalAmount: e.target.value, totalManual: true })}
            />
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label>Currency</Label>
            <Input
              value={synced.currency}
              disabled={!payment.totalManual}
              onChange={(e) => patchPayment({ currency: e.target.value, totalManual: true })}
            />
          </div>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2.5 sm:col-span-2">
            <span className="text-sm font-medium text-foreground">Manual total</span>
            <Switch
              checked={Boolean(payment.totalManual)}
              onCheckedChange={(checked) => patchPayment({ totalManual: checked })}
            />
          </label>
          <div className="space-y-1.5 min-w-0">
            <Label>Paid amount</Label>
            <Input value={synced.paidAmount || "0"} disabled />
            <p className="text-xs text-muted-foreground">Sum of payment transactions below.</p>
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label>Balance due</Label>
            <Input value={due > 0 ? String(due) : "0"} disabled />
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label>Payment status</Label>
            <Input
              value={PAYMENT_STATUS_LABELS[synced.status] || synced.status}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Auto from paid vs total (unpaid / partial / paid).
            </p>
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label>Last method</Label>
            <Input
              value={payment.method}
              onChange={(e) => patchPayment({ method: e.target.value })}
              placeholder="e.g. Bank transfer"
            />
          </div>
          <div className="space-y-1.5 min-w-0 sm:col-span-2">
            <Label>Payment notes</Label>
            <Textarea
              rows={2}
              value={payment.notes}
              onChange={(e) => patchPayment({ notes: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <Label className="text-base text-foreground">Import payment receipt</Label>
          <p className="text-xs text-muted-foreground">
            Upload a PDF receipt to create a payment transaction and update paid amount. Images
            are stored too — enter the amount on the new transaction if text cannot be read.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileUp className="h-4 w-4 text-primary shrink-0" />
              Payment receipt
            </p>
            <Label
              htmlFor="payment-receipt-upload"
              className={`inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium cursor-pointer hover:bg-muted ${
                parsing ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {parsing ? "Reading…" : "Choose file"}
            </Label>
            <Input
              id="payment-receipt-upload"
              type="file"
              accept="application/pdf,.pdf,image/*"
              className="hidden"
              disabled={parsing}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                void importReceipt(file);
                e.currentTarget.value = "";
              }}
            />
          </div>
        </div>
        {parseError && <p className="text-sm text-destructive">{parseError}</p>}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <Label className="text-base text-foreground">Payment transactions</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Each receipt or manual payment updates the paid total automatically.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => patchPayment({ transactions: [...transactions, makeTxn()] })}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add payment
          </Button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-4">
            No payments yet. Import a receipt or add a transaction manually.
          </p>
        ) : (
          <Accordion
            type="multiple"
            value={openIds}
            onValueChange={setOpenIds}
            className="space-y-3"
          >
            {transactions.map((txn, index) => (
              <AccordionItem
                key={txn.id}
                value={txn.id}
                className="rounded-lg border border-border bg-muted/20 px-3 sm:px-4 not-last:border-b-border"
              >
                <div className="flex w-full items-center gap-1">
                  <div className="min-w-0 flex-1">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary text-left">
                        {txnSummary(txn, index)}
                      </span>
                    </AccordionTrigger>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      patchPayment({
                        transactions: transactions.filter((item) => item.id !== txn.id),
                      });
                    }}
                    aria-label="Remove payment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5 min-w-0">
                      <Label>Amount</Label>
                      <Input
                        inputMode="decimal"
                        value={txn.amount}
                        onChange={(e) => updateTxn(txn.id, { amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Currency</Label>
                      <Input
                        value={txn.currency}
                        onChange={(e) => updateTxn(txn.id, { currency: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Method</Label>
                      <Input
                        value={txn.method}
                        onChange={(e) => updateTxn(txn.id, { method: e.target.value })}
                        placeholder="e.g. JazzCash"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label>Paid on</Label>
                      <Input
                        type="date"
                        value={txn.paidAt}
                        onChange={(e) => updateTxn(txn.id, { paidAt: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Reference</Label>
                      <Input
                        value={txn.reference}
                        onChange={(e) => updateTxn(txn.id, { reference: e.target.value })}
                        placeholder="Txn / TID / RRN"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0 sm:col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        rows={2}
                        value={txn.notes}
                        onChange={(e) => updateTxn(txn.id, { notes: e.target.value })}
                      />
                    </div>
                    {txn.documentId && (
                      <p className="text-xs text-muted-foreground sm:col-span-2">
                        Linked receipt document saved with this payment.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </div>
  );
}
