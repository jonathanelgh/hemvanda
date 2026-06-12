import { formatZipCode, normalizeZipCode } from "@/lib/coverage";
import { getService, type Service } from "@/lib/services";

export const WEB_BOOKING_SERVICE_SLUG = "stad";

export type CleaningPropertyType = "hem" | "kontor" | "ovrigt";

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
    label: "Hem",
    description: "Städning i bostad, villa eller lägenhet.",
  },
  {
    value: "kontor",
    label: "Kontor",
    description: "Städning på arbetsplats eller i kontorslokal.",
  },
  {
    value: "ovrigt",
    label: "Övrigt",
    description: "Till exempel butik, föreningslokal eller annan yta.",
  },
];

export type CleaningBookingPath = "direct" | "expert";

export type CleaningFrequency =
  | "varje-vecka"
  | "varannan-vecka"
  | "var-fjarde-vecka"
  | "storstadning";

export type PetAnswer = "ja" | "nej";
export type TidyingOption = "nej" | "ja-undanplockning";
export type WeekdayPreference = "flexibel" | "valj-dag";
export type ContactPreference = "ring" | "hembesok";
export type KeyAccess = "hemma" | "lamnar-kontor" | "redan-lamnat";

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
  tidyingDescription: string;
  contactPreferenceOptions: {
    value: ContactPreference;
    label: string;
    description: string;
  }[];
};

const cleaningBookingCopyByPlats: Record<CleaningPropertyType, CleaningBookingCopy> = {
  hem: {
    methodTitle: "Hur vill du boka din hemstädning?",
    methodDescription:
      "Välj om du vill boka direkt eller prata med en av våra experter. Behöver du mer information? Läs mer om våra abonnemang, momentlistor och svar på vanliga frågor.",
    highlights: ["Fast månadspris", "Kollektivavtal", "Städkit värde 735:- ingår"],
    methodOptions: [
      {
        value: "direct",
        title: "Boka direkt online",
        description:
          "Fyll i dina uppgifter och boka vår hemstädning med bara några få klick.",
      },
      {
        value: "expert",
        title: "Kontakta mig",
        description:
          "Låt en av våra experter hjälpa dig att hitta rätt upplägg för din hemstädning.",
      },
    ],
    directSuccessMessage:
      "Vi bekräftar din hemstädning och återkommer med exakt tid och pris baserat på dina uppgifter.",
    expertSuccessMessage: (kommun) =>
      `En av våra experter kontaktar dig för att hitta rätt upplägg för din hemstädning i ${kommun}.`,
    submitButtonLabel: "Boka hemstädning",
    squareMetersLabel: "Bostadsyta (kvm)",
    petsLabel: "Har du husdjur hemma?",
    tidyingDescription:
      "När du bokar undanplockning slipper du förbereda hemmet själv. Vi börjar med att plocka undan, så att vi därefter kan fokusera fullt ut på städningen av ditt hem.",
    contactPreferenceOptions: contactPreferenceOptions,
  },
  kontor: {
    methodTitle: "Hur vill du boka er kontorsstädning?",
    methodDescription:
      "Välj om du vill boka direkt eller prata med en av våra experter. Behöver du mer information? Läs mer om våra abonnemang, städmoment och svar på vanliga frågor för kontor.",
    highlights: [
      "Fast månadspris",
      "Kollektivavtal",
      "Anpassat efter er verksamhet",
    ],
    methodOptions: [
      {
        value: "direct",
        title: "Boka direkt online",
        description:
          "Fyll i era uppgifter och boka kontorsstädning med bara några få klick.",
      },
      {
        value: "expert",
        title: "Kontakta mig",
        description:
          "Låt en av våra experter hjälpa er att hitta rätt upplägg för er kontorsstädning.",
      },
    ],
    directSuccessMessage:
      "Vi bekräftar er kontorsstädning och återkommer med exakt tid och pris baserat på era uppgifter.",
    expertSuccessMessage: (kommun) =>
      `En av våra experter kontaktar er för att hitta rätt upplägg för er kontorsstädning i ${kommun}.`,
    submitButtonLabel: "Boka kontorsstädning",
    squareMetersLabel: "Lokalyta (kvm)",
    petsLabel: "Finns husdjur på arbetsplatsen?",
    tidyingDescription:
      "När ni bokar undanplockning slipper ni förbereda lokalen själva. Vi börjar med att plocka undan, så att vi därefter kan fokusera fullt ut på städningen av er lokal.",
    contactPreferenceOptions: [
      {
        value: "ring",
        label: "Ring mig en bokad tid",
        description:
          "Vi ringer dig på en tid som passar – smidigt och enkelt när du vill boka med personlig hjälp, utan att behöva planera in ett besök på plats.",
      },
      {
        value: "hembesok",
        label: "Boka in ett besök",
        description:
          "Vill du ses på plats? Vi kommer till er lokal, lyssnar på era behov och hjälper er att hitta den bästa lösningen för just er verksamhet.",
      },
    ],
  },
  ovrigt: {
    methodTitle: "Hur vill du boka din städning?",
    methodDescription:
      "Välj om du vill boka direkt eller prata med en av våra experter. Behöver du mer information? Läs mer om våra abonnemang, momentlistor och svar på vanliga frågor.",
    highlights: ["Fast månadspris", "Kollektivavtal", "Skräddarsytt efter er lokal"],
    methodOptions: [
      {
        value: "direct",
        title: "Boka direkt online",
        description:
          "Fyll i dina uppgifter och boka städning med bara några få klick.",
      },
      {
        value: "expert",
        title: "Kontakta mig",
        description:
          "Låt en av våra experter hjälpa dig att hitta rätt upplägg för din städning.",
      },
    ],
    directSuccessMessage:
      "Vi bekräftar din städning och återkommer med exakt tid och pris baserat på dina uppgifter.",
    expertSuccessMessage: (kommun) =>
      `En av våra experter kontaktar dig för att hitta rätt upplägg för din städning i ${kommun}.`,
    submitButtonLabel: "Boka städning",
    squareMetersLabel: "Yta (kvm)",
    petsLabel: "Finns husdjur i lokalen?",
    tidyingDescription:
      "När du bokar undanplockning slipper du förbereda lokalen själv. Vi börjar med att plocka undan, så att vi därefter kan fokusera fullt ut på städningen.",
    contactPreferenceOptions: [
      {
        value: "ring",
        label: "Ring mig en bokad tid",
        description:
          "Vi ringer dig på en tid som passar – smidigt och enkelt när du vill boka med personlig hjälp, utan att behöva planera in ett besök på plats.",
      },
      {
        value: "hembesok",
        label: "Boka in ett besök",
        description:
          "Vill du ses på plats? Vi kommer till lokalen, lyssnar på dina behov och hjälper dig att hitta den bästa lösningen.",
      },
    ],
  },
};

