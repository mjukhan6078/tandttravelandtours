import { emailInquiry, isEmailConfigured } from "@/lib/inquire/mailer";
import { appendInquiry } from "@/lib/inquire/store";
import { ROOM_TYPES, type RoomType } from "@/lib/site/hotels";
import {
  BOOKING,
  CITY_LABEL,
  bestVehicle,
  calculateQuote,
  carsNeeded,
  formatPKR,
  hotelById,
  suggestRooms,
  vehicleById,
  type CityId,
  type PlannerState,
  type Stop,
} from "@/lib/site/pricing";
import { transportVehicles, type VehicleId } from "@/lib/site/transport";
import type { ToolDefinition } from "./llm";

/**
 * Tools the WhatsApp assistant can call. quote_umrah_trip runs the same maths
 * as the website's package builder; handoff_to_agent saves the lead, emails
 * the team and pauses the bot in that chat.
 */

const CITIES: CityId[] = ["makkah", "madinah"];
const VEHICLES = transportVehicles.map((v) => v.id);
const ROOMS = ROOM_TYPES.map((r) => r.id);

const HANDOFF_REASONS = [
  "booking",
  "payment",
  "documents",
  "flight_fare",
  "group_or_hajj",
  "complaint",
  "customer_asked",
  "not_covered",
  "other",
] as const;

const TOOL_SPECS: { name: string; description: string; input_schema: Record<string, unknown> }[] = [
  {
    name: "quote_umrah_trip",
    description:
      "Works out an estimated price in PKR for a custom Umrah trip, using T&T's hotel, transport, visa, ziaraat and flight rates (the same maths as the website's package builder). Call it whenever the customer wants a price for their own dates, nights, hotels or group, instead of calculating yourself. Returns the line items, total and per-person price, plus any problems with the request to fix with the customer.",
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["stops", "start_date", "adults", "children", "infants", "room_sharing", "transport", "vehicle", "ziaraat", "visa", "flights"],
      properties: {
        stops: {
          type: "array",
          description: `The cities in travel order, 1 to ${BOOKING.maxStops} stops, e.g. Makkah then Madinah.`,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["city", "nights", "hotel_id", "breakfast"],
            properties: {
              city: { type: "string", enum: CITIES },
              nights: { type: "integer", description: "Nights at this stop." },
              hotel_id: {
                type: "string",
                description: 'A hotel id from the reference in this city, or "none" if the customer arranges their own stay.',
              },
              breakfast: { type: "boolean", description: "Add breakfast (ignored where the hotel includes it)." },
            },
          },
        },
        start_date: { type: "string", description: "Arrival date in Saudi Arabia, YYYY-MM-DD." },
        adults: { type: "integer", description: "Travellers 18 and over." },
        children: { type: "integer", description: "Travellers 2 to 17." },
        infants: { type: "integer", description: "Under 2: no bed or seat." },
        room_sharing: {
          type: "string",
          enum: ROOMS,
          description: "Preferred room type; leftover guests get one smaller room.",
        },
        transport: {
          type: "string",
          enum: ["all_transfers", "none"],
          description: "all_transfers = airport pick-up, every city change and airport drop-off.",
        },
        vehicle: {
          type: "string",
          enum: ["auto", ...VEHICLES],
          description: '"auto" picks the cheapest vehicle that seats the group.',
        },
        ziaraat: { type: "array", items: { type: "string", enum: CITIES }, description: "Cities to add a ziaraat tour in." },
        visa: { type: "boolean", description: "Add the Umrah visa for every traveller." },
        flights: { type: "boolean", description: "Add return flights from Karachi (estimate)." },
      },
    },
  },
  {
    name: "handoff_to_agent",
    description:
      "Hands the chat to a T&T team member: saves the customer's details as a lead, emails the team, and stops the automatic replies in this chat for a while. Use it when the customer wants to book, pay or change something, needs something not in the reference (flight fares, Hajj, group rates), has a complaint, or asks for a person. After calling it, tell the customer a team member will reply in this chat soon.",
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["reason", "customer_name", "summary"],
      properties: {
        reason: { type: "string", enum: [...HANDOFF_REASONS] },
        customer_name: { type: "string", description: 'The customer\'s name if known, else "".' },
        summary: {
          type: "string",
          description:
            "Everything the team needs so they don't ask again: what the customer wants, travel dates, cities and nights, travellers, hotel or budget level, room sharing, extras, any quote total you gave, and open questions.",
        },
      },
    },
  },
];

export const TOOLS: ToolDefinition[] = TOOL_SPECS.map((t) => ({
  type: "function",
  function: { name: t.name, description: t.description, parameters: t.input_schema },
}));

/* ───────────── quote ───────────── */

type QuoteInput = {
  stops: { city: CityId; nights: number; hotel_id: string; breakfast: boolean }[];
  start_date: string;
  adults: number;
  children: number;
  infants: number;
  room_sharing: RoomType;
  transport: "all_transfers" | "none";
  vehicle: VehicleId | "auto";
  ziaraat: CityId[];
  visa: boolean;
  flights: boolean;
};

const isInt = (n: unknown, min: number, max: number): n is number =>
  Number.isInteger(n) && (n as number) >= min && (n as number) <= max;

