import { NextResponse } from "next/server";
import { getTrip } from "@/lib/dashboard/store";
import { parseVisaPdf } from "@/lib/dashboard/visa-pdf";

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
    return NextResponse.json({ error: "Only PDF visa files are supported" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 15MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseVisaPdf(buffer);
    return NextResponse.json({
      ok: true,
      parsed: {
        summary: parsed.summary,
        clientNameHint: parsed.clientNameHint,
        record: parsed.record,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse visa PDF";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