export function getCleaningBookingCopy(plats?: CleaningPropertyType): CleaningBookingCopy {
  return cleaningBookingCopyByPlats[plats ?? "hem"];
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
    benefits: [
      "Samma städare varje gång",
      "Städmedel ingår (värde 735 kr)",
      "Veckoanpassade moment",
      "Spara upp till 25 % per städning",
    ],
    description:
      "Vår mest bekväma lösning som låter dig släppa städningen helt.",
  },
  {
    value: "varannan-vecka",
    label: "Varannan vecka",
    badge: "Mest populär",
    benefits: [
      "Samma städare varje gång",
      "Städmedel ingår (värde 735 kr)",
      "Spara upp till 20 % per städning",
    ],
    description:
      "Vår mest populära lösning – smidig, prisvärd och favoriten bland våra kunder.",
  },
  {
    value: "var-fjarde-vecka",
    label: "Var fjärde vecka",
    benefits: ["Städmedel ingår (värde 735 kr)"],
    description:
      "En enklare lösning med längre mellanrum mellan städningarna.",
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
      "Jag lämnar nycklar på hemvandas kontor senast 3 dagar innan första bokade tiden",
  },
  { value: "redan-lamnat", label: "Jag har redan lämnat nycklar" },
];

export function isWebBookingService(slug: string) {
  return slug === WEB_BOOKING_SERVICE_SLUG;
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
  const plats = cleaningPropertyOptions.some((option) => option.value === platsRaw)
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