/** Daydiff between today in Karachi and `date` (YYYY-MM-DD). */
function daysFromToday(date: string): number {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

function quote(input: QuoteInput) {
  const problems: string[] = [];
  const stops = Array.isArray(input.stops) ? input.stops : [];
  if (stops.length < 1 || stops.length > BOOKING.maxStops) problems.push(`Give 1 to ${BOOKING.maxStops} stops.`);
  if (!isInt(input.adults, 1, BOOKING.maxTravellers)) problems.push("At least one adult is needed.");
  if (!isInt(input.children, 0, BOOKING.maxTravellers)) problems.push("Children must be 0 or more.");
  if (!isInt(input.infants, 0, BOOKING.maxTravellers)) problems.push("Infants must be 0 or more.");
  if (input.adults + input.children + input.infants > BOOKING.maxTravellers) {
    problems.push(`The builder takes up to ${BOOKING.maxTravellers} travellers; larger groups are quoted by the team.`);
  }
  if (!ROOMS.includes(input.room_sharing)) problems.push("Unknown room type.");
  if (input.vehicle !== "auto" && !VEHICLES.includes(input.vehicle)) problems.push("Unknown vehicle.");

  const planned: Stop[] = [];
  stops.forEach((s, i) => {
    if (!CITIES.includes(s.city)) return problems.push(`Stop ${i + 1}: unknown city.`);
    if (!isInt(s.nights, 1, BOOKING.maxNights)) return problems.push(`Stop ${i + 1}: nights must be 1 to ${BOOKING.maxNights}.`);
    const hotel = s.hotel_id === "none" ? null : hotelById(s.hotel_id);
    if (hotel === undefined || (hotel && hotel.city !== s.city)) {
      return problems.push(`Stop ${i + 1}: "${s.hotel_id}" isn't a ${CITY_LABEL[s.city]} hotel id from the reference.`);
    }
    planned.push({
      city: s.city,
      nights: s.nights,
      hotelId: hotel ? hotel.id : null,
      rooms: suggestRooms(input.adults + input.children, input.room_sharing),
      breakfast: Boolean(s.breakfast),
    });
  });

  const totalNights = planned.reduce((n, s) => n + s.nights, 0);
  if (planned.length && (totalNights < BOOKING.minNights || totalNights > BOOKING.maxNights)) {
    problems.push(`Total nights must be ${BOOKING.minNights} to ${BOOKING.maxNights}.`);
  }

  const notes: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.start_date) || Number.isNaN(Date.parse(input.start_date))) {
    problems.push("start_date must be YYYY-MM-DD.");
  } else {
    const days = daysFromToday(input.start_date);
    if (days < BOOKING.minLeadDays) {
      notes.push(`The date is less than ${BOOKING.minLeadDays} days away: the team must check it can be arranged in time.`);
    } else if (days > BOOKING.maxAheadDays) {
      notes.push(`The date is more than ${BOOKING.maxAheadDays} days away: rates for it aren't out yet, so this uses today's rates.`);
    }
  }

  if (problems.length) return { ok: false, problems };

  const guests = input.adults + input.children;
  const vehicleId = input.vehicle === "auto" ? bestVehicle(guests) : input.vehicle;
  const state: PlannerState = {
    route: "custom",
    stops: planned,
    startDate: input.start_date,
    adults: input.adults,
    children: input.children,
    childAges: [],
    infants: input.infants,
    nationality: "Pakistan",
    roomPref: input.room_sharing,
    comfort: "custom",
    transportMode: input.transport === "all_transfers" ? "full" : "selective",
    vehicleId,
    cars: carsNeeded(vehicleById(vehicleId), guests),
    legVehicles: {},
    ziaraat: [...new Set(input.ziaraat.filter((c) => CITIES.includes(c)))],
    visa: input.visa,
    flights: input.flights,
  };

  const q = calculateQuote(state);
  return {
    ok: true,
    lines: q.lines.map((l) => ({ item: l.label, detail: l.detail, amount: formatPKR(l.amount) })),
    total: formatPKR(q.total),
    per_person: `${formatPKR(q.perPerson)} (per adult or child)`,
    notes: [
      ...notes,
      "Estimate from website rates; the team confirms final prices and availability before booking.",
      ...(input.flights ? [] : ["Flights are not included."]),
    ],
  };
}

/* ───────────── handoff ───────────── */

type HandoffInput = { reason: (typeof HANDOFF_REASONS)[number]; customer_name: string; summary: string };

export type ToolContext = {
  waId: string;
  profileName?: string;
  /** Called by handoff_to_agent; the agent pauses the chat. */
  onHandoff: () => void;
};

async function handoff(input: HandoffInput, ctx: ToolContext) {
  const name = (input.customer_name || ctx.profileName || "WhatsApp customer").slice(0, 100);
  const summary = String(input.summary || "").slice(0, 5000);
  const record = await appendInquiry({
    type: input.reason === "booking" ? "quote" : "inquire",
    channel: "whatsapp",
    name,
    phone: `+${ctx.waId}`,
    message: summary || "(no summary)",
    interest: `WhatsApp bot handover: ${input.reason.replace(/_/g, " ")}`,
  });
  if (isEmailConfigured()) {
    // The lead is saved either way; a mail failure shouldn't stop the reply.
    await emailInquiry(record).catch((err) => console.error("[whatsapp] handoff email failed", record.id, err));
  }
  ctx.onHandoff();
  return { ok: true, message: "The team has the details and will reply in this chat. The automatic replies are paused here." };
}

/** Runs one tool call and returns the text for its tool_result. */
export async function runTool(name: string, input: unknown, ctx: ToolContext): Promise<{ content: string; isError?: boolean }> {
  try {
    if (!input || typeof input !== "object") throw new Error("Tool input must be an object.");
    if (name === "quote_umrah_trip") {
      const result = quote(input as QuoteInput);
      return { content: JSON.stringify(result), isError: !result.ok };
    }
    if (name === "handoff_to_agent") {
      return { content: JSON.stringify(await handoff(input as HandoffInput, ctx)) };
    }
    return { content: `Unknown tool: ${name}`, isError: true };
  } catch (err) {
    console.error(`[whatsapp] tool ${name} failed`, err);
    return { content: `The tool failed: ${err instanceof Error ? err.message : String(err)}`, isError: true };
  }
}
