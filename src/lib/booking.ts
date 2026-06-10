import { formatZipCode, normalizeZipCode } from "@/lib/coverage";
import { getService, type Service } from "@/lib/services";

export const WEB_BOOKING_SERVICE_SLUG = "stad";

export type BookingParams = {
  tjanst: string;
  postnummer: string;
  kommun: string;
};

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

export const cleaningHighlights = [
  "Fast månadspris",
  "Kollektivavtal",
  "Städkit värde 735:- ingår",
];

export const cleaningMethodOptions: {
  value: CleaningBookingPath;
  title: string;
  description: string;
}[] = [
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
];

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

  return {
    ...(tjanst ? { tjanst } : {}),
    ...(postnummer ? { postnummer } : {}),
    ...(kommun ? { kommun } : {}),
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
