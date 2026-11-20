"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import { EMAIL, WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site/contact";

interface LocationConfig {
  city: string;
  country: string;
}

const DEFAULT_LOCATION: LocationConfig = {
  city: "Karachi",
  country: "Pakistan",
};

const LOCATION_KEY = "tandt_location_v2";
const HIJRI_ADJUST_KEY = "tandt_hijri_adjust";
const ADJUST_OPTIONS = [-2, -1, 0, 1, 2] as const;

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-awwal",
  "Rabi al-thani",
  "Jumada al-awwal",
  "Jumada al-thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

function getStoredLocation(): LocationConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCATION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as LocationConfig;
    if (parsed.city && parsed.country) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function getStoredHijriAdjust(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem(HIJRI_ADJUST_KEY);
    if (stored === null) return 0;
    const value = Number(stored);
    if (ADJUST_OPTIONS.includes(value as (typeof ADJUST_OPTIONS)[number])) {
      return value;
    }
  } catch {
    /* ignore */
  }
  return 0;
}

function formatAdjustLabel(value: number) {
  if (value === 0) return "Default date";
  const abs = Math.abs(value);
  const unit = abs === 1 ? "day" : "days";
  return value > 0 ? `+${value} ${unit}` : `${value} ${unit}`;
}

async function reverseGeocode(lat: number, lng: number): Promise<LocationConfig> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { Accept: "application/json" } }
    );
    const data = await response.json();
    const address = data.address ?? {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.county ||
      "Your area";
    const country = address.country || "Unknown";
    return { city, country };
  } catch {
    return { city: "Your area", country: "Local" };
  }
}

function formatHijri(hijriData: {
  day: string;
  year: string;
  month?: { english?: string; en?: string; number?: number };
}): string {
  const monthName =
    hijriData.month?.english ||
    hijriData.month?.en ||
    (typeof hijriData.month?.number === "number"
      ? HIJRI_MONTHS[hijriData.month.number - 1]
      : null) ||
    "Muharram";
  return `${String(hijriData.day).padStart(2, "0")} / ${monthName} / ${hijriData.year}`;
}

/** Shift today's Gregorian date by offset days, then convert — this updates the Hijri date. */
async function fetchHijriForToday(adjustment: number): Promise<string | null> {
  try {
    const target = new Date();
    target.setHours(12, 0, 0, 0);
    target.setDate(target.getDate() + adjustment);
    const datePath = `${target.getDate()}-${target.getMonth() + 1}-${target.getFullYear()}`;
    const response = await fetch(`https://api.aladhan.com/v1/gToH/${datePath}`);
    const data = await response.json();
    if (!data.data?.hijri) return null;
    return formatHijri(data.data.hijri);
  } catch {
    return null;
  }
}

export default function TopBar() {
  const [hijriDate, setHijriDate] = useState("");
  const [hijriAdjust, setHijriAdjust] = useState(0);
  const [hijriOpen, setHijriOpen] = useState(false);
  const [hijriLoading, setHijriLoading] = useState(false);
  const [gregorianDate, setGregorianDate] = useState("");
  const [location, setLocation] = useState<LocationConfig>(DEFAULT_LOCATION);
  const [liveTime, setLiveTime] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle" | "asking" | "ready" | "denied">(
    "idle"
  );
  const hijriPopoverRef = useRef<HTMLDivElement>(null);

  const loadHijriDate = useCallback(async (adjustment: number) => {
    setHijriLoading(true);
    const hijri = await fetchHijriForToday(adjustment);
    if (hijri) setHijriDate(hijri);
    setHijriLoading(false);
  }, []);

  const applyLocation = useCallback(async (latitude: number, longitude: number) => {
    const next = await reverseGeocode(latitude, longitude);
    setLocation(next);
    localStorage.setItem(LOCATION_KEY, JSON.stringify(next));
    setLocationStatus("ready");
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("asking");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await applyLocation(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setLocationStatus("denied");
        const stored = getStoredLocation();
        if (stored) setLocation(stored);
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 30 * 60 * 1000,
      }
    );
  }, [applyLocation]);

  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
      setLocationStatus("ready");
    }
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const storedAdjust = getStoredHijriAdjust();
    setHijriAdjust(storedAdjust);
    loadHijriDate(storedAdjust);

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = today.toLocaleDateString("en-US", { month: "long" });
    const year = today.getFullYear();
    setGregorianDate(`${day} ${month} ${year}`);
  }, [loadHijriDate]);

  useEffect(() => {
    const updateClock = () => {
      setLiveTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hijriOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!hijriPopoverRef.current?.contains(event.target as Node)) {
        setHijriOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHijriOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [hijriOpen]);

  const selectHijriAdjust = async (value: number) => {
    setHijriAdjust(value);
    localStorage.setItem(HIJRI_ADJUST_KEY, String(value));
    setHijriOpen(false);
    await loadHijriDate(value);
  };

  return (
    <div className="relative z-50 bg-navy text-white">
      <div className="container-site flex items-center justify-between gap-3 py-2 text-sm">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {liveTime && (
            <span className="text-brand-cyan font-mono font-bold text-[10px] sm:text-xs whitespace-nowrap">
              {liveTime}
            </span>
          )}
          <div className="text-white/75 text-[10px] sm:text-xs whitespace-nowrap hidden sm:flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3 w-3 text-brand-cyan shrink-0" />
            <span className="text-brand-cyan font-medium truncate">{location.city}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/75 truncate">{location.country}</span>
            {locationStatus === "asking" && (
              <span className="text-white/40 ml-1">(locating…)</span>
            )}
            {locationStatus === "denied" && (
              <button
                type="button"
                onClick={requestLocation}
                className="ml-1 text-brand-cyan underline underline-offset-2 hover:text-white"
              >
                Use my location
              </button>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-5 text-xs text-white/75 lg:flex">
          <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-1.5 transition hover:text-white">
            <Mail className="h-3.5 w-3.5 text-brand-cyan" />
            {EMAIL}
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 text-brand-cyan" />
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </div>

        <div className="flex items-center gap-1 text-[10px] sm:text-xs whitespace-nowrap shrink-0">
          {hijriDate && (
            <>
              <div className="relative" ref={hijriPopoverRef}>
                <button
                  type="button"
                  onClick={() => setHijriOpen((open) => !open)}
                  className="inline-flex items-center gap-1 text-brand-cyan font-medium hover:text-white transition-colors max-w-[46vw] sm:max-w-none"
                  aria-haspopup="dialog"
                  aria-expanded={hijriOpen}
                  title="Adjust Hijri date"
                >
                  <span className={`truncate ${hijriLoading ? "opacity-60" : ""}`}>
                    {hijriDate}
                  </span>
                  {hijriAdjust !== 0 && (
                    <span className="text-[9px] text-white/40 shrink-0">
                      ({hijriAdjust > 0 ? `+${hijriAdjust}` : hijriAdjust})
                    </span>
                  )}
                </button>

                {hijriOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background shadow-lg p-2 z-[60]">
                    <p className="px-2 pb-2 text-[10px] text-muted-foreground">
                      Update Hijri date
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {ADJUST_OPTIONS.map((value) => {
                        const selected = value === hijriAdjust;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => selectHijriAdjust(value)}
                            className={`rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {formatAdjustLabel(value)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-white/40">·</span>
            </>
          )}
          <span className="text-white/75">{gregorianDate}</span>
        </div>
      </div>
    </div>
  );
}
