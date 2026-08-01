"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DOCUMENT_TYPE_LABELS,
  TRIP_STATUS_LABELS,
  type DocumentType,
  type TripStatus,
} from "@/lib/dashboard/types";
import { Copy, FileUp, KeyRound, Trash2, ExternalLink } from "lucide-react";

type TripDoc = {
  id: string;
  type: DocumentType;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

type Trip = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  destination: string;
  startDate: string;
  endDate: string;
  makkahNights: number;
  madinaNights: number;
  notes: string;
  status: TripStatus;
  documents: TripDoc[];
  apiKey?: string | null;
  apiKeyCreatedAt?: string | null;
};

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tripId = params.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [docType, setDocType] = useState<DocumentType>("visa");
  const [uploading, setUploading] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const loadTrip = useCallback(async () => {
    const response = await fetch(`/api/dashboard/trips/${tripId}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Trip not found");
      setTrip(null);
    } else {
      setTrip(data.trip);
      setRevealedKey(data.trip.apiKey || null);
    }
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const saveTrip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trip) return;
    setSaving(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/dashboard/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: form.get("clientName"),
        clientPhone: form.get("clientPhone"),
        clientEmail: form.get("clientEmail"),
        destination: form.get("destination"),
        startDate: form.get("startDate"),
        endDate: form.get("endDate"),
        makkahNights: Number(form.get("makkahNights") || 0),
        madinaNights: Number(form.get("madinaNights") || 0),
        notes: form.get("notes"),
        status: trip.status,
      }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setTrip(data.trip);
    setMessage("Trip saved");
  };

  const uploadDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trip) return;
    setUploading(true);
    setError("");
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    form.set("type", docType);
    const response = await fetch(`/api/dashboard/trips/${trip.id}/documents`, {
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
    await loadTrip();
    setMessage("Document uploaded");
  };

  const deleteDocument = async (docId: string) => {
    if (!trip || !confirm("Delete this document?")) return;
    await fetch(`/api/dashboard/trips/${trip.id}/documents/${docId}`, { method: "DELETE" });
    await loadTrip();
  };

  const generateApiKey = async () => {
    if (!trip) return;
    if (trip.apiKey && !confirm("Generate a new key? The old key will stop working.")) return;
    const response = await fetch(`/api/dashboard/trips/${trip.id}/api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not create API key");
      return;
    }
    setTrip(data.trip);
    setRevealedKey(data.apiKey);
    setMessage("API key created — copy and share with the client");
  };

  const revokeApiKey = async () => {
    if (!trip || !confirm("Revoke this API key?")) return;
    const response = await fetch(`/api/dashboard/trips/${trip.id}/api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revoke: true }),
    });
    const data = await response.json();
    if (response.ok) {
      setTrip(data.trip);
      setRevealedKey(null);
      setMessage("API key revoked");
    }
  };

  const copyKey = async () => {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setMessage("API key copied");
  };

  const deleteTrip = async () => {
    if (!trip || !confirm("Delete this trip and all documents?")) return;
    await fetch(`/api/dashboard/trips/${trip.id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <DashboardShell title="Trip">
        <p className="text-muted-foreground">Loading…</p>
      </DashboardShell>
    );
  }

  if (!trip) {
    return (
      <DashboardShell title="Trip">
        <p className="text-destructive">{error || "Trip not found"}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to trips</Link>
        </Button>
      </DashboardShell>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <DashboardShell
      title={trip.clientName}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">All trips</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {(message || error) && (
          <p className={`text-sm ${error ? "text-destructive" : "text-primary"}`}>
            {error || message}
          </p>
        )}

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Trip details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveTrip} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="clientName">Client name</Label>
                  <Input id="clientName" name="clientName" defaultValue={trip.clientName} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input id="clientPhone" name="clientPhone" defaultValue={trip.clientPhone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input id="clientEmail" name="clientEmail" type="email" defaultValue={trip.clientEmail} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" name="destination" defaultValue={trip.destination} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={trip.status}
                    onValueChange={(v) => setTrip({ ...trip, status: v as TripStatus })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRIP_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input id="startDate" name="startDate" type="date" defaultValue={trip.startDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End date</Label>
                  <Input id="endDate" name="endDate" type="date" defaultValue={trip.endDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="makkahNights">Makkah nights</Label>
                  <Input
                    id="makkahNights"
                    name="makkahNights"
                    type="number"
                    min={0}
                    defaultValue={trip.makkahNights}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="madinaNights">Madina nights</Label>
                  <Input
                    id="madinaNights"
                    name="madinaNights"
                    type="number"
                    min={0}
                    defaultValue={trip.madinaNights}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} defaultValue={trip.notes} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button type="button" variant="destructive" onClick={deleteTrip}>
                  Delete trip
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-secondary" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={uploadDocument} className="grid sm:grid-cols-[1fr_1fr_1.4fr_auto] gap-3 items-end">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g. Umrah visa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input id="file" name="file" type="file" required />
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </form>

            {trip.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No documents yet. Upload visa, ticket, hotel, transport, or payment receipt.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {trip.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {DOCUMENT_TYPE_LABELS[doc.type]} · {doc.fileName} ·{" "}
                        {Math.round(doc.size / 1024)} KB
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={`/api/dashboard/trips/${trip.id}/documents/${doc.id}`}
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
          </CardContent>
        </Card>

        <Card className="border-secondary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-secondary" />
              Client API key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create an API key for this client so they can view their trip plan from another app.
            </p>

            {revealedKey ? (
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                <code className="block text-xs sm:text-sm break-all font-mono">{revealedKey}</code>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={copyKey}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy key
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={revokeApiKey}>
                    Revoke
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No API key yet.</p>
            )}

            <Button type="button" onClick={generateApiKey}>
              {trip.apiKey ? "Rotate API key" : "Create API key"}
            </Button>

            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm space-y-2">
              <p className="font-medium">Client API usage</p>
              <pre className="overflow-x-auto text-xs bg-background rounded-md p-3 border border-border whitespace-pre-wrap">{`GET ${origin}/api/v1/trip
Authorization: Bearer ${revealedKey || "<API_KEY>"}

# or
curl -H "X-API-Key: ${revealedKey || "<API_KEY>"}" \\
  ${origin}/api/v1/trip`}</pre>
              <p className="text-xs text-muted-foreground">
                Document downloads:{" "}
                <code>/api/v1/documents/&lt;documentId&gt;</code> with the same API key.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
