import { normalizeZipCode } from "@/lib/coverage";
import { calculateCleaningPrice, MAX_CLEANING_SQM, MIN_CLEANING_SQM } from "@/lib/cleaning-pricing";
import {
  formatCleaningPropertyMessage,
  type CleaningAddons,
  type CleaningFrequency,
  type CleaningPropertyType,
  type KeyAccess,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
  type WindowBookingMode,
} from "@/lib/booking";
import { ensureCustomerAccount } from "@/lib/auth/customer-account";
import { generateCleaningVisits } from "@/lib/db/cleaning-visits";
import type { AdminScheduleBookingInput } from "@/lib/admin/schedule-booking";
import {
  isCleaningServiceSlug,
  usesCalculatedCleaningPrice,
} from "@/lib/admin/schedule-booking";
import {
  notifyCleaningBookingCreated,
  notifyServiceBookingCreated,
  notifyStaffAssignedToVisit,
} from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAvailableTimesForDate,
} from "@/lib/db/weekly-availability";
import type { Json } from "@/lib/supabase/database.types";

type CleaningBookingInput = {
  serviceSlug: string;
  postalCode: string;
  municipality: string;
  squareMeters: number;
  hasPets: PetAnswer;
  frequency: CleaningFrequency;
  tidying: TidyingOption;
  weekdayPreference: WeekdayPreference;
  keyAccess?: KeyAccess;
  preferredDate?: string;
  preferredTime?: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  message?: string;
  propertyType?: CleaningPropertyType;
  sourceLeadId?: string;
  addons?: CleaningAddons;
  windowCount?: number;
  windowMode?: WindowBookingMode;
};

async function upsertServiceArea(postalCode: string, municipality: string) {
  const supabase = createAdminClient();

  await supabase.from("service_areas").upsert(
    {
      postal_code: postalCode,
      municipality,
      is_active: true,
      last_verified_at: new Date().toISOString(),
    },
    { onConflict: "postal_code" },
  );
}

async function linkBookingToCustomer(
  bookingId: string,
  input: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    postalCode?: string;
    municipality?: string;
  },
) {
  try {
    const account = await ensureCustomerAccount(input);

    if (!account) {
      console.error(
        "linkBookingToCustomer: no customer account created for",
        input.email,
      );
      return;
    }

    const supabase = createAdminClient();
    await supabase
      .from("bookings")
      .update({ profile_id: account.userId })
      .eq("id", bookingId);
  } catch (error) {
    console.error("linkBookingToCustomer failed:", error);
  }
}

async function createStatusEvent(bookingId: string, note?: string) {
  const supabase = createAdminClient();

  await supabase.from("booking_status_events").insert({
    booking_id: bookingId,
    status: "submitted",
    note: note ?? "Bokning mottagen via webben.",
  });
}

export async function saveCleaningBooking(input: CleaningBookingInput) {
  const supabase = createAdminClient();
  const postalCode = normalizeZipCode(input.postalCode) ?? input.postalCode;

  const quote = calculateCleaningPrice({
    squareMeters: String(input.squareMeters),
    hasPets: input.hasPets,
    frequency: input.frequency,
    tidying: input.tidying,
    weekdayPreference: input.weekdayPreference,
    propertyType: input.propertyType,
    addons: input.addons,
    windowCount: input.windowCount,
    windowMode: input.windowMode,
  });

  await upsertServiceArea(postalCode, input.municipality);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_type: "cleaning_direct",
      service_slug: input.serviceSlug,
      contact_name: input.name.trim(),
      contact_phone: input.phone.trim(),
      contact_email: input.email.trim(),
      postal_code: postalCode,
      municipality: input.municipality.trim(),
      street_address: input.address?.trim() ?? null,
      message: formatCleaningPropertyMessage(input.propertyType, input.message),
      source: input.sourceLeadId ? "lead_conversion" : "web",
      status: "submitted",
      source_lead_id: input.sourceLeadId ?? null,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    throw new Error("Kunde inte spara bokningen.");
  }

  const { error: detailsError } = await supabase.from("cleaning_booking_details").insert({
    booking_id: booking.id,
    booking_path: "direct",
    square_meters: input.squareMeters,
    has_pets: input.hasPets === "ja",
    frequency: input.frequency,
    tidying: input.tidying,
    weekday_preference: input.weekdayPreference,
    contact_preference: null,
    key_access: input.keyAccess ?? null,
    preferred_date: input.preferredDate ?? null,
    preferred_time: input.preferredTime ?? null,
    quoted_monthly_price_ore: Math.round(quote.total * 100),
    pricing_breakdown: quote as unknown as Json,
  });

  if (detailsError) {
    throw new Error("Kunde inte spara städdetaljer.");
  }

  if (input.preferredDate && input.preferredTime) {
    await generateCleaningVisits({
      bookingId: booking.id,
      frequency: input.frequency,
      startDate: input.preferredDate,
      startTime: input.preferredTime,
    });
  }

  await createStatusEvent(booking.id);

  await linkBookingToCustomer(booking.id, {
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    postalCode,
    municipality: input.municipality,
  });

  await notifyCleaningBookingCreated({
    bookingId: booking.id,
    serviceSlug: input.serviceSlug,
    name: input.name,
    email: input.email,
    phone: input.phone,
    postalCode,
    municipality: input.municipality,
    address: input.address,
    squareMeters: input.squareMeters,
    frequency: input.frequency,
    propertyType: input.propertyType,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    priceKr: quote.total,
  });

  return booking.id;
}

