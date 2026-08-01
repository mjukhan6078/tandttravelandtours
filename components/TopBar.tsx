'use client'; 
 
 import { useState, useEffect, useCallback } from 'react'; 
 import { motion } from 'framer-motion'; 
 
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
   method: number; 
 } 
 
 const DEFAULT_LOCATION: LocationConfig = { 
   city: 'Karachi', 
   country: 'Pakistan', 
   method: 4, 
 }; 
 
 const PRAYER_CACHE_KEY = 'raahenijaat_prayer_cache'; 
 const LOCATION_KEY = 'raahenijaat_location'; 
 const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours 
 
 const HIJRI_MONTHS = [ 
   'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani', 'Jumada al-awwal', 
   'Jumada al-thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 
   'Dhu al-Qi\'dah', 'Dhu al-Hijjah' 
 ]; 
 
 function getStoredLocation(): LocationConfig { 
   if (typeof window === 'undefined') return DEFAULT_LOCATION; 
   try { 
     const stored = localStorage.getItem(LOCATION_KEY); 
     if (stored) return JSON.parse(stored); 
   } catch { /* ignore */ } 
   return DEFAULT_LOCATION; 
 } 
 
 function getCachedPrayerTimes(): { timings: PrayerTimes; timestamp: number } | null { 
   if (typeof window === 'undefined') return null; 
   try { 
     const cached = localStorage.getItem(PRAYER_CACHE_KEY); 
     if (cached) return JSON.parse(cached); 
   } catch { /* ignore */ } 
   return null; 
 } 
 
 function setCachedPrayerTimes(timings: PrayerTimes): void { 
   const data = { timings, timestamp: Date.now() }; 
   localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(data)); 
 } 
 
 export default function TopBar() { 
   const [currentPrayer, setCurrentPrayer] = useState('Asr'); 
   const [nextPrayer, setNextPrayer] = useState('Maghrib'); 
   const [nextPrayerTime, setNextPrayerTime] = useState('02:34'); 
   const [timeRemaining, setTimeRemaining] = useState(''); 
   const [hijriDate, setHijriDate] = useState(''); 
   const [gregorianDate, setGregorianDate] = useState(''); 
   const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null); 
   const [location, setLocation] = useState<LocationConfig>(DEFAULT_LOCATION); 
   const [liveTime, setLiveTime] = useState(''); 
 
   const deriveCurrentAndNext = useCallback((timings: PrayerTimes) => { 
     const now = new Date(); 
     const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']; 
     let foundCurrent = false; 
 
     for (let i = 0; i < prayerNames.length; i++) { 
       const prayerName = prayerNames[i]; 
       const time = timings[prayerName as keyof PrayerTimes]; 
       const [hours, minutes] = time.split(':').map(Number); 
       const prayerDate = new Date(); 
       prayerDate.setHours(hours, minutes, 0, 0); 
 
       if (prayerDate > now) { 
         setNextPrayer(prayerName); 
         setNextPrayerTime(time); 
         setCurrentPrayer(i > 0 ? prayerNames[i - 1] : 'Isha'); 
         foundCurrent = true; 
         break; 
       } 
     } 
 
     if (!foundCurrent) { 
       setCurrentPrayer('Isha'); 
       setNextPrayer('Fajr'); 
       setNextPrayerTime(timings.Fajr); 
     } 
   }, []); 
 
   useEffect(() => { 
     const storedLocation = getStoredLocation(); 
     setLocation(storedLocation); 
 
     const fetchPrayerTimes = async () => { 
       const cached = getCachedPrayerTimes(); 
       if (cached && Date.now() - cached.timestamp < CACHE_TTL) { 
         setPrayerTimes(cached.timings); 
         deriveCurrentAndNext(cached.timings); 
         return; 
       } 
 
       try { 
         const response = await fetch( 
           `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(storedLocation.city)}&country=${encodeURIComponent(storedLocation.country)}&method=${storedLocation.method}` 
         ); 
         const data = await response.json(); 
         if (data.data?.timings) { 
           const timings = { 
             Fajr: data.data.timings.Fajr, 
             Dhuhr: data.data.timings.Dhuhr, 
             Asr: data.data.timings.Asr, 
             Maghrib: data.data.timings.Maghrib, 
             Isha: data.data.timings.Isha, 
           }; 
           setPrayerTimes(timings); 
           setCachedPrayerTimes(timings); 
           deriveCurrentAndNext(timings); 
         } 
       } catch { 
         // Use defaults on error 
       } 
     }; 
 
     const fetchHijriDate = async () => { 
       try { 
         const today = new Date(); 
         const cacheKey = `raahenijaat_hijri_${today.toDateString()}`; 
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
           // Always use English month names for consistent formatting 
           const monthName = hijriData.month?.english 
             || (typeof hijriData.month === 'object' ? HIJRI_MONTHS[(hijriData.month as any).number - 1] : null) 
             || 'Muharram'; 
           const hijri = `${String(hijriData.day).padStart(2, '0')} / ${monthName} / ${hijriData.year}`; 
           setHijriDate(hijri); 
           localStorage.setItem(cacheKey, hijri); 
         } 
       } catch (error) { 
         setHijriDate('14 / Shawwal / 1446'); 
       } 
     }; 
 
     fetchPrayerTimes(); 
     fetchHijriDate(); 
     const today = new Date(); 
     const day = String(today.getDate()).padStart(2, '0'); 
     const month = today.toLocaleDateString('en-US', { month: 'long' }); 
     const year = today.getFullYear(); 
     setGregorianDate(`${day} ${month} ${year}`); 
   }, [deriveCurrentAndNext]); 
 
   // Auto-update countdown every minute 
   useEffect(() => { 
     const calculateTimeRemaining = () => { 
       if (!nextPrayerTime) return; 
       const [hours, minutes] = nextPrayerTime.split(':').map(Number); 
       const now = new Date(); 
       const nextPrayerDate = new Date(); 
       nextPrayerDate.setHours(hours, minutes, 0, 0); 
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
 
   // Live clock 
   useEffect(() => { 
     const updateClock = () => { 
       const now = new Date(); 
       setLiveTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })); 
     }; 
     updateClock(); 
     const interval = setInterval(updateClock, 1000); 
     return () => clearInterval(interval); 
   }, []); 
 
   // Get user's current location via geolocation API 
   useEffect(() => { 
     const getUserLocation = async () => { 
       if (typeof window === 'undefined') return; 
 
       // Try to get geolocation 
       if ('geolocation' in navigator) { 
         navigator.geolocation.getCurrentPosition( 
           async (position) => { 
             const { latitude, longitude } = position.coords; 
             try { 
               // Use OpenStreetMap's reverse geocoding 
               const response = await fetch( 
                 `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}` 
               ); 
               const data = await response.json(); 
               if (data.address) { 
                 const city = data.address.city || data.address.town || data.address.county || 'Unknown'; 
                 const country = data.address.country || 'Unknown'; 
                 const newLocation: LocationConfig = { 
                   city, 
                   country, 
                   method: 4, 
                 }; 
                 setLocation(newLocation); 
                 localStorage.setItem(LOCATION_KEY, JSON.stringify(newLocation)); 
                 localStorage.removeItem(PRAYER_CACHE_KEY); // Invalidate cache 
               } 
             } catch (error) { 
               // Reverse geocoding failed, using default location 
             } 
           }, 
           () => { 
             // Geolocation permission denied or unavailable 
           } 
         ); 
       } 
     }; 
 
     getUserLocation(); 
   }, []); 
 
   const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const; 
 
   const datesBlock = ( 
     <div className="flex items-center gap-1 text-[10px] sm:text-xs whitespace-nowrap shrink-0"> 
       {hijriDate && hijriDate !== '' && ( 
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
       {/* Glossy overlay */}
       <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/10 pointer-events-none" />
       <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 pointer-events-none" />
       <div className="h-[1px] absolute bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" /> 
 
       <div className="w-full px-3 sm:px-4 py-2 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 xl:gap-4 text-sm"> 
         {/* Row 1 on mobile: Clock + Location | Dates */} 
         <div className="flex items-center justify-between gap-2 xl:shrink-0 min-w-0 h-full"> 
           <motion.div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0 h-full"> 
             {liveTime && ( 
               <span className="text-secondary font-mono font-bold text-[10px] sm:text-xs whitespace-nowrap"> 
                 {liveTime} 
               </span> 
             )} 
             <div className="text-foreground/70 text-[10px] sm:text-xs whitespace-nowrap"> 
               <span className="text-secondary font-medium">{location.city}</span> 
               <span className="text-foreground/50"> / </span> 
               <span className="text-foreground/70">{location.country}</span> 
             </div> 
           </motion.div> 
           <div className="xl:hidden">{datesBlock}</div> 
         </div> 
 
         {/* Prayer times + next prayer countdown */} 
         {prayerTimes && ( 
           <div className="flex items-center gap-2 sm:gap-3 min-w-0 xl:flex-1 xl:justify-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-full"> 
             <div className="flex items-center gap-2 sm:gap-3 shrink-0"> 
               {prayerNames.map((p) => { 
                 const isActive = p === currentPrayer; 
                 return ( 
                   <span key={p} className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap shrink-0 text-[10px] sm:text-xs"> 
                     <span className={isActive ? 'text-secondary font-bold' : 'text-foreground/60 font-medium'}> 
                       {p} 
                     </span> 
                     <span className="text-foreground/50">:</span> 
                     <span className={isActive ? 'text-secondary font-bold' : 'text-foreground/70 font-medium'}> 
                       {prayerTimes[p]} 
                     </span> 
                   </span> 
                 ); 
               })} 
             </div> 
             {timeRemaining && ( 
               <div className="flex items-center gap-1 ml-1 pl-2 sm:ml-3 sm:pl-3 border-l border-foreground/10 shrink-0 whitespace-nowrap text-[10px] sm:text-xs"> 
                 <span className="text-foreground/40">Next:</span> 
                 <span className="text-secondary font-bold">{nextPrayer}</span> 
                 <span className="text-foreground/50">in {timeRemaining}</span> 
               </div> 
             )} 
           </div> 
         )} 
 
         {/* Dates — desktop only */} 
         <div className="hidden xl:flex items-center shrink-0 h-full">{datesBlock}</div> 
       </div> 
     </div> 
   ); 
 }
