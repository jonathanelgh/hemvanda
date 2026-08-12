import { formatZipCode, normalizeZipCode } from "@/lib/coverage";
import { BRAND_POSSESSIVE } from "@/lib/brand";
import { getService, type Service } from "@/lib/services";

export const WEB_BOOKING_SERVICE_SLUG = "stad";

export type CleaningPropertyType =
  | "hem"
  | "flyttstad"
  | "fonster"
  | "storstad"
  /** @deprecated Kept for older bookings/admin records */
  | "kontor"
  /** @deprecated Kept for older bookings/admin records */
  | "ovrigt";

export type BookingParams = {
  tjanst: string;
  postnummer: string;
  kommun: string;
  plats?: CleaningPropertyType;
};

export const cleaningPropertyOptions: {
  value: CleaningPropertyType;
  label: string;
  description: string;
}[] = [
  {
    value: "hem",
    label: "Hemstäd",
    description: "Återkommande städning hemma – varje, varannan eller var fjärde vecka.",
  },
  {
    value: "storstad",
    label: "Storstäd",
    description: "Grundlig engångsstädning när hemmet behöver en ordentlig genomgång.",
  },
  {
    value: "flyttstad",
    label: "Flyttstäd",
    description: "Städning inför inflytt eller avflytt, med tydligt pris efter yta.",
  },
  {
    value: "fonster",
    label: "Fönster",
    description: "Fönsterputs engångs eller som abonnemang – du väljer antal fönster.",
  },
];

export type CleaningBookingPath = "direct" | "expert";

export type CleaningFrequency =
  | "varje-vecka"
  | "varannan-vecka"
  | "var-fjarde-vecka"
  | "storstadning"
  | "flyttstadning"
  | "fonster";

export type PetAnswer = "ja" | "nej";
/** @deprecated Undanplockning is no longer offered; always use "nej" for new bookings */
export type TidyingOption = "nej" | "ja-undanplockning";
export type WeekdayPreference = "flexibel" | "valj-dag";
export type ContactPreference = "ring" | "hembesok";
export type KeyAccess = "hemma" | "lamnar-kontor" | "redan-lamnat";
export type WindowBookingMode = "engang" | "abonnemang";

export type CleaningAddons = {
  oven?: boolean;
  fridge?: boolean;
  supplies?: boolean;
  balcony?: boolean;
  windowsIncluded?: boolean;
};

export const contactPreferenceOptions: {
  value: ContactPreference;
  label: string;
  description: string;
}[] = [
  {
    value: "ring",
    label: "Ring mig en bokad tid",
    description:
      "Vi ringer dig på en tid som passar – smidigt och enkelt när du vill boka med personlig hjälp, utan att behöva planera in ett möte hemma.",
  },
  {
    value: "hembesok",
    label: "Boka in ett hembesök",
    description:
      "Vill du ses på plats? Vi kommer hem till dig, lyssnar på dina behov och hjälper dig att hitta den bästa lösningen för just ditt hem.",
  },
];

export type CleaningBookingCopy = {
  methodTitle: string;
  methodDescription: string;
  highlights: string[];
  methodOptions: {
    value: CleaningBookingPath;
    title: string;
    description: string;
  }[];
  directSuccessMessage: string;
  expertSuccessMessage: (kommun: string) => string;
  submitButtonLabel: string;
  squareMetersLabel: string;
  petsLabel: string;
  contactPreferenceOptions: {
    value: ContactPreference;
    label: string;
    description: string;
  }[];
};

