import { NextResponse } from "next/server";
import { createOrRotateApiKey, revokeApiKey, toPublicTrip } from "@/lib/dashboard/store";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.revoke) {
    const trip = await revokeApiKey(id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    return NextResponse.json({ trip: toPublicTrip(trip, { includeApiKey: true }) });
  }

  const trip = await createOrRotateApiKey(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({
    trip: toPublicTrip(trip, { includeApiKey: true }),
    apiKey: trip.apiKey,
  });
}
