import { NextResponse } from "next/server";
import { getTrip } from "@/lib/dashboard/store";
import { parseTicketPdf } from "@/lib/dashboard/ticket-pdf";

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
    return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
  }

  const name = file.name || "";
  const isPdf =
    file.type === "application/pdf" || name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json({ error: "Only PDF ticket files are supported" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 15MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseTicketPdf(buffer, name);
    return NextResponse.json({
      ok: true,
      parsed: {
        bookingRef: parsed.bookingRef,
        passengers: parsed.passengers,
        ticketUnits: parsed.ticketUnits,
        legs: parsed.legs,
        summary: parsed.summary,
        clientNameHint: parsed.clientNameHint,
        ticket: parsed.ticket,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse ticket PDF";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
