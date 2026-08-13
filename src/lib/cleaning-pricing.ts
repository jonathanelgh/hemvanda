import {
  cleaningFrequencyPlans,
  weekdayPreferenceOptions,
  type CleaningAddons,
  type CleaningFrequency,
  type CleaningPropertyType,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
  type WindowBookingMode,
} from "@/lib/booking";

export type CleaningPricingInput = {
  squareMeters: string;
  hasPets: PetAnswer | "";
  frequency: CleaningFrequency;
  tidying?: TidyingOption;
  weekdayPreference: WeekdayPreference;
  propertyType?: CleaningPropertyType;
  addons?: CleaningAddons;
  windowCount?: number;
  windowMode?: WindowBookingMode;
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

export const ADDON_PRICES = {
  oven: 301,
  fridge: 220,
  supplies: 301,
  window: 280,
  balcony: 300,
} as const;

const PET_SURCHARGE = 149;
const WEEKDAY_SURCHARGE = 49;
const DEFAULT_SQM = 50;
export const MIN_CLEANING_SQM = 10;
export const MAX_CLEANING_SQM = 500;

/** Begränsar kvm-input till max 500. Tom sträng tillåts medan man skriver. */
export function sanitizeSquareMetersInput(value: string) {
  if (value.trim() === "") return "";

  const digits = value.replace(/[^\d]/g, "");
  if (digits === "") return "";

  const parsed = Number(digits);
  if (Number.isNaN(parsed)) return "";

  return String(Math.min(parsed, MAX_CLEANING_SQM));
}

type HemstadFrequency = "varje-vecka" | "varannan-vecka" | "var-fjarde-vecka";

/** Riktpriser per kvm – mellanliggande ytor interpoleras linjärt. */
const HEMSTAD_ANCHORS: {
  sqm: number;
  prices: Record<HemstadFrequency, number>;
}[] = [
  {
    sqm: 49,
    prices: {
      "var-fjarde-vecka": 1409,
      "varannan-vecka": 764,
      "varje-vecka": 707,
    },
  },
  {
    sqm: 50,
    prices: {
      "var-fjarde-vecka": 1409,
      "varannan-vecka": 949,
      "varje-vecka": 857,
    },
  },
  {
    sqm: 100,
    prices: {
      "var-fjarde-vecka": 1799,
      "varannan-vecka": 1280,
      "varje-vecka": 1130,
    },
  },
];

const STORSTAD_ANCHORS: { sqm: number; price: number }[] = [
  { sqm: 50, price: 2290 },
  { sqm: 100, price: 3690 },
  { sqm: 120, price: 4290 },
  { sqm: 150, price: 5090 },
];

const FLYTTSTAD_ANCHORS: { sqm: number; price: number }[] = [
  { sqm: 50, price: 3499 },
  { sqm: 100, price: 5600 },
];

const frequencyConfig: Record<
  CleaningFrequency,
  { visitsPerMonth: number; label: string }
> = {
  "varje-vecka": { visitsPerMonth: 4.33, label: "Varje vecka" },
  "varannan-vecka": { visitsPerMonth: 2.17, label: "Varannan vecka" },
  "var-fjarde-vecka": { visitsPerMonth: 1, label: "Var fjärde vecka" },
  storstadning: { visitsPerMonth: 1, label: "Storstädning" },
  flyttstadning: { visitsPerMonth: 1, label: "Flyttstädning" },
  fonster: { visitsPerMonth: 1, label: "Fönsterputs" },
};

export function formatKr(amount: number) {
  return `${Math.round(amount).toLocaleString("sv-SE")} kr`;
}

function resolveSquareMeters(squareMeters: string) {
  const parsed = Number(squareMeters);
  if (!squareMeters.trim() || Number.isNaN(parsed) || parsed < MIN_CLEANING_SQM) {
    return { sqm: DEFAULT_SQM, isEstimate: true };
  }

  return {
    sqm: Math.min(Math.round(parsed), MAX_CLEANING_SQM),
    isEstimate: false,
  };
}

/**
 * Beräknar pris från riktpunkter (kvm → pris).
 * - Under första punkten: samma pris som första punkten
 * - Mellan punkter: linjär interpolering per kvm
 * - Över sista punkten: extrapolering med samma lutning som sista segmentet
 */
function priceFromAnchors(
  sqm: number,
  anchors: { sqm: number; price: number }[],
): { price: number; isEstimate: boolean; label: string } {
  if (anchors.length === 0) {
    throw new Error("Saknar prisriktpunkter.");
  }

  const first = anchors[0]!;
  const last = anchors[anchors.length - 1]!;

  if (sqm <= first.sqm) {
    return {
      price: first.price,
      isEstimate: false,
      label: sqm === first.sqm ? `${sqm} kvm` : `upp till ${first.sqm} kvm`,
    };
  }

  for (let i = 0; i < anchors.length - 1; i += 1) {
    const from = anchors[i]!;
    const to = anchors[i + 1]!;

    if (sqm <= to.sqm) {
      if (sqm === to.sqm) {
        return { price: to.price, isEstimate: false, label: `${sqm} kvm` };
      }

      const t = (sqm - from.sqm) / (to.sqm - from.sqm);
      const price = Math.round(from.price + t * (to.price - from.price));

      return {
        price,
        isEstimate: false,
        label: `${sqm} kvm`,
      };
    }
  }

  if (anchors.length === 1) {
    const rate = last.price / last.sqm;
    return {
      price: Math.round(rate * sqm),
      isEstimate: true,
      label: `${sqm} kvm`,
    };
  }

  const prev = anchors[anchors.length - 2]!;
  const rate = (last.price - prev.price) / (last.sqm - prev.sqm);
  const price = Math.round(last.price + (sqm - last.sqm) * rate);

  return {
    price,
    isEstimate: true,
    label: `${sqm} kvm`,
  };
}

function hemstadPerVisit(sqm: number, frequency: HemstadFrequency) {
  return priceFromAnchors(
    sqm,
    HEMSTAD_ANCHORS.map((anchor) => ({
      sqm: anchor.sqm,
      price: anchor.prices[frequency],
    })),
  );
}

function addonLines(addons?: CleaningAddons, windowCount = 0): CleaningPriceLine[] {
  const lines: CleaningPriceLine[] = [];
  if (!addons) return lines;

  if (addons.oven) {
    lines.push({ label: "Ugnsrengöring", amount: ADDON_PRICES.oven });
  }
  if (addons.fridge) {
    lines.push({ label: "Kylskåpsrengöring", amount: ADDON_PRICES.fridge });
  }
  if (addons.supplies) {
    lines.push({ label: "Städredskap", amount: ADDON_PRICES.supplies });
  }
  if (addons.balcony) {
    lines.push({ label: "Balkong", amount: ADDON_PRICES.balcony });
  }
  if (windowCount > 0 && addons.windowsIncluded) {
    lines.push({
      label: `Fönster (${windowCount} st)`,
      amount: windowCount * ADDON_PRICES.window,
    });
  }

  return lines;
}

function addonTotal(addons?: CleaningAddons, windowCount = 0) {
  return addonLines(addons, windowCount).reduce(
    (sum, line) => sum + (line.amount ?? 0),
    0,
  );
}

export function calculateCleaningPrice(input: CleaningPricingInput): CleaningPriceQuote {
  const propertyType = input.propertyType ?? "hem";
  const { sqm, isEstimate: sqmEstimate } = resolveSquareMeters(input.squareMeters);
  const config = frequencyConfig[input.frequency];
  const frequencyLabel =
    cleaningFrequencyPlans.find((plan) => plan.value === input.frequency)?.label ??
    config.label;

  const petAmount = input.hasPets === "ja" ? PET_SURCHARGE : 0;
  const weekdayAmount =
    input.weekdayPreference === "valj-dag" && propertyType === "hem"
      ? WEEKDAY_SURCHARGE
      : 0;

  const lines: CleaningPriceLine[] = [];
  let perVisit = 0;
  let visitsPerMonth = config.visitsPerMonth;
  let isOneTime = false;
  let isEstimate = sqmEstimate;
  let priceLabel = "Pris per månad";

  if (propertyType === "fonster") {
    const windows = Math.max(1, Math.round(input.windowCount || 1));
    const windowMode = input.windowMode ?? "engang";
    perVisit = windows * ADDON_PRICES.window;
    isOneTime = windowMode === "engang";
    visitsPerMonth = isOneTime ? 1 : config.visitsPerMonth;
    isEstimate = !(input.windowCount && input.windowCount > 0);
    priceLabel = isOneTime ? "Engångspris" : "Pris per månad";
    lines.push({
      label: `Fönsterputs (${windows} st × ${ADDON_PRICES.window} kr)`,
      amount: perVisit,
    });
  } else if (propertyType === "storstad" || input.frequency === "storstadning") {
    const tier = priceFromAnchors(sqm, STORSTAD_ANCHORS);
    perVisit = tier.price;
    isOneTime = true;
    visitsPerMonth = 1;
    isEstimate = isEstimate || tier.isEstimate;
    priceLabel = "Engångspris";
    lines.push({
      label: `Storstädning (${tier.label})`,
      amount: tier.price,
    });
  } else if (propertyType === "flyttstad" || input.frequency === "flyttstadning") {
    const tier = priceFromAnchors(sqm, FLYTTSTAD_ANCHORS);
    perVisit = tier.price;
    isOneTime = true;
    visitsPerMonth = 1;
    isEstimate = isEstimate || tier.isEstimate;
    priceLabel = "Engångspris";
    lines.push({
      label: `Flyttstädning (${tier.label})`,
      amount: tier.price,
    });
  } else {
    const freq: HemstadFrequency =
      input.frequency === "varje-vecka" ||
      input.frequency === "varannan-vecka" ||
      input.frequency === "var-fjarde-vecka"
        ? input.frequency
        : "varannan-vecka";
    const quote = hemstadPerVisit(sqm, freq);
    perVisit = quote.price;
    visitsPerMonth = frequencyConfig[freq].visitsPerMonth;
    isOneTime = false;
    isEstimate = isEstimate || quote.isEstimate;
    priceLabel = "Pris per månad";
    lines.push({
      label: `Hemstädning ${frequencyLabel.toLowerCase()} (${quote.label})`,
      amount: perVisit,
    });
  }

  if (petAmount > 0) {
    lines.push({ label: "Husdjurstillägg", amount: petAmount });
    perVisit += petAmount;
  }

  if (weekdayAmount > 0) {
    const weekdayLabel =
      weekdayPreferenceOptions.find((option) => option.value === input.weekdayPreference)
        ?.label ?? "Vald veckodag";
    lines.push({ label: weekdayLabel, amount: weekdayAmount });
    perVisit += weekdayAmount;
  }

  const extras = addonLines(
    input.addons,
    input.addons?.windowsIncluded ? input.windowCount ?? 0 : 0,
  );
  for (const line of extras) {
    lines.push(line);
    perVisit += line.amount ?? 0;
  }

  // Legacy undanplockning no longer offered; ignore if present in old data.
  void input.tidying;
  void addonTotal;

  if (!isOneTime) {
    lines.push({
      label: "Pris per städning",
      amount: perVisit,
    });
    lines.push({
      label: `Antal städningar per månad (${frequencyLabel.toLowerCase()})`,
      amount: null,
      note: visitsPerMonth.toLocaleString("sv-SE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    });
  }

  const total = isOneTime ? perVisit : perVisit * visitsPerMonth;

  return {
    priceLabel,
    total,
    isEstimate,
    perVisit,
    visitsPerMonth,
    lines,
  };
}