function toDbTime(time: string) {
  return time.length === 5 ? `${time}:00` : time;
}

async function insertSingleScheduleVisit(
  bookingId: string,
  input: {
    visitDate: string;
    visitTime: string;
    staffId?: string | null;
    note?: string | null;
    durationMinutes?: number;
  },
) {
  const supabase = createAdminClient();

  const { data: visit, error } = await supabase
    .from("cleaning_visits")
    .insert({
      booking_id: bookingId,
      visit_date: input.visitDate,
      visit_time: toDbTime(input.visitTime),
      sequence_number: 1,
      status: "scheduled",
      staff_id: input.staffId ?? null,
      note: input.note?.trim() || null,
      duration_minutes: input.durationMinutes ?? 120,
    })
    .select("id")
    .single();

  if (error || !visit) {
    throw new Error("Kunde inte skapa schemalagt besök.");
  }

  if (input.staffId) {
    await notifyStaffAssignedToVisit(visit.id);
  }

  return visit.id;
}

async function updateFirstCleaningVisit(
  bookingId: string,
  input: {
    visitDate: string;
    visitTime: string;
    staffId?: string | null;
    note?: string | null;
    durationMinutes?: number;
  },
) {
  const supabase = createAdminClient();
  const visitTime = toDbTime(input.visitTime);
  const visitUpdate: {
    staff_id?: string | null;
    note?: string | null;
    duration_minutes?: number;
  } = {};

  if (input.staffId) {
    visitUpdate.staff_id = input.staffId;
  }

  if (input.note?.trim()) {
    visitUpdate.note = input.note.trim();
  }

  if (input.durationMinutes) {
    visitUpdate.duration_minutes = input.durationMinutes;
  }

  if (Object.keys(visitUpdate).length === 0) {
    return;
  }

  const { data: visit } = await supabase
    .from("cleaning_visits")
    .update(visitUpdate)
    .eq("booking_id", bookingId)
    .eq("visit_date", input.visitDate)
    .eq("visit_time", visitTime)
    .select("id")
    .maybeSingle();

  if (visit?.id && input.staffId) {
    await notifyStaffAssignedToVisit(visit.id);
  }
}

async function linkBookingProfile(
  bookingId: string,
  input: AdminScheduleBookingInput,
  postalCode: string,
) {
  if (input.profileId) {
    return;
  }

  await linkBookingToCustomer(bookingId, {
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    postalCode,
    municipality: input.municipality,
  });
}

export async function saveAdminScheduleBooking(input: AdminScheduleBookingInput) {
  if (isCleaningServiceSlug(input.serviceSlug)) {
    return saveAdminCleaningScheduleBooking(input);
  }

  return saveAdminServiceScheduleBooking(input);
}

