import { NextResponse } from "next/server";
import { addDocument } from "@/lib/dashboard/store";
import type { DocumentType } from "@/lib/dashboard/types";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_TYPES: DocumentType[] = [
  "visa",
  "ticket",
  "hotel",
  "transport",
  "payment_receipt",
  "other",
];

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const form = await request.formData();
  const file = form.get("file");
  const type = String(form.get("type") || "other") as DocumentType;
  const title = String(form.get("title") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 15MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const doc = await addDocument(id, {
    type,
    title: title || file.name,
    fileName: file.name,
    mimeType: file.type,
    buffer,
  });

  if (!doc) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ document: doc }, { status: 201 });
}
