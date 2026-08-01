import { NextResponse } from "next/server";
import { getTripByApiKey, toPublicTrip } from "@/lib/dashboard/store";

function extractApiKey(request: Request) {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const xKey = request.headers.get("x-api-key");
  if (xKey) return xKey.trim();
  const url = new URL(request.url);
  return url.searchParams.get("api_key")?.trim() || "";
}

export async function GET(request: Request) {
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key required. Use Authorization: Bearer <key> or X-API-Key header." },
      { status: 401 }
    );
  }

  const trip = await getTripByApiKey(apiKey);
  if (!trip) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  return NextResponse.json({
    trip: toPublicTrip(trip),
  });
}