const cleaningBookingCopyByPlats: Record<CleaningPropertyType, CleaningBookingCopy> = {
  hem: {
    methodTitle: "Hur vill du boka hemstädning?",
    methodDescription:
      "Boka online med tydligt pris, eller låt oss kontakta dig om du vill få hjälp att välja rätt upplägg.",
    highlights: ["Tydligt pris", "Lokalt i Stockholm", "Material ingår"],
    methodOptions: [
      {
        value: "direct",
        title: "Boka direkt online",
        description: "Ange yta och frekvens, se priset och boka första tillfället.",
      },
      {
        value: "expert",
        title: "Kontakta mig",
        description: "Vi hör av oss och hjälper dig välja rätt städintervall.",
      },
    ],
    directSuccessMessage:
      "Din bokning är registrerad enligt dina val. Vi kommer på vald tid för första städtillfället och skickar en bekräftelse till dig.",
    expertSuccessMessage: (kommun) =>
      `Vi kontaktar dig för att hitta rätt hemstädning i ${kommun}.`,
    submitButtonLabel: "Boka hemstädning",
    squareMetersLabel: "Bostadsyta (kvm)",
    petsLabel: "Har du husdjur hemma?",
    contactPreferenceOptions: contactPreferenceOptions,
  },
  storstad: {
    methodTitle: "Boka storstäd",
    methodDescription:
      "Engångsstädning med fast pris efter yta. Lägg till ugn, kyl eller städredskap vid behov.",
    highlights: ["Fast pris efter yta", "Grundlig genomgång", "Valfria tillägg"],
    methodOptions: [
      {
        value: "direct",
        title: "Boka direkt online",
        description: "Se priset direkt och boka tid för din storstädning.",
      },
    ],
    directSuccessMessage:
      "Din storstädning är bokad. Vi kommer på vald tid och skickar en bekräftelse till dig.",
    expertSuccessMessage: (kommun) =>
      `Vi kontaktar dig om storstädning i ${kommun}.`,
    submitButtonLabel: "Boka storstäd",
    squareMetersLabel: "Bostadsyta (kvm)",
    petsLabel: "Har du husdjur hemma?",
    contactPreferenceOptions: contactPreferenceOptions,
  },
  flyttstad: {
    methodTitle: "Boka flyttstäd",
    methodDescription:
      "Städning inför flytt med pris efter yta. Du kan lägga till balkong vid behov.",
    highlights: ["Fast pris efter yta", "Inför in- eller avflytt", "Valfri balkong"],
    methodOptions: [
      {
        value: "direct",
        title: "Boka direkt online",
        description: "Ange yta, se priset och boka tid för flyttstädningen.",
      },
    ],
    directSuccessMessage:
      "Din flyttstädning är bokad. Vi kommer på vald tid och skickar en bekräftelse till dig.",
    expertSuccessMessage: (kommun) =>
      `Vi kontaktar dig om flyttstädning i ${kommun}.`,
    submitButtonLabel: "Boka flyttstäd",
    squareMetersLabel: "Bostadsyta (kvm)",
    petsLabel: "Har du husdjur hemma?",
    contactPreferenceOptions: contactPreferenceOptions,
  },
  fonster: {
    methodTitle: "Boka fönsterputs",
    methodDescription:
      "Välj engångsputs eller abonnemang och ange hur många fönster som ska putsas.",
    highlights: ["280 kr per fönster", "Engångs eller abonnemang", "Tydligt antal"],
    methodOptions: [
      {
        value: "direct",
        title: "Boka direkt online",
        description: "Ange antal fönster, se priset och boka tid.",
      },
    ],
    directSuccessMessage:
      "Din fönsterputs är bokad. Vi kommer på vald tid och skickar en bekräftelse till dig.",
    expertSuccessMessage: (kommun) =>
      `Vi kontaktar dig om fönsterputs i ${kommun}.`,
    submitButtonLabel: "Boka fönsterputs",
    squareMetersLabel: "Bostadsyta (kvm)",
    petsLabel: "Har du husdjur hemma?",
    contactPreferenceOptions: contactPreferenceOptions,
  },
  kontor: {
    methodTitle: "Hur vill du boka er kontorsstädning?",
    methodDescription:
      "Skicka en förfrågan så återkommer vi med upplägg anpassat efter er lokal.",
    highlights: ["Offert efter behov", "Lokalt i Stockholm", "Anpassat efter verksamheten"],
    methodOptions: [
      {
        value: "direct",
        title: "Skicka förfrågan online",
        description: "Fyll i uppgifter så återkommer vi med pris och förslag.",
      },
      {
        value: "expert",
        title: "Kontakta mig",
        description: "Vi hjälper er att hitta rätt upplägg för kontorsstädning.",
      },
    ],
    directSuccessMessage:
      "Vi har tagit emot er förfrågan och återkommer med pris och tid.",
    expertSuccessMessage: (kommun) =>
      `Vi kontaktar er om kontorsstädning i ${kommun}.`,
    submitButtonLabel: "Skicka förfrågan",
    squareMetersLabel: "Lokalyta (kvm)",
    petsLabel: "Finns husdjur på arbetsplatsen?",
    contactPreferenceOptions: [
      {
        value: "ring",
        label: "Ring mig en bokad tid",
        description: "Vi ringer dig på en tid som passar.",
      },
      {
        value: "hembesok",
        label: "Boka in ett besök",
        description: "Vi kommer till er lokal och går igenom behoven på plats.",
      },
    ],
  },
  ovrigt: {
    methodTitle: "Hur vill du boka din städning?",
    methodDescription:
      "Skicka en förfrågan så återkommer vi med upplägg anpassat efter lokalen.",
    highlights: ["Offert efter behov", "Lokalt i Stockholm", "Skräddarsytt"],
    methodOptions: [
      {
        value: "direct",
        title: "Skicka förfrågan online",
        description: "Fyll i uppgifter så återkommer vi med pris och förslag.",
      },
      {
        value: "expert",
        title: "Kontakta mig",
        description: "Vi hjälper dig att hitta rätt upplägg.",
      },
    ],
    directSuccessMessage:
      "Vi har tagit emot din förfrågan och återkommer med pris och tid.",
    expertSuccessMessage: (kommun) =>
      `Vi kontaktar dig om städning i ${kommun}.`,
    submitButtonLabel: "Skicka förfrågan",
    squareMetersLabel: "Yta (kvm)",
    petsLabel: "Finns husdjur i lokalen?",
    contactPreferenceOptions: [
      {
        value: "ring",
        label: "Ring mig en bokad tid",
        description: "Vi ringer dig på en tid som passar.",
      },
      {
        value: "hembesok",
        label: "Boka in ett besök",
        description: "Vi kommer till lokalen och går igenom behoven på plats.",
      },
    ],
  },
};

