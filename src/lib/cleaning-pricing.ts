import {
  cleaningFrequencyPlans,
  weekdayPreferenceOptions,
  type CleaningFrequency,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
} from "@/lib/booking";

export type CleaningPricingInput = {
  squareMeters: string;
  hasPets: PetAnswer | "";
  frequency: CleaningFrequency;
  tidying: TidyingOption;
  weekdayPreference: WeekdayPreference;
};

export type CleaningPriceLine = {
  label: string;
  amount: number | null;
  note?: string;
};

export type CleaningPriceQuote = {
  priceLabel: string;
  total: number;
  isEstimate: boolean;
  perVisit: number;
  visitsPerMonth: number;
  lines: CleaningPriceLine[];
};

const BASE_RATE_PER_SQM = 9;
const STORSTADNING_RATE_PER_SQM = 12;
const PET_SURCHARGE = 149;
const TIDYING_SURCHARGE = 395;
const WEEKDAY_SURCHARGE = 49;
const DEFAULT_SQM = 50;

const frequencyConfig: Record<
  CleaningFrequency,
  { visitsPerMonth: number; discount: number; label: string }
> = {
  "varje-vecka": { visitsPerMonth: 4.33, discount: 0.25, label: "Varje vecka" },
  "varannan-vecka": { visitsPerMonth: 2.17, discount: 0.2, label: "Varannan vecka" },
  "var-fjarde-vecka": { visitsPerMonth: 1, discount: 0, label: "Var fjärde vecka" },
  storstadning: { visitsPerMonth: 1, discount: 0, label: "Storstädning" },
};

export function formatKr(amount: number) {
  return `${Math.round(amount).toLocaleString("sv-SE")} kr`;
}

function resolveSquareMeters(squareMeters: string) {
  const parsed = Number(squareMeters);
  if (!squareMeters.trim() || Number.isNaN(parsed) || parsed < 10) {
    return { sqm: DEFAULT_SQM, isEstimate: true };
  }

  return { sqm: parsed, isEstimate: false };
}

export function calculateCleaningPrice(input: CleaningPricingInput): CleaningPriceQuote {
  const { sqm, isEstimate } = resolveSquareMeters(input.squareMeters);
  const config = frequencyConfig[input.frequency];
  const frequencyLabel =
    cleaningFrequencyPlans.find((plan) => plan.value === input.frequency)?.label ??
    config.label;

  const isOneTime = input.frequency === "storstadning";
  const baseRate = isOneTime ? STORSTADNING_RATE_PER_SQM : BASE_RATE_PER_SQM;
  const baseVisitPrice = sqm * baseRate;
  const discountAmount = isOneTime ? 0 : baseVisitPrice * config.discount;
  const discountedBase = baseVisitPrice - discountAmount;

  const petAmount = input.hasPets === "ja" ? PET_SURCHARGE : 0;
  const tidyingAmount = input.tidying === "ja-undanplockning" ? TIDYING_SURCHARGE : 0;
  const weekdayAmount =
    input.weekdayPreference === "valj-dag" ? WEEKDAY_SURCHARGE : 0;

  const perVisit = discountedBase + petAmount + tidyingAmount + weekdayAmount;
  const total = isOneTime ? perVisit : perVisit * config.visitsPerMonth;

  const lines: CleaningPriceLine[] = [
    {
      label: `Grundpris (${sqm} kvm × ${baseRate} kr)`,
      amount: baseVisitPrice,
    },
  ];

  if (!isOneTime && discountAmount > 0) {
    lines.push({
      label: `Rabatt (${Math.round(config.discount * 100)} %, ${frequencyLabel.toLowerCase()})`,
      amount: -discountAmount,
    });
  }

  if (petAmount > 0) {
    lines.push({ label: "Husdjurstillägg", amount: petAmount });
  }

  if (tidyingAmount > 0) {
    lines.push({ label: "Undanplockning", amount: tidyingAmount });
  }

  if (weekdayAmount > 0) {
    const weekdayLabel =
      weekdayPreferenceOptions.find((option) => option.value === input.weekdayPreference)
        ?.label ?? "Vald veckodag";
    lines.push({ label: weekdayLabel, amount: weekdayAmount });
  }

  lines.push({
    label: "Städmaterial ingår",
    amount: 0,
    note: "Ingår i priset",
  });

  if (!isOneTime) {
    lines.push({
      label: "Pris per städning",
      amount: perVisit,
    });
    lines.push({
      label: `Antal städningar per månad (${frequencyLabel.toLowerCase()})`,
      amount: null,
      note: config.visitsPerMonth.toLocaleString("sv-SE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    });
  }

  return {
    priceLabel: isOneTime ? "Engångspris" : "Pris per månad",
    total,
    isEstimate,
    perVisit,
    visitsPerMonth: config.visitsPerMonth,
    lines,
  };
}
