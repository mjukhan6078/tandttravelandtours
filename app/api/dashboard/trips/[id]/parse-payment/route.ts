import { NextResponse } from "next/server";
import { addDocument, getTrip } from "@/lib/dashboard/store";
import {
  parsePaymentReceiptPdf,
  receiptTransactionFromHints,
} from "@/lib/dashboard/payment-receipt-pdf";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Receipt file is required" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 15MB" }, { status: 400 });
  }

  const title = String(form.get("title") || file.name || "Payment receipt");
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name || "";
  const isPdf =
    file.type === "application/pdf" || name.toLowerCase().endsWith(".pdf");

  let parsed;
  try {
    if (isPdf) {
      parsed = await parsePaymentReceiptPdf(buffer);
    } else {
      parsed = {
        transaction: receiptTransactionFromHints({
          amount: String(form.get("amount") || ""),
          currency: String(form.get("currency") || trip.payment.currency || "PKR"),
          method: String(form.get("method") || ""),
          reference: String(form.get("reference") || ""),
          paidAt: String(form.get("paidAt") || ""),
          notes: String(form.get("notes") || ""),
          fileName: name,
        }),
        summary: "Receipt uploaded — fill amount if needed",
      };
      if (!parsed.transaction.amount) {
        // Still allow upload; UI can edit the transaction
        parsed.summary = "Receipt saved — enter the paid amount on the transaction";
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse payment receipt";
    // For PDFs that fail parse, still store file and create empty receipt txn
    if (!isPdf) {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    parsed = {
      transaction: receiptTransactionFromHints({
        amount: String(form.get("amount") || ""),
        currency: String(form.get("currency") || trip.payment.currency || "PKR"),
        method: String(form.get("method") || ""),
        reference: String(form.get("reference") || ""),
        paidAt: String(form.get("paidAt") || ""),
        fileName: name,
      }),
      summary: `${message}. Receipt saved for manual entry.`,
    };
  }

  const doc = await addDocument(id, {
    type: "payment_receipt",
    title,
    fileName: name || "receipt.pdf",
    mimeType: file.type || (isPdf ? "application/pdf" : "application/octet-stream"),
    buffer,
  });

  if (!doc) {
    return NextResponse.json({ error: "Could not store receipt" }, { status: 500 });
  }

  const transaction = {
    ...parsed.transaction,
    documentId: doc.id,
    source: "receipt" as const,
  };

  return NextResponse.json({
    ok: true,
    parsed: {
      summary: parsed.summary,
      transaction,
      document: doc,
    },
  });
}
