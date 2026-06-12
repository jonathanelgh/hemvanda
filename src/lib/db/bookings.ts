import { normalizeZipCode } from "@/lib/coverage";
import { calculateCleaningPrice } from "@/lib/cleaning-pricing";
import {
  formatCleaningPropertyMessage,
  type CleaningBookingPath,
  type CleaningFrequency,
  type CleaningPropertyType,
  type ContactPreference,
  type KeyAccess,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
} from "@/lib/booking";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

type CleaningBookingInput = {
  serviceSlug: string;
  bookingPath: CleaningBookingPath;
  postalCode: string;
  municipality: string;
  squareMeters: number;
  hasPets: PetAnswer;
  frequency: CleaningFrequency;
  tidying: TidyingOption;
  weekdayPreference: WeekdayPreference;
  contactPreference?: ContactPreference;
  keyAccess?: KeyAccess;
  preferredDate?: string;
  preferredTime?: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  message?: string;
  propertyType?: CleaningPropertyType;
};

type ServiceInquiryInput = {
  serviceSlug: string;
  postalCode: string;
  municipality: string;
  name: string;
  phone: string;
  email: string;
  timeframe: string;
  message: string;
};

function toDbTime(time: string) {
  return time.length === 5 ? `${time}:00` : time;
}

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

async function createStatusEvent(bookingId: string, note?: string) {
  const supabase = createAdminClient();

  await supabase.from("booking_status_events").insert({
    booking_id: bookingId,
    status: "submitted",
    note: note ?? "Bokning mottagen via webben.",
  });
}

async function reserveAvailabilitySlot(
  bookingId: string,
  preferredDate: string,
  preferredTime: string,
  serviceSlug: string,
) {
  const supabase = createAdminClient();
  const startTime = toDbTime(preferredTime);

  const { data: slot, error: slotError } = await supabase
    .from("availability_slots")
    .select("id, is_available")
    .eq("slot_date", preferredDate)
    .eq("start_time", startTime)
    .eq("service_slug", serviceSlug)
    .maybeSingle();

  if (slotError) {
    throw new Error("Kunde inte kontrollera lediga tider.");
  }

  if (!slot?.is_available) {
    throw new Error("Den valda tiden är inte längre tillgänglig.");
  }

  const { error: updateError } = await supabase
    .from("availability_slots")
    .update({
      is_available: false,
      booking_id: bookingId,
    })
    .eq("id", slot.id);

  if (updateError) {
    throw new Error("Kunde inte reservera vald tid.");
  }
}

export async function saveCleaningBooking(input: CleaningBookingInput) {
  const supabase = createAdminClient();
  const postalCode = normalizeZipCode(input.postalCode) ?? input.postalCode;
  const bookingType =
    input.bookingPath === "direct" ? "cleaning_direct" : "cleaning_expert";

  const quote = calculateCleaningPrice({
    squareMeters: String(input.squareMeters),
    hasPets: input.hasPets,
    frequency: input.frequency,
    tidying: input.tidying,
    weekdayPreference: input.weekdayPreference,
  });

  await upsertServiceArea(postalCode, input.municipality);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_type: bookingType,
      service_slug: input.serviceSlug,
      contact_name: input.name.trim(),
      contact_phone: input.phone.trim(),
      contact_email: input.email.trim(),
      postal_code: postalCode,
      municipality: input.municipality.trim(),
      street_address: input.address?.trim() ?? null,
      message: formatCleaningPropertyMessage(input.propertyType, input.message),
      source: "web",
      status: "submitted",
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    throw new Error("Kunde inte spara bokningen.");
  }

  const { error: detailsError } = await supabase.from("cleaning_booking_details").insert({
    booking_id: booking.id,
    booking_path: input.bookingPath,
    square_meters: input.squareMeters,
    has_pets: input.hasPets === "ja",
    frequency: input.frequency,
    tidying: input.tidying,
    weekday_preference: input.weekdayPreference,
    contact_preference: input.contactPreference ?? null,
    key_access: input.keyAccess ?? null,
    preferred_date: input.preferredDate ?? null,
    preferred_time: input.preferredTime ?? null,
    quoted_monthly_price_ore: Math.round(quote.total * 100),
    pricing_breakdown: quote as unknown as Json,
  });

  if (detailsError) {
    throw new Error("Kunde inte spara städdetaljer.");
  }

  if (input.bookingPath === "direct" && input.preferredDate && input.preferredTime) {
    await reserveAvailabilitySlot(
      booking.id,
      input.preferredDate,
      input.preferredTime,
      input.serviceSlug,
    );
  }

  await createStatusEvent(booking.id);

  return booking.id;
}

export async function saveServiceInquiry(input: ServiceInquiryInput) {
  const supabase = createAdminClient();
  const postalCode = normalizeZipCode(input.postalCode) ?? input.postalCode;

  await upsertServiceArea(postalCode, input.municipality);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_type: "service_inquiry",
      service_slug: input.serviceSlug,
      contact_name: input.name.trim(),
      contact_phone: input.phone.trim(),
      contact_email: input.email.trim(),
      postal_code: postalCode,
      municipality: input.municipality.trim(),
      message: input.message.trim(),
      source: "web",
      status: "submitted",
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    throw new Error("Kunde inte spara förfrågan.");
  }

  const { error: detailsError } = await supabase.from("service_inquiry_details").insert({
    booking_id: booking.id,
    timeframe: input.timeframe,
  });

  if (detailsError) {
    throw new Error("Kunde inte spara förfrågansdetaljer.");
  }

  await createStatusEvent(booking.id, "Förfrågan mottagen via webben.");

  return booking.id;
}

export async function listAvailableTimes(serviceSlug: string, slotDate: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("availability_slots")
    .select("start_time")
    .eq("service_slug", serviceSlug)
    .eq("slot_date", slotDate)
    .eq("is_available", true)
    .order("start_time");

  if (error) {
    throw new Error("Kunde inte hämta lediga tider.");
  }

  return (data ?? []).map((slot) => slot.start_time.slice(0, 5));
}
