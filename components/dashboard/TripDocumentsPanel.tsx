"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DOCUMENT_TYPE_LABELS, type DocumentType } from "@/lib/dashboard/types";
import { ExternalLink, Trash2 } from "lucide-react";

type TripDoc = {
  id: string;
  type: DocumentType;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export default function TripDocumentsPanel({
  tripId,
  type,
  documents,
  onChanged,
  titlePlaceholder,
}: {
  tripId: string;
  type: DocumentType;
  documents: TripDoc[];
  onChanged: () => Promise<void> | void;
  titlePlaceholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const filtered = documents.filter((doc) => doc.type === type);

  const uploadDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);
    setError("");
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    form.set("type", type);
    const response = await fetch(`/api/dashboard/trips/${tripId}/documents`, {
      method: "POST",
      body: form,
    });
    const data = await response.json();
    setUploading(false);
    if (!response.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    formEl.reset();
    await onChanged();
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/dashboard/trips/${tripId}/documents/${docId}`, { method: "DELETE" });
    await onChanged();
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium">{DOCUMENT_TYPE_LABELS[type]} documents</p>
        <p className="text-xs text-muted-foreground mt-1">Upload files for this section.</p>
      </div>

      <form onSubmit={uploadDocument} className="grid sm:grid-cols-[1fr_1.4fr_auto] gap-3 items-end">
        <div className="space-y-2">
          <Label htmlFor={`title-${type}`}>Title</Label>
          <Input
            id={`title-${type}`}
            name="title"
            placeholder={titlePlaceholder || DOCUMENT_TYPE_LABELS[type]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`file-${type}`}>File</Label>
          <Input id={`file-${type}`} name="file" type="file" required />
        </div>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {DOCUMENT_TYPE_LABELS[type].toLowerCase()} files yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {filtered.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.fileName} · {Math.round(doc.size / 1024)} KB
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`/api/dashboard/trips/${tripId}/documents/${doc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => deleteDocument(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
