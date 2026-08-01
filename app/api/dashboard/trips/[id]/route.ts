import { NextResponse } from "next/server";
import { deleteTrip, getTrip, toPublicTrip, updateTrip } from "@/lib/dashboard/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ trip: toPublicTrip(trip, { includeApiKey: true }) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const trip = await updateTrip(id, body);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ trip: toPublicTrip(trip, { includeApiKey: true }) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ok = await deleteTrip(id);
  if (!ok) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
