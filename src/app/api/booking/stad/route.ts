import { normalizeZipCode } from "@/lib/coverage";
import {
  cleaningFrequencyPlans,
  contactPreferenceOptions,
  keyAccessOptions,
  WEB_BOOKING_SERVICE_SLUG,
  cleaningPropertyOptions,
  type CleaningBookingPath,
  type CleaningFrequency,
  type CleaningPropertyType,
  type ContactPreference,
  type KeyAccess,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
} from "@/lib/booking";
import { saveCleaningBooking } from "@/lib/db/bookings";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CleaningBookingPayload = {
  tjanst?: string;
  postnummer?: string;
  kommun?: string;
  plats?: CleaningPropertyType;
  bookingPath?: CleaningBookingPath;
  squareMeters?: number;
  hasPets?: PetAnswer;
  frequency?: string;
  tidying?: TidyingOption;
  weekdayPreference?: WeekdayPreference;
  contactPreference?: ContactPreference;
  keyAccess?: KeyAccess;
  preferredDate?: string;
  preferredTime?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  message?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const validFrequencies = [
  ...cleaningFrequencyPlans.map((plan) => plan.value),
  "storstadning",
];

function validateCleaningInfo(payload: CleaningBookingPayload) {
  if (!payload.squareMeters || payload.squareMeters < 10) {
    return "Ange bostadsyta i kvm.";
  }

  if (payload.hasPets !== "ja" && payload.hasPets !== "nej") {
    return "Ange om du har husdjur hemma.";
  }

  if (!payload.frequency || !validFrequencies.includes(payload.frequency)) {
    return "Välj städfrekvens.";
  }

  if (payload.tidying !== "nej" && payload.tidying !== "ja-undanplockning") {
    return "Ogiltigt val för undanplockning.";
  }

  if (
    payload.weekdayPreference !== "flexibel" &&
    payload.weekdayPreference !== "valj-dag"
  ) {
    return "Välj veckodagspreferens.";
  }

  return null;
}

function parsePropertyType(value?: string) {
  return cleaningPropertyOptions.some((option) => option.value === value)
    ? (value as CleaningPropertyType)
    : undefined;
}

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return Response.json(
      { error: "Databasen är inte konfigurerad. Lägg till SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  let payload: CleaningBookingPayload;

  try {
    payload = (await request.json()) as CleaningBookingPayload;
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  if (payload.tjanst !== WEB_BOOKING_SERVICE_SLUG) {
    return Response.json({ error: "Fel tjänst för webbbokning." }, { status: 400 });
  }

  if (!normalizeZipCode(payload.postnummer ?? "")) {
    return Response.json({ error: "Ogiltigt postnummer." }, { status: 400 });
  }

  if (!payload.kommun?.trim()) {
    return Response.json({ error: "Ort saknas." }, { status: 400 });
  }

  const propertyType = parsePropertyType(payload.plats);

  if (!payload.name?.trim() || !payload.phone?.trim() || !payload.email?.trim()) {
    return Response.json({ error: "Kontaktuppgifter saknas." }, { status: 400 });
  }

  if (!isValidEmail(payload.email.trim())) {
    return Response.json({ error: "Ogiltig e-postadress." }, { status: 400 });
  }

  if (payload.bookingPath === "expert") {
    const cleaningError = validateCleaningInfo(payload);
    if (cleaningError) {
      return Response.json({ error: cleaningError }, { status: 400 });
    }

    const validContactPreference = contactPreferenceOptions.some(
      (option) => option.value === payload.contactPreference,
    );

    if (!validContactPreference) {
      return Response.json({ error: "Välj hur du vill bli kontaktad." }, { status: 400 });
    }

    if (!payload.address?.trim()) {
      return Response.json({ error: "Adress saknas." }, { status: 400 });
    }

    try {
      const bookingId = await saveCleaningBooking({
        serviceSlug: payload.tjanst,
        bookingPath: "expert",
        postalCode: payload.postnummer!,
        municipality: payload.kommun,
        squareMeters: payload.squareMeters!,
        hasPets: payload.hasPets!,
        frequency: payload.frequency as CleaningFrequency,
        tidying: payload.tidying!,
        weekdayPreference: payload.weekdayPreference!,
        contactPreference: payload.contactPreference,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        message: payload.message,
        propertyType,
      });

      return Response.json({
        ok: true,
        bookingId,
        message: "Förfrågan är registrerad.",
      });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Kunde inte spara förfrågan." },
        { status: 500 },
      );
    }
  }

  if (payload.bookingPath !== "direct") {
    return Response.json({ error: "Ogiltigt bokningssätt." }, { status: 400 });
  }

  const cleaningError = validateCleaningInfo(payload);
  if (cleaningError) {
    return Response.json({ error: cleaningError }, { status: 400 });
  }

  if (!payload.address?.trim()) {
    return Response.json({ error: "Adress saknas." }, { status: 400 });
  }

  const validKeyAccess = keyAccessOptions.some(
    (option) => option.value === payload.keyAccess,
  );

  if (!validKeyAccess) {
    return Response.json({ error: "Välj hur vi får åtkomst till nycklar." }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.preferredDate ?? "")) {
    return Response.json({ error: "Välj ett giltigt datum." }, { status: 400 });
  }

  const preferredDate = new Date(`${payload.preferredDate}T12:00:00`);
  if (Number.isNaN(preferredDate.getTime())) {
    return Response.json({ error: "Välj ett giltigt datum." }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  preferredDate.setHours(0, 0, 0, 0);
  if (preferredDate < today) {
    return Response.json({ error: "Välj ett datum i framtiden." }, { status: 400 });
  }

  if (!["08:00", "13:00"].includes(payload.preferredTime ?? "")) {
    return Response.json({ error: "Välj en ledig tid." }, { status: 400 });
  }

  try {
    const bookingId = await saveCleaningBooking({
      serviceSlug: payload.tjanst,
      bookingPath: "direct",
      postalCode: payload.postnummer!,
      municipality: payload.kommun,
      squareMeters: payload.squareMeters!,
      hasPets: payload.hasPets!,
      frequency: payload.frequency as CleaningFrequency,
      tidying: payload.tidying!,
      weekdayPreference: payload.weekdayPreference!,
      keyAccess: payload.keyAccess,
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      propertyType,
    });

    return Response.json({
      ok: true,
      bookingId,
      message: "Bokningen är registrerad.",
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Kunde inte slutföra bokningen." },
      { status: 500 },
    );
  }
}
