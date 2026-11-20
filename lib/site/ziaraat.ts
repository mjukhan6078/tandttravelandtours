/**
 * Ziaraat tours shown on /services/ziaraat.
 *
 * ⚠️ SAMPLE RATES — every PKR figure below is a dummy value. Confirm the tours
 * T&T runs and their real prices, then set ZIARAAT_IS_PLACEHOLDER to false (it
 * controls the "sample rates" notice).
 */

export const ZIARAAT_IS_PLACEHOLDER = false;

export type ZiaraatCity = "makkah" | "madinah";

export const ZIARAAT_CITIES: { id: ZiaraatCity; name: string; tagline: string }[] = [
  { id: "makkah", name: "Makkah", tagline: "Sites of revelation and Hajj" },
  { id: "madinah", name: "Madinah", tagline: "The city of the Prophet ﷺ" },
];

export type ZiaraatStop = {
  name: string;
  detail: string;
};

export type ZiaraatTour = {
  id: string;
  city: ZiaraatCity;
  name: string;
  duration: string;
  summary: string;
  /** PKR per person, on a shared guided tour. */
  pricePerPerson: number;
  includes: string[];
  stops: ZiaraatStop[];
};

export const ziaraatTours: ZiaraatTour[] = [
  {
    id: "makkah-ziaraat",
    city: "makkah",
    name: "Makkah ziaraat",
    duration: "~3 hours",
    summary: "The classic morning tour of the sacred sites around Makkah.",
    pricePerPerson: 3500,
    includes: ["Hotel pick-up & drop", "Air-conditioned transport", "Guide"],
    stops: [
      {
        name: "Jabal al-Noor",
        detail: "The mountain of the Cave of Hira, where the first revelation came to the Prophet ﷺ.",
      },
      {
        name: "Jabal Thawr",
        detail: "The cave where the Prophet ﷺ and Abu Bakr (RA) sheltered during the Hijrah.",
      },
      {
        name: "Mina",
        detail: "The tent city of Hajj and the site of the Jamarat.",
      },
      {
        name: "Muzdalifah",
        detail: "Where Hajj pilgrims spend the night under the open sky after Arafat.",
      },
      {
        name: "Arafat & Jabal al-Rahmah",
        detail: "The plain of the Day of Arafah, the heart of Hajj.",
      },
      {
        name: "Masjid Aisha (Tan'eem)",
        detail: "The nearest miqat, where pilgrims can enter ihram for another Umrah.",
      },
    ],
  },
  {
    id: "taif-day-trip",
    city: "makkah",
    name: "Taif day trip",
    duration: "~10 hours",
    summary: "A cool mountain day out, returning through the miqat for Umrah.",
    pricePerPerson: 12000,
    includes: ["Hotel pick-up & drop", "Air-conditioned transport", "Guide", "Lunch stop"],
    stops: [
      {
        name: "Al-Hada mountain road",
        detail: "The winding climb up the escarpment, with views back over the valleys.",
      },
      {
        name: "Masjid Abdullah ibn Abbas",
        detail: "The historic mosque named after the Companion buried beside it.",
      },
      {
        name: "Masjid Addas",
        detail: "Marks where Addas offered grapes to the Prophet ﷺ after his visit to Taif.",
      },
      {
        name: "Rose farms & fruit market",
        detail: "Taif's famous rose farms (in season) and local fruit stalls.",
      },
      {
        name: "Miqat Qarn al-Manazil",
        detail: "Enter ihram here on the way back to perform Umrah in Makkah.",
      },
    ],
  },
  {
    id: "madinah-ziaraat",
    city: "madinah",
    name: "Madinah ziaraat",
    duration: "~3 hours",
    summary: "The essential tour of the historic mosques and sites of Madinah.",
    pricePerPerson: 3000,
    includes: ["Hotel pick-up & drop", "Air-conditioned transport", "Guide"],
    stops: [
      {
        name: "Masjid Quba",
        detail: "The first mosque built in Islam. Praying two rak'ahs here carries the reward of an Umrah.",
      },
      {
        name: "Masjid al-Qiblatain",
        detail: "The mosque where the qiblah was changed from Jerusalem to the Kaaba.",
      },
      {
        name: "Mount Uhud & martyrs' cemetery",
        detail: "Site of the Battle of Uhud, where Hamza (RA) and the martyrs are buried.",
      },
      {
        name: "The Seven Mosques",
        detail: "Small mosques at the site of the Battle of the Trench (Khandaq).",
      },
      {
        name: "Date market",
        detail: "Pick up Ajwa and other Madinah dates to take home.",
      },
    ],
  },
  {
    id: "badr-day-trip",
    city: "madinah",
    name: "Badr day trip",
    duration: "~6 hours",
    summary: "A half-day journey to the site of the first great battle of Islam.",
    pricePerPerson: 10000,
    includes: ["Hotel pick-up & drop", "Air-conditioned transport", "Guide"],
    stops: [
      {
        name: "Badr battlefield",
        detail: "The plain where the Battle of Badr was fought in 2 AH.",
      },
      {
        name: "Martyrs of Badr cemetery",
        detail: "Resting place of the fourteen Companions martyred at Badr.",
      },
      {
        name: "Masjid al-Areesh",
        detail: "Built where the Prophet ﷺ's shelter stood during the battle.",
      },
      {
        name: "Jabal al-Malaikah",
        detail: "The 'Mountain of Angels', overlooking the battlefield.",
      },
    ],
  },
];

export const MAX_ZIARAAT_GROUP = 45;
