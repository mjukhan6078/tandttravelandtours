import { NextResponse } from "next/server";
import { getTrip } from "@/lib/dashboard/store";
import { parseHotelVoucherPdf } from "@/lib/dashboard/hotel-voucher-pdf";

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
    return NextResponse.json({ error: "Only PDF hotel voucher files are supported" }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 20MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseHotelVoucherPdf(buffer);
    return NextResponse.json({
      ok: true,
      parsed: {
        summary: parsed.summary,
        clientNameHint: parsed.clientNameHint,
        hotelPackage: parsed.hotelPackage,
        hotels: parsed.hotels,
        transports: parsed.transports,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse hotel voucher PDF";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
