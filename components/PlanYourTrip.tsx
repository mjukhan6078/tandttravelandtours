"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AnimatedSection from "./AnimatedSection";
import { CalendarRange, MapPin, Users, BedDouble, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "966500000000";

const DISTANCE_OPTIONS = [
  { value: "100", label: "Within 100m" },
  { value: "200", label: "Within 200m" },
  { value: "500", label: "Within 500m" },
  { value: "1000", label: "Within 1km" },
  { value: "2000", label: "1–2km" },
] as const;

function formatDate(value: string) {
  if (!value) return "Not selected";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function distanceLabel(value: string) {
  return DISTANCE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export default function PlanYourTrip() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [makkahDays, setMakkahDays] = useState(5);
  const [madinaDays, setMadinaDays] = useState(5);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomType, setRoomType] = useState<"separate" | "sharing">("separate");
  const [makkahDistance, setMakkahDistance] = useState("200");
  const [madinaDistance, setMadinaDistance] = useState("200");

  const totalDays = makkahDays + madinaDays;
  const totalGuests = adults + children;

  const summary = useMemo(
    () => ({
      startDate,
      endDate,
      makkahDays,
      madinaDays,
      totalDays,
      adults,
      children,
      totalGuests,
      roomType,
      makkahDistance,
      madinaDistance,
    }),
    [
      startDate,
      endDate,
      makkahDays,
      madinaDays,
      totalDays,
      adults,
      children,
      totalGuests,
      roomType,
      makkahDistance,
      madinaDistance,
    ]
  );

  const sendQuery = () => {
    const message = `Assalamualaikum, I would like to plan my Umrah trip.

*Travel dates*
- From: ${formatDate(summary.startDate)}
- To: ${formatDate(summary.endDate)}

*Stay*
- Days in Makkah: ${summary.makkahDays}
- Days in Madina: ${summary.madinaDays}
- Total nights: ${summary.totalDays}

*Travelers*
- Adults: ${summary.adults}
- Children: ${summary.children}
- Total: ${summary.totalGuests}

*Room*
- Preference: ${summary.roomType === "separate" ? "Separate room" : "Sharing"}

*Hotel distance from Haram*
- Makkah: ${distanceLabel(summary.makkahDistance)}
- Madina: ${distanceLabel(summary.madinaDistance)}

Please share available options and a quote.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="plan-your-trip" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plan Your Trip</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tell us your dates, stay preferences, and group size. Review your plan, then send a query on WhatsApp.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <AnimatedSection delay={0.1}>
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-secondary" />
                  Trip details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-base">When do you want to go?</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">From</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (endDate && e.target.value > endDate) {
                            setEndDate(e.target.value);
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">To</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-secondary" />
                    Days in each city
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="makkah-days">Days in Makkah</Label>
                      <Input
                        id="makkah-days"
                        type="number"
                        min={1}
                        max={60}
                        value={makkahDays}
                        onChange={(e) => setMakkahDays(Math.max(1, Number(e.target.value) || 1))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="madina-days">Days in Madina</Label>
                      <Input
                        id="madina-days"
                        type="number"
                        min={1}
                        max={60}
                        value={madinaDays}
                        onChange={(e) => setMadinaDays(Math.max(1, Number(e.target.value) || 1))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary" />
                    Travelers
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adults">Adults</Label>
                      <Input
                        id="adults"
                        type="number"
                        min={1}
                        max={50}
                        value={adults}
                        onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="children">Children</Label>
                      <Input
                        id="children"
                        type="number"
                        min={0}
                        max={50}
                        value={children}
                        onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-secondary" />
                    Room preference
                  </Label>
                  <Select
                    value={roomType}
                    onValueChange={(value) => setRoomType(value as "separate" | "sharing")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="separate">Separate room</SelectItem>
                      <SelectItem value="sharing">Sharing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Hotel distance from Haram</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Makkah</Label>
                      <Select value={makkahDistance} onValueChange={setMakkahDistance}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTANCE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Madina</Label>
                      <Select value={madinaDistance} onValueChange={setMadinaDistance}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTANCE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <aside className="lg:sticky lg:top-36">
              <Card className="border-secondary/30 bg-card shadow-lg overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
                <CardHeader>
                  <CardTitle>Your trip plan</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Live summary of everything you selected
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <SummaryRow label="Travel dates">
                    {summary.startDate || summary.endDate
                      ? `${formatDate(summary.startDate)} → ${formatDate(summary.endDate)}`
                      : "Not selected"}
                  </SummaryRow>
                  <SummaryRow label="Makkah stay">{summary.makkahDays} days</SummaryRow>
                  <SummaryRow label="Madina stay">{summary.madinaDays} days</SummaryRow>
                  <SummaryRow label="Total nights">{summary.totalDays}</SummaryRow>
                  <SummaryRow label="Adults">{summary.adults}</SummaryRow>
                  <SummaryRow label="Children">{summary.children}</SummaryRow>
                  <SummaryRow label="Total travelers">{summary.totalGuests}</SummaryRow>
                  <SummaryRow label="Room">
                    {summary.roomType === "separate" ? "Separate room" : "Sharing"}
                  </SummaryRow>
                  <SummaryRow label="Makkah hotel">
                    {distanceLabel(summary.makkahDistance)} from Haram
                  </SummaryRow>
                  <SummaryRow label="Madina hotel">
                    {distanceLabel(summary.madinaDistance)} from Haram
                  </SummaryRow>

                  <Button
                    size="lg"
                    className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-md"
                    onClick={sendQuery}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Query on WhatsApp
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Opens WhatsApp with your full trip plan ready to send
                  </p>
                </CardContent>
              </Card>
            </aside>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right text-foreground">{children}</span>
    </div>
  );
}
