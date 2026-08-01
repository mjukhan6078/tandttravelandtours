import { NextResponse } from "next/server";
import { getDocumentBytes, getTripByApiKey, listTrips } from "@/lib/dashboard/store";

type Params = { params: Promise<{ docId: string }> };

function extractApiKey(request: Request) {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return (
    request.headers.get("x-api-key")?.trim() ||
    new URL(request.url).searchParams.get("api_key")?.trim() ||
    ""
  );
}

export async function GET(request: Request, { params }: Params) {
  const { docId } = await params;
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const trip = await getTripByApiKey(apiKey);
  if (!trip) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const doc = trip.documents.find((item) => item.id === docId);
  if (!doc) {
    const all = await listTrips();
    const belongsElsewhere = all.some((t) => t.documents.some((d) => d.id === docId));
    if (belongsElsewhere) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const data = await getDocumentBytes(trip.id, doc.storedName);
  if (!data) return NextResponse.json({ error: "File missing in storage" }, { status: 404 });

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `attachment; filename="${doc.fileName}"`,
    },
  });
}
