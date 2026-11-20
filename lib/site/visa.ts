/**
 * Visa types, document checklists and steps shown on /services/visa.
 *
 * ⚠️ SAMPLE DATA — fees are dummy values, and the requirements are a general
 * guide for Pakistani passport holders. Confirm them with T&T (Saudi rules
 * change often), then set VISA_IS_PLACEHOLDER to false (it controls the notice).
 */

export const VISA_IS_PLACEHOLDER = false;

export type Traveller = "adult" | "child" | "infant";

export const TRAVELLERS: { id: Traveller; label: string; hint: string }[] = [
  { id: "adult", label: "Adult", hint: "18 years and over" },
  { id: "child", label: "Child", hint: "2 to 17 years" },
  { id: "infant", label: "Infant", hint: "Under 2 years" },
];

export type VisaDocument = {
  id: string;
  title: string;
  detail: string;
  for: Traveller[];
  /** T&T arranges this as part of a package. */
  weArrange?: boolean;
};

export type VisaType = {
  id: string;
  name: string;
  tagline: string;
  eligibility: string;
  facts: { label: string; value: string }[];
  /** PKR per person. */
  fee: number;
  feeNote: string;
  documents: VisaDocument[];
  notes: string[];
};

const ALL: Traveller[] = ["adult", "child", "infant"];

export const visaTypes: VisaType[] = [
  {
    id: "umrah",
    name: "Umrah visa",
    tagline: "For pilgrims travelling to perform Umrah",
    eligibility: "Pakistani passport holders travelling for Umrah, alone, with family or in a group.",
    facts: [
      { label: "Processing", value: "3–5 working days" },
      { label: "Validity", value: "90 days" },
      { label: "Stay", value: "Up to 90 days" },
      { label: "Entry", value: "Single entry" },
    ],
    fee: 45000,
    feeNote: "per person, includes Saudi medical insurance",
    documents: [
      {
        id: "passport",
        title: "Original passport",
        detail: "Valid for at least 6 months from travel date, with 2 blank pages.",
        for: ALL,
      },
      {
        id: "cnic",
        title: "CNIC copy",
        detail: "Clear copy of the front and back.",
        for: ["adult"],
      },
      {
        id: "bform",
        title: "B-Form or birth certificate",
        detail: "NADRA B-Form, or birth certificate for newborns.",
        for: ["child", "infant"],
      },
      {
        id: "frc",
        title: "Family Registration Certificate (FRC)",
        detail: "From NADRA, to show the relation to the parent travelling.",
        for: ["child", "infant"],
      },
      {
        id: "photo",
        title: "Passport-size photo",
        detail: "Recent photo with a white background.",
        for: ALL,
      },
      {
        id: "polio",
        title: "Polio vaccination certificate",
        detail: "NIMS polio certificate, checked at departure from Pakistan.",
        for: ALL,
      },
      {
        id: "meningitis",
        title: "Meningitis (ACYW) vaccination certificate",
        detail: "Taken at least 10 days before travel.",
        for: ["adult", "child"],
      },
      {
        id: "booking",
        title: "Return ticket & hotel booking",
        detail: "Confirmed flights and stay for the whole trip.",
        for: ALL,
        weArrange: true,
      },
    ],
    notes: [
      "An Umrah visa can't be used to perform Hajj.",
      "Visiting the Rawdah in Madinah needs a separate permit on the Nusuk app. We can help you book it.",
    ],
  },
  {
    id: "tourist",
    name: "Saudi tourist visa",
    tagline: "For travellers who already hold a US, UK or Schengen visa",
    eligibility:
      "Pakistani passport holders with a valid US, UK or Schengen visa that has been used at least once.",
    facts: [
      { label: "Processing", value: "1–3 working days" },
      { label: "Validity", value: "1 year" },
      { label: "Stay", value: "Up to 90 days per visit" },
      { label: "Entry", value: "Multiple entry" },
    ],
    fee: 55000,
    feeNote: "per person, includes Saudi medical insurance",
    documents: [
      {
        id: "passport",
        title: "Original passport",
        detail: "Valid for at least 6 months from travel date.",
        for: ALL,
      },
      {
        id: "visa",
        title: "Valid US, UK or Schengen visa",
        detail: "Already used at least once to enter that country.",
        for: ALL,
      },
      {
        id: "cnic",
        title: "CNIC copy",
        detail: "Clear copy of the front and back.",
        for: ["adult"],
      },
      {
        id: "bform",
        title: "B-Form or birth certificate",
        detail: "NADRA B-Form, or birth certificate for newborns.",
        for: ["child", "infant"],
      },
      {
        id: "photo",
        title: "Passport-size photo",
        detail: "Recent photo with a white background.",
        for: ALL,
      },
      {
        id: "polio",
        title: "Polio vaccination certificate",
        detail: "NIMS polio certificate, checked at departure from Pakistan.",
        for: ALL,
      },
      {
        id: "booking",
        title: "Return ticket & hotel booking",
        detail: "Confirmed flights and stay for the trip.",
        for: ALL,
        weArrange: true,
      },
    ],
    notes: [
      "You can perform Umrah on a tourist visa outside the Hajj season.",
      "The tourist visa can't be used to perform Hajj.",
    ],
  },
];

export const visaSteps: { title: string; text: string }[] = [
  {
    title: "Share your documents",
    text: "Send clear photos on WhatsApp or drop them at our Karachi office.",
  },
  {
    title: "We check & apply",
    text: "Our team checks every document and submits your application.",
  },
  {
    title: "Track your status",
    text: "We keep you updated until a decision comes through.",
  },
  {
    title: "Visa delivered",
    text: "Your visa is sent to you on WhatsApp and email, ready to print.",
  },
];