export function getCleaningBookingCopy(plats?: CleaningPropertyType): CleaningBookingCopy {
  return cleaningBookingCopyByPlats[plats ?? "hem"];
}

export function isHomeCleaningBooking(plats?: CleaningPropertyType) {
  return !plats || plats === "hem";
}

/** Fixed online price for hemstäd, storstäd, flyttstäd and fönster */
export function usesFixedCleaningPrice(plats?: CleaningPropertyType) {
  return (
    !plats ||
    plats === "hem" ||
    plats === "storstad" ||
    plats === "flyttstad" ||
    plats === "fonster"
  );
}

export function isOneTimeCleaningProperty(plats?: CleaningPropertyType) {
  return plats === "storstad" || plats === "flyttstad" || plats === "fonster";
}

export function defaultFrequencyForProperty(
  plats?: CleaningPropertyType,
): CleaningFrequency {
  if (plats === "storstad") return "storstadning";
  if (plats === "flyttstad") return "flyttstadning";
  if (plats === "fonster") return "fonster";
  return "varannan-vecka";
}

export const cleaningHighlights = cleaningBookingCopyByPlats.hem.highlights;

export const cleaningMethodOptions = cleaningBookingCopyByPlats.hem.methodOptions;

export const cleaningFrequencyPlans: {
  value: CleaningFrequency;
  label: string;
  badge?: string;
  benefits: string[];
  description: string;
}[] = [
  {
    value: "varje-vecka",
    label: "Varje vecka",
    benefits: ["Kontinuerligt rent hem", "Material ingår", "Lägre pris per tillfälle"],
    description: "Passar dig som vill ha hemmet kontinuerligt omhändertaget.",
  },
  {
    value: "varannan-vecka",
    label: "Varannan vecka",
    badge: "Populär",
    benefits: ["Bra balans mellan pris och frekvens", "Material ingår"],
    description: "Ett vanligt val för vardagshemmet – regelbundet utan att bli för tätt.",
  },
  {
    value: "var-fjarde-vecka",
    label: "Var fjärde vecka",
    benefits: ["Material ingår", "Enklare intervall"],
    description: "Längre mellanrum mellan städningarna när behovet är mer sporadiskt.",
  },
];

