export const AIRLINE_OPTIONS = [
  { value: "saudia", label: "Saudia" },
  { value: "flynas", label: "flynas" },
  { value: "flyadeal", label: "flyadeal" },
  { value: "emirates", label: "Emirates" },
  { value: "etihad", label: "Etihad" },
  { value: "qatar", label: "Qatar Airways" },
  { value: "pia", label: "PIA" },
  { value: "airblue", label: "Airblue" },
  { value: "serene", label: "Serene Air" },
  { value: "turkish", label: "Turkish Airlines" },
  { value: "other", label: "Other" },
] as const;

export const PLAN_AIRLINE_OPTIONS = [
  { value: "any", label: "Any airline" },
  ...AIRLINE_OPTIONS.map((option) =>
    option.value === "other"
      ? { value: "other", label: "Other / specify in chat" }
      : option
  ),
] as const;

export type AirlineValue = (typeof AIRLINE_OPTIONS)[number]["value"];

export function airlineLabel(value: string) {
  if (!value) return "";
  const fromPlan = PLAN_AIRLINE_OPTIONS.find((option) => option.value === value);
  if (fromPlan) return fromPlan.label;
  const fromTicket = AIRLINE_OPTIONS.find((option) => option.value === value);
  return fromTicket?.label ?? value;
}
