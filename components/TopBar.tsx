"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface LocationConfig {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  method: number;
}

const DEFAULT_LOCATION: LocationConfig = {
  city: "Karachi",
  country: "Pakistan",
  latitude: 24.8607,
  longitude: 67.0011,
  method: 4,
};

const PRAYER_CACHE_KEY = "tandt_prayer_cache_v2";
const LOCATION_KEY = "tandt_location_v2";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

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

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

/** Strip API extras like "05:12 (PKT)" → "05:12" */
function cleanTime(raw: string): string {
  return raw.trim().split(" ")[0] ?? raw;
}

/** Convert 24h "HH:mm" to 12h "h:mm AM/PM" */
function to12Hour(raw: string): string {
  const time = cleanTime(raw);
  const [hStr, mStr] = time.split(":");
  let hours = Number(hStr);
  const minutes = Number(mStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return raw;

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function parseTimeToToday(raw: string): Date {
  const time = cleanTime(raw);
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getStoredLocation(): LocationConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCATION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as LocationConfig;
    if (typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getCachedPrayerTimes(lat: number, lng: number): PrayerTimes | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(PRAYER_CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached) as {
      timings: PrayerTimes;
      timestamp: number;
      latitude: number;
      longitude: number;
    };
    const samePlace =
      Math.abs(data.latitude - lat) < 0.01 && Math.abs(data.longitude - lng) < 0.01;
    if (samePlace && Date.now() - data.timestamp < CACHE_TTL) {
      return data.timings;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function setCachedPrayerTimes(timings: PrayerTimes, lat: number, lng: number): void {
  localStorage.setItem(
    PRAYER_CACHE_KEY,
    JSON.stringify({
      timings,
      timestamp: Date.now(),
      latitude: lat,
      longitude: lng,
    })
  );
}

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; country: string }> {
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

export default function TopBar() {
  const [currentPrayer, setCurrentPrayer] = useState("Asr");
  const [nextPrayer, setNextPrayer] = useState("Maghrib");
  const [nextPrayerTime, setNextPrayerTime] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [hijriDate, setHijriDate] = useState("");
  const [gregorianDate, setGregorianDate] = useState("");
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<LocationConfig>(DEFAULT_LOCATION);
  const [liveTime, setLiveTime] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle" | "asking" | "ready" | "denied">(
    "idle"
  );

  const deriveCurrentAndNext = useCallback((timings: PrayerTimes) => {
    const now = new Date();
    let found = false;

    for (let i = 0; i < PRAYER_NAMES.length; i++) {
      const prayerName = PRAYER_NAMES[i];
      const prayerDate = parseTimeToToday(timings[prayerName]);

      if (prayerDate > now) {
        setNextPrayer(prayerName);
        setNextPrayerTime(cleanTime(timings[prayerName]));
        setCurrentPrayer(i > 0 ? PRAYER_NAMES[i - 1] : "Isha");
        found = true;
        break;
      }
    }

    if (!found) {
      setCurrentPrayer("Isha");
      setNextPrayer("Fajr");
      setNextPrayerTime(cleanTime(timings.Fajr));
    }
  }, []);

  const loadPrayerTimes = useCallback(
    async (loc: LocationConfig) => {
      const cached = getCachedPrayerTimes(loc.latitude, loc.longitude);
      if (cached) {
        setPrayerTimes(cached);
        deriveCurrentAndNext(cached);
        return;
      }

      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${loc.latitude}&longitude=${loc.longitude}&method=${loc.method}`
        );
        const data = await response.json();
        if (data.data?.timings) {
          const timings: PrayerTimes = {
            Fajr: cleanTime(data.data.timings.Fajr),
            Dhuhr: cleanTime(data.data.timings.Dhuhr),
            Asr: cleanTime(data.data.timings.Asr),
            Maghrib: cleanTime(data.data.timings.Maghrib),
            Isha: cleanTime(data.data.timings.Isha),
          };
          setPrayerTimes(timings);
          setCachedPrayerTimes(timings, loc.latitude, loc.longitude);
          deriveCurrentAndNext(timings);
        }
      } catch {
        /* keep previous / empty */
      }
    },
    [deriveCurrentAndNext]
  );

  const applyLocation = useCallback(
    async (latitude: number, longitude: number) => {
      const { city, country } = await reverseGeocode(latitude, longitude);
      const next: LocationConfig = {
        city,
        country,
        latitude,
        longitude,
        method: 4,
      };
      setLocation(next);
      localStorage.setItem(LOCATION_KEY, JSON.stringify(next));
      setLocationStatus("ready");
      await loadPrayerTimes(next);
    },
    [loadPrayerTimes]
  );

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("denied");
      loadPrayerTimes(DEFAULT_LOCATION);
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
        const fallback = stored ?? DEFAULT_LOCATION;
        setLocation(fallback);
        loadPrayerTimes(fallback);
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 30 * 60 * 1000,
      }
    );
  }, [applyLocation, loadPrayerTimes]);

  // Ask for location on mount (browser permission prompt)
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
      setLocationStatus("ready");
      loadPrayerTimes(stored);
    } else {
      setLocation(DEFAULT_LOCATION);
      loadPrayerTimes(DEFAULT_LOCATION);
    }
    // Always prompt / refresh GPS so times match real location
    requestLocation();
  }, [loadPrayerTimes, requestLocation]);

  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        const today = new Date();
        const cacheKey = `tandt_hijri_${today.toDateString()}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setHijriDate(cached);
          return;
        }
        const response = await fetch(
          `https://api.aladhan.com/v1/gToH/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
        );
        const data = await response.json();
        if (data.data?.hijri) {
          const hijriData = data.data.hijri;
          const monthName =
            hijriData.month?.english ||
            (typeof hijriData.month === "object"
              ? HIJRI_MONTHS[(hijriData.month as { number: number }).number - 1]
              : null) ||
            "Muharram";
          const hijri = `${String(hijriData.day).padStart(2, "0")} / ${monthName} / ${hijriData.year}`;
          setHijriDate(hijri);
          localStorage.setItem(cacheKey, hijri);
        }
      } catch {
        /* optional */
      }
    };

    fetchHijriDate();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = today.toLocaleDateString("en-US", { month: "long" });
    const year = today.getFullYear();
    setGregorianDate(`${day} ${month} ${year}`);
  }, []);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!nextPrayerTime) return;
      const now = new Date();
      const nextPrayerDate = parseTimeToToday(nextPrayerTime);
      if (nextPrayerDate <= now) {
        nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
      }
      const diff = nextPrayerDate.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${h}h ${m}m`);
    };
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [nextPrayerTime]);

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

  const datesBlock = (
    <div className="flex items-center gap-1 text-[10px] sm:text-xs whitespace-nowrap shrink-0">
      {hijriDate && (
        <>
          <span className="text-secondary font-medium hidden sm:inline">{hijriDate}</span>
          <span className="text-foreground/50 hidden sm:inline">·</span>
        </>
      )}
      <span className="text-foreground/70">{gregorianDate}</span>
    </div>
  );

  return (
    <div className="bg-background/90 backdrop-blur-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="h-[1px] absolute bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />

      <div className="w-full px-3 sm:px-4 py-2 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 xl:gap-4 text-sm">
        <div className="flex items-center justify-between gap-2 xl:shrink-0 min-w-0 h-full">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0 h-full">
            {liveTime && (
              <span className="text-secondary font-mono font-bold text-[10px] sm:text-xs whitespace-nowrap">
                {liveTime}
              </span>
            )}
            <div className="text-foreground/70 text-[10px] sm:text-xs whitespace-nowrap flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-secondary shrink-0" />
              <span className="text-secondary font-medium">{location.city}</span>
              <span className="text-foreground/50">/</span>
              <span className="text-foreground/70">{location.country}</span>
              {locationStatus === "asking" && (
                <span className="text-foreground/40 ml-1">(locating…)</span>
              )}
              {locationStatus === "denied" && (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="ml-1 text-secondary underline underline-offset-2 hover:text-primary"
                >
                  Use my location
                </button>
              )}
            </div>
          </div>
          <div className="xl:hidden">{datesBlock}</div>
        </div>

        {prayerTimes && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 xl:flex-1 xl:justify-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-full">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {PRAYER_NAMES.map((p) => {
                const isActive = p === currentPrayer;
                return (
                  <span
                    key={p}
                    className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap shrink-0 text-[10px] sm:text-xs"
                  >
                    <span
                      className={
                        isActive ? "text-secondary font-bold" : "text-foreground/60 font-medium"
                      }
                    >
                      {p}
                    </span>
                    <span className="text-foreground/50">:</span>
                    <span
                      className={
                        isActive ? "text-secondary font-bold" : "text-foreground/70 font-medium"
                      }
                    >
                      {to12Hour(prayerTimes[p])}
                    </span>
                  </span>
                );
              })}
            </div>
            {timeRemaining && (
              <div className="flex items-center gap-1 ml-1 pl-2 sm:ml-3 sm:pl-3 border-l border-foreground/10 shrink-0 whitespace-nowrap text-[10px] sm:text-xs">
                <span className="text-foreground/40">Next:</span>
                <span className="text-secondary font-bold">{nextPrayer}</span>
                <span className="text-foreground/50">
                  {to12Hour(nextPrayerTime)} · in {timeRemaining}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="hidden xl:flex items-center shrink-0 h-full">{datesBlock}</div>
      </div>
    </div>
  );
}
