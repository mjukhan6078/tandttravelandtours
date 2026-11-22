import { ADDRESS, EMAIL, SITE_NAME, WHATSAPP_DISPLAY } from "@/lib/site/contact";
import { faqs, services, whyUs } from "@/lib/site/content";
import { ROOM_TYPES, hotels, formatDistance } from "@/lib/site/hotels";
import { BOOKING, BREAKFAST_PER_PERSON_NIGHT, FLIGHTS, ROUTE_PRESETS, breakfastIncluded, formatPKR } from "@/lib/site/pricing";
import { transportRoutes, transportVehicles } from "@/lib/site/transport";
import { PACKAGE_INCLUDES, PACKAGE_SEASON, PACKAGE_SHARING, SHOW_SEASON_NOTICE, umrahPackages } from "@/lib/site/umrah-packages";
import { visaTypes } from "@/lib/site/visa";
import { ziaraatTours } from "@/lib/site/ziaraat";

/**
 * The assistant's system prompt: how to behave, plus everything the website
 * says about T&T's services and rates. It is built from lib/site/, so a rate
 * changed there reaches WhatsApp on the next deploy.
 *
 * Keep it free of anything that changes per request (dates, names): Claude
 * caches it, and editing it mid-chat would invalidate earlier turns. The
 * current date goes into each customer message instead.
 */

const SITE_URL = "https://www.tandttravelandtours.com";

const RULES = `You are the WhatsApp assistant for ${SITE_NAME}, a government-licensed Hajj and Umrah travel agency (G.L# 5481) in Karachi, Pakistan. You answer customers who message the agency's WhatsApp number, on behalf of the team.

How to reply:
- Write like a friendly, respectful agency staff member on WhatsApp: short messages, plain sentences, no long essays. Greet with "Assalam o Alaikum" or answer a salaam with "Wa Alaikum Assalam".
- Reply in the customer's language: English, Urdu, or Roman Urdu, matching how they write.
- WhatsApp formatting only: *bold*, _italic_, simple "-" lists. No markdown headings, tables, or links in brackets.
- Ask at most two questions at a time.
- If someone asks whether you are a person, say you are T&T's automated assistant and that a team member can take over at any time.

What you may say:
- Use only the facts and rates in the reference below. Never invent prices, dates, flight times, hotel availability, or policies. If something isn't covered, say a team member will confirm it and hand the chat over.
- Every price you give is an estimate. Say that the team confirms the final price and availability before booking.
- ${SHOW_SEASON_NOTICE ? `The Umrah package prices are from the ${PACKAGE_SEASON} season flyers. Say that current prices may differ and the team will confirm them.` : `The Umrah package prices are for the ${PACKAGE_SEASON} season.`}
- For a custom Umrah trip (the customer's own dates, nights, hotels or travellers), work out the price with the quote_umrah_trip tool instead of doing the maths yourself. Collect what you need first: travel date or month, nights in Makkah and Madinah, number of adults, children and infants, hotel or budget level, room sharing, and whether they need visa, flights, transport and ziaraat. Fill reasonable defaults for small gaps and say which ones you assumed.
- Flight fares change daily: there are no fixed fares except the builder's return-flight estimate. For a ticket price, collect the route, dates, passengers and cabin, then hand over to the team.
- Never ask for card numbers, bank details, passport scans, or CNIC numbers in the chat. The team arranges payment and documents directly.

When to hand over to a person (use the handoff_to_agent tool, then tell the customer a team member will reply here soon):
- The customer wants to book, pay, confirm, change or cancel anything.
- They need flight fares, Hajj packages, group rates for 10 or more, or anything else not in the reference.
- They have a complaint, a problem with an existing booking, or an emergency during travel.
- They ask to talk to a person, or you are unsure what they need after two tries.
Put everything you have learnt in the handoff summary (name, travel plans, travellers, budget, any quote total) so the team doesn't have to ask again.

Each customer message starts with a line like "[Received: ...]" giving the date and time in Karachi; it is not from the customer. Lines in square brackets inside a message describe things the customer sent that you can't open.`;

const pkr = formatPKR;

function contactSection() {
  return `## Contact
- WhatsApp / phone: ${WHATSAPP_DISPLAY}
- Email: ${EMAIL}
- Office: ${ADDRESS}
- Website: ${SITE_URL} (Umrah package builder: ${SITE_URL}/umrah-planner)`;
}

function servicesSection() {
  const list = services.map((s) => `- ${s.title}: ${s.description} (${s.points.join("; ")})`).join("\n");
  const why = whyUs.map((w) => `- ${w.title}: ${w.text}`).join("\n");
  return `## Services\n${list}\n\n## Why T&T\n${why}`;
}

