import type {
  CleaningFrequency,
  CleaningPropertyType,
  KeyAccess,
  PetAnswer,
  TidyingOption,
} from "@/lib/booking";

export type AdminPricingMode = "fixed" | "loppande";

export const adminPricingModeOptions: {
  value: AdminPricingMode;
  label: string;
  description: string;
}[] = [
  {
    value: "fixed",
    label: "Fast pris",
    description: "Ett avtalat pris för uppdraget eller besöket.",
  },
  {
    value: "loppande",
    label: "Löpande",
    description: "Debiteras löpande efter utfört arbete.",
  },
];

export const serviceTimeframeOptions = [
  { value: "snarast", label: "Snarast möjligt" },
  { value: "inom-2-veckor", label: "Inom 2 veckor" },
  { value: "inom-1-manad", label: "Inom 1 månad" },
  { value: "flexibel", label: "Flexibel tid" },
] as const;

export type AdminScheduleBookingInput = {
  serviceSlug: string;
  profileId?: string | null;
  name: string;
  phone: string;
  email: string;
  address?: string;
  postalCode: string;
  municipality: string;
  visitDate: string;
  visitTime: string;
  staffId?: string | null;
  note?: string;
  durationMinutes?: number;
  cleaningPropertyType?: CleaningPropertyType;
  squareMeters?: number;
  hasPets?: PetAnswer;
  frequency?: CleaningFrequency;
  tidying?: TidyingOption;
  keyAccess?: KeyAccess;
  pricingMode?: AdminPricingMode;
  fixedPriceKr?: number;
  message?: string;
  timeframe?: string;
};

export function isCleaningServiceSlug(serviceSlug: string) {
  return serviceSlug === "stad";
}

export function usesCalculatedCleaningPrice(
  serviceSlug: string,
  propertyType?: CleaningPropertyType,
) {
  return isCleaningServiceSlug(serviceSlug) && (!propertyType || propertyType === "hem");
}

export function requiresManualPricing(
  serviceSlug: string,
  propertyType?: CleaningPropertyType,
) {
  return !usesCalculatedCleaningPrice(serviceSlug, propertyType);
}
