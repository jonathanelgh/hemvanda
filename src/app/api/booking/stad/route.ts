import { isStockholmAreaZip, normalizeZipCode } from "@/lib/coverage";
import {
  cleaningFrequencyPlans,
  contactPreferenceOptions,
  keyAccessOptions,
  usesFixedCleaningPrice,
  WEB_BOOKING_SERVICE_SLUG,
  type CleaningAddons,
  type CleaningBookingPath,
  type CleaningFrequency,
  type CleaningPropertyType,
  type ContactPreference,
  type KeyAccess,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
  type WindowBookingMode,
} from "@/lib/booking";
import { saveCleaningBooking } from "@/lib/db/bookings";
import { saveCleaningLead } from "@/lib/db/leads";
import { isTimeAvailableForBooking } from "@/lib/db/weekly-availability";
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
  addons?: CleaningAddons;
  windowCount?: number;
  windowMode?: WindowBookingMode;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const validFrequencies = [
  ...cleaningFrequencyPlans.map((plan) => plan.value),
  "storstadning",
  "flyttstadning",
  "fonster",
];

const knownPropertyTypes: CleaningPropertyType[] = [
  "hem",
  "flyttstad",
  "fonster",
  "storstad",
  "kontor",
  "ovrigt",
];

function formatAddonsMessage(
  addons?: CleaningAddons,
  windowCount?: number,
  windowMode?: WindowBookingMode,
) {
  const parts: string[] = [];
  if (addons?.oven) parts.push("Ugnsrengöring");
  if (addons?.fridge) parts.push("Kylskåpsrengöring");
  if (addons?.supplies) parts.push("Städredskap");
  if (addons?.balcony) parts.push("Balkong");
  if (windowCount && windowCount > 0) {
    parts.push(
      `Fönster: ${windowCount} st (${windowMode === "abonnemang" ? "abonnemang" : "engångs"})`,
    );
  }
  return parts.length > 0 ? `Tillägg: ${parts.join(", ")}` : null;
}

function validateCleaningInfo(payload: CleaningBookingPayload) {
  const propertyType = parsePropertyType(payload.plats);

  if (propertyType === "fonster") {
    if (!payload.windowCount || payload.windowCount < 1) {
      return "Ange antal fönster.";
    }
  } else if (!payload.squareMeters || payload.squareMeters < 10) {
    return "Ange bostadsyta i kvm.";
  }

  if (payload.hasPets !== "ja" && payload.hasPets !== "nej") {
    return "Ange om du har husdjur hemma.";
  }

  if (!payload.frequency || !validFrequencies.includes(payload.frequency)) {
    return "Välj städfrekvens.";
  }

  if (
    payload.weekdayPreference &&
    payload.weekdayPreference !== "flexibel" &&
    payload.weekdayPreference !== "valj-dag"
  ) {
    return "Välj veckodagspreferens.";
  }

  return null;
}

function parsePropertyType(value?: string) {
  return knownPropertyTypes.includes(value as CleaningPropertyType)
    ? (value as CleaningPropertyType)
    : undefined;
}

export async function POST(request: Request) {
  try {
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

    if (!isStockholmAreaZip(payload.postnummer ?? "")) {
      return Response.json(
        {
          error: "Vi tar för närvarande endast emot bokningar i Stockholm med omnejd.",
        },
        { status: 400 },
      );
    }

    if (!payload.kommun?.trim()) {
      return Response.json({ error: "Ort saknas." }, { status: 400 });
    }

    const propertyType = parsePropertyType(payload.plats);
    const tidying: TidyingOption = "nej";
    const weekdayPreference: WeekdayPreference =
      payload.weekdayPreference ?? "flexibel";
    const addonsMessage = formatAddonsMessage(
      payload.addons,
      payload.windowCount,
      payload.windowMode,
    );
    const combinedMessage = [payload.message?.trim(), addonsMessage]
      .filter(Boolean)
      .join("\n");

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
        const { leadId } = await saveCleaningLead({
          serviceSlug: payload.tjanst,
          postalCode: payload.postnummer!,
          municipality: payload.kommun,
          squareMeters: payload.squareMeters!,
          hasPets: payload.hasPets!,
          frequency: payload.frequency as CleaningFrequency,
          tidying,
          weekdayPreference,
          contactPreference: payload.contactPreference,
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
          message: combinedMessage || undefined,
          propertyType,
          addons: payload.addons,
          windowCount: payload.windowCount,
          windowMode: payload.windowMode,
        });

        return Response.json({
          ok: true,
          leadId,
          message: "Förfrågan är registrerad som lead.",
        });
      } catch (error) {
        return Response.json(
          {
            error: error instanceof Error ? error.message : "Kunde inte spara förfrågan.",
          },
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
      return Response.json(
        { error: "Välj hur vi får åtkomst till nycklar." },
        { status: 400 },
      );
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

    if (!payload.preferredTime?.trim()) {
      return Response.json({ error: "Välj en ledig tid." }, { status: 400 });
    }

    const isAvailable = await isTimeAvailableForBooking(
      payload.tjanst!,
      payload.preferredDate!,
      payload.preferredTime!,
    );

    if (!isAvailable) {
      return Response.json({ error: "Välj en ledig tid." }, { status: 400 });
    }

    if (!usesFixedCleaningPrice(propertyType)) {
      const keyAccessLabel = keyAccessOptions.find(
        (option) => option.value === payload.keyAccess,
      )?.label;

      try {
        const { leadId } = await saveCleaningLead({
          serviceSlug: payload.tjanst,
          postalCode: payload.postnummer!,
          municipality: payload.kommun,
          squareMeters: payload.squareMeters!,
          hasPets: payload.hasPets!,
          frequency: payload.frequency as CleaningFrequency,
          tidying,
          weekdayPreference,
          preferredDate: payload.preferredDate,
          preferredTime: payload.preferredTime,
          keyAccessLabel,
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
          message: combinedMessage || undefined,
          propertyType,
          addons: payload.addons,
          windowCount: payload.windowCount,
          windowMode: payload.windowMode,
        });

        return Response.json({
          ok: true,
          leadId,
          message: "Förfrågan är registrerad.",
        });
      } catch (error) {
        return Response.json(
          {
            error: error instanceof Error ? error.message : "Kunde inte spara förfrågan.",
          },
          { status: 500 },
        );
      }
    }

    try {
      const bookingId = await saveCleaningBooking({
        serviceSlug: payload.tjanst,
        postalCode: payload.postnummer!,
        municipality: payload.kommun,
        squareMeters: payload.squareMeters!,
        hasPets: payload.hasPets!,
        frequency: payload.frequency as CleaningFrequency,
        tidying,
        weekdayPreference,
        keyAccess: payload.keyAccess,
        preferredDate: payload.preferredDate,
        preferredTime: payload.preferredTime,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        message: combinedMessage || undefined,
        propertyType,
        addons: payload.addons,
        windowCount: payload.windowCount,
        windowMode: payload.windowMode,
      });

      return Response.json({
        ok: true,
        bookingId,
        message: "Bokningen är registrerad.",
      });
    } catch (error) {
      return Response.json(
        {
          error: error instanceof Error ? error.message : "Kunde inte spara bokningen.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Något gick fel.",
      },
      { status: 500 },
    );
  }
}