export const weekdayPreferenceOptions: {
  value: WeekdayPreference;
  label: string;
  description: string;
}[] = [
  {
    value: "flexibel",
    label: "Jag är flexibel",
    description:
      "Vi föreslår den veckodag som ger dig snabbast start – smidigt och enkelt.",
  },
  {
    value: "valj-dag",
    label: "Jag vill välja veckodag",
    description: "Få städning på just den dag som passar dig bäst.",
  },
];

export const keyAccessOptions: { value: KeyAccess; label: string }[] = [
  { value: "hemma", label: "Jag är hemma" },
  {
    value: "lamnar-kontor",
    label:
      `Jag lämnar nycklar på ${BRAND_POSSESSIVE} kontor senast 3 dagar innan första bokade tiden`,
  },
  { value: "redan-lamnat", label: "Jag har redan lämnat nycklar" },
];

export function isWebBookingService(slug: string) {
  return slug === WEB_BOOKING_SERVICE_SLUG;
}

export function buildBookingSearchUrl(params: Partial<BookingParams>) {
  const search = new URLSearchParams();

  if (params.tjanst) {
    search.set("tjanst", params.tjanst);
  }

  if (params.postnummer) {
    search.set("postnummer", params.postnummer);
  }

  if (params.kommun) {
    search.set("kommun", params.kommun);
  }

  if (params.plats) {
    search.set("plats", params.plats);
  }

  const query = search.toString();
  return query ? `/booking?${query}` : "/booking";
}

export function parseBookingSearchParams(
  params: Record<string, string | string[] | undefined>,
): Partial<BookingParams> {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const tjanst = read("tjanst");
  const postnummerRaw = read("postnummer");
  const normalized = normalizeZipCode(postnummerRaw);
  const postnummer = normalized ? formatZipCode(normalized) : postnummerRaw;
  const kommun = read("kommun");
  const platsRaw = read("plats");
  const knownPlats: CleaningPropertyType[] = [
    "hem",
    "flyttstad",
    "fonster",
    "storstad",
    "kontor",
    "ovrigt",
  ];
  const plats = knownPlats.includes(platsRaw as CleaningPropertyType)
    ? (platsRaw as CleaningPropertyType)
    : undefined;

  return {
    ...(tjanst ? { tjanst } : {}),
    ...(postnummer ? { postnummer } : {}),
    ...(kommun ? { kommun } : {}),
    ...(plats ? { plats } : {}),
  };
}

export function resolveBookingContext(params: Partial<BookingParams>) {
  const service = params.tjanst ? getService(params.tjanst) : undefined;
  const isComplete = Boolean(
    service && params.postnummer && params.kommun && normalizeZipCode(params.postnummer),
  );

  return {
    service,
    postnummer: params.postnummer ?? "",
    kommun: params.kommun ?? "",
    plats: params.plats,
    isComplete,
    bookingMode: service
      ? isWebBookingService(service.slug)
        ? ("web" as const)
        : ("inquiry" as const)
      : null,
  };
}

export function bookingLocationLabel(postnummer: string, kommun: string) {
  if (postnummer && kommun) return `${postnummer} ${kommun}`;
  if (postnummer) return postnummer;
  return kommun;
}

export function serviceDisplayName(service: Service) {
  return service.accent || service.title;
}

export function cleaningPropertyLabel(value?: CleaningPropertyType) {
  return cleaningPropertyOptions.find((option) => option.value === value)?.label;
}

export function formatCleaningPropertyMessage(
  plats: CleaningPropertyType | undefined,
  message?: string,
) {
  const label = cleaningPropertyLabel(plats);
  const prefix = label ? `Platstyp: ${label}` : "";
  const trimmedMessage = message?.trim();

  if (!prefix) return trimmedMessage || null;
  if (!trimmedMessage) return prefix;
  return `${prefix}\n\n${trimmedMessage}`;
}

export function formatCleaningLeadScheduleMessage(input: {
  preferredDate?: string;
  preferredTime?: string;
  keyAccessLabel?: string;
}) {
  const lines: string[] = [];

  if (input.preferredDate && input.preferredTime) {
    lines.push(`Önskad start: ${input.preferredDate} kl ${input.preferredTime}`);
  }

  if (input.keyAccessLabel) {
    lines.push(`Nyckelåtkomst: ${input.keyAccessLabel}`);
  }

  return lines.length > 0 ? lines.join("\n") : null;
}