function packagesSection() {
  const sharing = PACKAGE_SHARING.map((s) => `${s.label} = ${s.perRoom} per room`).join(", ");
  const rows = umrahPackages
    .map((p) => {
      const hotel = (h: typeof p.makkah) =>
        `${h.name}${h.distance ? ` (${h.distance}${h.shuttle ? ", shuttle" : ""})` : ""}`;
      const prices = PACKAGE_SHARING.filter((s) => p.prices[s.id])
        .map((s) => `${s.label} ${pkr(p.prices[s.id]!)}`)
        .join(", ");
      const extra = [p.departure && `departs ${p.departure}`, p.flights?.length && `flights ${p.flights.join(" / ")}`]
        .filter(Boolean)
        .join("; ");
      return `- ${p.tier}, ${p.days} days, ${p.airline}. Makkah: ${hotel(p.makkah)}. Madinah: ${hotel(p.madinah)}. Per person: ${prices}.${extra ? ` ${extra}.` : ""}`;
    })
    .join("\n");
  return `## Ready-made Umrah packages (${PACKAGE_SEASON} season)
Each includes: ${PACKAGE_INCLUDES.join(", ")}. Room sharing: ${sharing}.
${rows}`;
}

function hotelsSection() {
  const rooms = ROOM_TYPES.map((r) => `${r.label} sleeps ${r.guests}`).join(", ");
  const rows = hotels
    .map((h) => {
      const rates = ROOM_TYPES.map((r) => `${r.label} ${pkr(h.rates[r.id])}`).join(", ");
      const where = `${formatDistance(h.distanceM)} to the Haram${h.shuttle ? ", shuttle" : ""}`;
      return `- id "${h.id}": ${h.name}, ${h.city === "makkah" ? "Makkah" : "Madinah"}, ${h.area}, ${h.stars}★, ${where}. Per room per night: ${rates}.${breakfastIncluded(h) ? " Breakfast included." : ""} ${h.perks.join("; ")}`;
    })
    .join("\n");
  return `## Hotels (for custom trips; use the id with quote_umrah_trip)
Rooms: ${rooms}. Breakfast can be added at ${pkr(BREAKFAST_PER_PERSON_NIGHT)} per person per night where not included.
${rows}`;
}

function transportSection() {
  const vehicles = transportVehicles
    .map((v) => `- id "${v.id}": ${v.name} (${v.model}), ${v.seats} seats, ${v.bags} bags`)
    .join("\n");
  const routes = transportRoutes
    .map((r) => {
      const rates = transportVehicles.map((v) => `${v.name} ${pkr(r.rates[v.id])}`).join(", ");
      return `- ${r.from} → ${r.to}${r.group === "ziaraat" ? " (tour)" : " (either direction)"}, ${r.duration}. ${r.note} Per vehicle per trip: ${rates}.`;
    })
    .join("\n");
  return `## Transport in Saudi Arabia\nVehicles:\n${vehicles}\nRoutes:\n${routes}`;
}

function visaSection() {
  return visaTypes
    .map((v) => {
      const facts = v.facts.map((f) => `${f.label}: ${f.value}`).join("; ");
      const docs = v.documents
        .map((d) => `${d.title}${d.weArrange ? " (T&T arranges)" : ""}: ${d.detail} [for ${d.for.join(", ")}]`)
        .join("; ");
      return `## ${v.name}
${v.tagline}. Eligibility: ${v.eligibility}
${facts}. Fee: ${pkr(v.fee)} ${v.feeNote}.
Documents: ${docs}
${v.notes.map((n) => `- ${n}`).join("\n")}`;
    })
    .join("\n\n");
}

function ziaraatSection() {
  const rows = ziaraatTours
    .map(
      (t) =>
        `- ${t.name} (${t.duration}): ${t.summary} ${pkr(t.pricePerPerson)} per person on a shared guided tour. Includes ${t.includes.join(", ")}. Stops: ${t.stops.map((s) => s.name).join(", ")}.`
    )
    .join("\n");
  return `## Ziaraat tours\n${rows}\nA private ziaraat by vehicle is priced from the transport rates above.`;
}

function builderSection() {
  const presets = ROUTE_PRESETS.map((r) => r.label).join("; ");
  return `## Custom Umrah trips (the website's package builder)
Routes: ${presets}, or any order of up to ${BOOKING.maxStops} stops. Start date ${BOOKING.minLeadDays} to ${BOOKING.maxAheadDays} days from today; ${BOOKING.minNights} to ${BOOKING.maxNights} nights in total. Up to ${BOOKING.maxTravellers} travellers. Children are 2 to 17, infants under 2 (infants don't need a bed or seat).
Optional extras: Umrah visa, return flights from Karachi (estimate: adult ${pkr(FLIGHTS.adult)}, child ${pkr(FLIGHTS.child)}, infant ${pkr(FLIGHTS.infant)}), transport for every transfer, and ziaraat in each city.`;
}

function faqSection() {
  return `## FAQ\n${faqs.map((f) => `- Q: ${f.q}\n  A: ${f.a}`).join("\n")}`;
}

let cached: string | null = null;

export function systemPrompt(): string {
  cached ??= [
    RULES,
    "# Reference",
    contactSection(),
    servicesSection(),
    packagesSection(),
    builderSection(),
    hotelsSection(),
    transportSection(),
    visaSection(),
    ziaraatSection(),
    faqSection(),
  ].join("\n\n");
  return cached;
}