async function saveAdminCleaningScheduleBooking(input: AdminScheduleBookingInput) {
  const supabase = createAdminClient();
  const postalCode = normalizeZipCode(input.postalCode) ?? input.postalCode;
  const propertyType = input.cleaningPropertyType ?? "hem";
  const usesCalculatedPrice = usesCalculatedCleaningPrice(
    input.serviceSlug,
    propertyType,
  );

  if (
    !input.squareMeters ||
    input.squareMeters < MIN_CLEANING_SQM ||
    input.squareMeters > MAX_CLEANING_SQM
  ) {
    throw new Error(
      `Ange en giltig yta (${MIN_CLEANING_SQM}–${MAX_CLEANING_SQM} kvm).`,
    );
  }

  if (!input.hasPets || !input.frequency || !input.tidying) {
    throw new Error("Fyll i alla städuppgifter.");
  }

  if (!usesCalculatedPrice) {
    if (!input.pricingMode) {
      throw new Error("Välj prisupplägg.");
    }

    if (input.pricingMode === "fixed" && (!input.fixedPriceKr || input.fixedPriceKr <= 0)) {
      throw new Error("Ange ett fast pris.");
    }
  }

  const quote = usesCalculatedPrice
    ? calculateCleaningPrice({
        squareMeters: String(input.squareMeters),
        hasPets: input.hasPets,
        frequency: input.frequency,
        tidying: input.tidying,
        weekdayPreference: "valj-dag",
      })
    : null;

  await upsertServiceArea(postalCode, input.municipality);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_type: "cleaning_direct",
      service_slug: input.serviceSlug,
      contact_name: input.name.trim(),
      contact_phone: input.phone.trim(),
      contact_email: input.email.trim(),
      postal_code: postalCode,
      municipality: input.municipality.trim(),
      street_address: input.address?.trim() ?? null,
      message: formatCleaningPropertyMessage(propertyType, input.message),
      source: "admin",
      status: "confirmed",
      profile_id: input.profileId ?? null,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    throw new Error("Kunde inte spara bokningen.");
  }

  const { error: detailsError } = await supabase.from("cleaning_booking_details").insert({
    booking_id: booking.id,
    booking_path: "direct",
    square_meters: input.squareMeters,
    has_pets: input.hasPets === "ja",
    frequency: input.frequency,
    tidying: input.tidying,
    weekday_preference: "valj-dag",
    contact_preference: null,
    key_access: input.keyAccess ?? "hemma",
    preferred_date: input.visitDate,
    preferred_time: toDbTime(input.visitTime),
    quoted_monthly_price_ore: quote ? Math.round(quote.total * 100) : null,
    pricing_breakdown: quote ? (quote as unknown as Json) : null,
    admin_pricing_mode: usesCalculatedPrice ? "fixed" : input.pricingMode ?? null,
    admin_fixed_price_ore:
      !usesCalculatedPrice && input.pricingMode === "fixed" && input.fixedPriceKr
        ? Math.round(input.fixedPriceKr * 100)
        : null,
  });

  if (detailsError) {
    console.error("cleaning_booking_details insert failed:", detailsError);
    throw new Error("Kunde inte spara städdetaljer.");
  }

  if (usesCalculatedPrice && input.frequency) {
    await generateCleaningVisits({
      bookingId: booking.id,
      frequency: input.frequency,
      startDate: input.visitDate,
      startTime: input.visitTime,
    });

    await updateFirstCleaningVisit(booking.id, input);
  } else {
    await insertSingleScheduleVisit(booking.id, input);
  }

  await supabase.from("booking_status_events").insert({
    booking_id: booking.id,
    status: "confirmed",
    note: "Städbokning skapad från schema.",
  });

  await linkBookingProfile(booking.id, input, postalCode);

  const priceKr =
    quote?.total ??
    (input.pricingMode === "fixed" && input.fixedPriceKr ? input.fixedPriceKr : null);

  await notifyCleaningBookingCreated({
    bookingId: booking.id,
    serviceSlug: input.serviceSlug,
    name: input.name,
    email: input.email,
    phone: input.phone,
    postalCode,
    municipality: input.municipality,
    address: input.address,
    squareMeters: input.squareMeters,
    frequency: input.frequency!,
    propertyType,
    preferredDate: input.visitDate,
    preferredTime: input.visitTime,
    priceKr,
    isConfirmed: true,
  });

  return booking.id;
}

async function saveAdminServiceScheduleBooking(input: AdminScheduleBookingInput) {
  const supabase = createAdminClient();
  const postalCode = normalizeZipCode(input.postalCode) ?? input.postalCode;

  if (!input.message?.trim()) {
    throw new Error("Beskriv uppdraget.");
  }

  if (!input.pricingMode) {
    throw new Error("Välj prisupplägg.");
  }

  if (input.pricingMode === "fixed" && (!input.fixedPriceKr || input.fixedPriceKr <= 0)) {
    throw new Error("Ange ett fast pris.");
  }

  await upsertServiceArea(postalCode, input.municipality);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_type: "service_booking",
      service_slug: input.serviceSlug,
      contact_name: input.name.trim(),
      contact_phone: input.phone.trim(),
      contact_email: input.email.trim(),
      postal_code: postalCode,
      municipality: input.municipality.trim(),
      street_address: input.address?.trim() ?? null,
      message: input.message.trim(),
      source: "admin",
      status: "confirmed",
      profile_id: input.profileId ?? null,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    throw new Error("Kunde inte spara bokningen.");
  }

  const { error: detailsError } = await supabase.from("service_inquiry_details").insert({
    booking_id: booking.id,
    timeframe: input.timeframe ?? "flexibel",
    admin_pricing_mode: input.pricingMode,
    admin_fixed_price_ore:
      input.pricingMode === "fixed" && input.fixedPriceKr
        ? Math.round(input.fixedPriceKr * 100)
        : null,
  });

  if (detailsError) {
    throw new Error("Kunde inte spara tjänstedetaljer.");
  }

  await insertSingleScheduleVisit(booking.id, input);

  await supabase.from("booking_status_events").insert({
    booking_id: booking.id,
    status: "confirmed",
    note: "Tjänstebokning skapad från schema.",
  });

  await linkBookingProfile(booking.id, input, postalCode);

  const priceKr =
    input.pricingMode === "fixed" && input.fixedPriceKr ? input.fixedPriceKr : null;

  await notifyServiceBookingCreated({
    bookingId: booking.id,
    serviceSlug: input.serviceSlug,
    name: input.name,
    email: input.email,
    phone: input.phone,
    postalCode,
    municipality: input.municipality,
    address: input.address,
    message: input.message.trim(),
    visitDate: input.visitDate,
    visitTime: input.visitTime,
    priceKr,
  });

  return booking.id;
}

export async function listAvailableTimes(serviceSlug: string, slotDate: string) {
  return getAvailableTimesForDate(serviceSlug, slotDate);
}
