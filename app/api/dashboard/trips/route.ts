import { NextResponse } from "next/server";
import { createTrip, listTrips, toPublicTrip } from "@/lib/dashboard/store";

export async function GET() {
  const trips = await listTrips();
  return NextResponse.json({
    trips: trips.map((trip) => toPublicTrip(trip, { includeApiKey: true })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.clientName || !String(body.clientName).trim()) {
    return NextResponse.json({ error: "Client name is required" }, { status: 400 });
  }

  const trip = await createTrip(body);
  return NextResponse.json(
    { trip: toPublicTrip(trip, { includeApiKey: true }) },
    { status: 201 }
  );
}
