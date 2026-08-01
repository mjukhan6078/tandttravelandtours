import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { getTrip, getUploadPath, removeDocument } from "@/lib/dashboard/store";

type Params = { params: Promise<{ id: string; docId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id, docId } = await params;
  const trip = await getTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const doc = trip.documents.find((item) => item.id === docId);
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const filePath = getUploadPath(id, doc.storedName);
  const data = await fs.readFile(filePath);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${doc.fileName}"`,
    },
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id, docId } = await params;
  const ok = await removeDocument(id, docId);
  if (!ok) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
