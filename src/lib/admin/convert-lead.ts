import {
  type CleaningFrequency,
  type KeyAccess,
  WEB_BOOKING_SERVICE_SLUG,
} from "@/lib/booking";
import { ensureCustomerAccount } from "@/lib/auth/customer-account";
import { saveCleaningBooking } from "@/lib/db/bookings";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTimeAvailableForBooking } from "@/lib/db/weekly-availability";

export type LeadRecord = {
  id: string;
  leadType: "cleaning_expert" | "service_inquiry";
  serviceSlug: string;
  status: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  postalCode: string;
  municipality: string;
  streetAddress: string | null;
  message: string | null;
  convertedBookingId: string | null;
  createdAt: string;
  cleaningDetails: {
    squareMeters: number;
    hasPets: boolean;
    frequency: CleaningFrequency;
    tidying: string;
    weekdayPreference: string;
    contactPreference: string | null;
    propertyType: string | null;
  } | null;
  serviceDetails: {
    timeframe: string;
  } | null;
};

export async function getLeadById(leadId: string): Promise<LeadRecord | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      id,
      lead_type,
      service_slug,
      status,
      contact_name,
      contact_phone,
      contact_email,
      postal_code,
      municipality,
      street_address,
      message,
      converted_booking_id,
      created_at,
      cleaning_lead_details (
        square_meters,
        has_pets,
        frequency,
        tidying,
        weekday_preference,
        contact_preference,
        property_type
      ),
      service_lead_details (
        timeframe
      )
    `,
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const cleaningDetails = Array.isArray(data.cleaning_lead_details)
    ? data.cleaning_lead_details[0]
    : data.cleaning_lead_details;
  const serviceDetails = Array.isArray(data.service_lead_details)
    ? data.service_lead_details[0]
    : data.service_lead_details;

  return {
    id: data.id,
    leadType: data.lead_type,
    serviceSlug: data.service_slug,
    status: data.status,
    contactName: data.contact_name,
    contactPhone: data.contact_phone,
    contactEmail: data.contact_email,
    postalCode: data.postal_code,
    municipality: data.municipality,
    streetAddress: data.street_address,
    message: data.message,
    convertedBookingId: data.converted_booking_id,
    createdAt: data.created_at,
    cleaningDetails: cleaningDetails
      ? {
          squareMeters: cleaningDetails.square_meters,
          hasPets: cleaningDetails.has_pets,
          frequency: cleaningDetails.frequency as CleaningFrequency,
          tidying: cleaningDetails.tidying,
          weekdayPreference: cleaningDetails.weekday_preference,
          contactPreference: cleaningDetails.contact_preference,
          propertyType: cleaningDetails.property_type,
        }
      : null,
    serviceDetails: serviceDetails
      ? {
          timeframe: serviceDetails.timeframe,
        }
      : null,
  };
}

type ConvertCleaningLeadInput = {
  leadId: string;
  preferredDate: string;
  preferredTime: string;
  keyAccess: KeyAccess;
};

type ConvertServiceLeadInput = {
  leadId: string;
  note?: string;
};

async function markLeadConverted(leadId: string, bookingId: string) {
  const supabase = createAdminClient();

  const { error: leadError } = await supabase
    .from("leads")
    .update({
      status: "converted",
      converted_booking_id: bookingId,
    })
    .eq("id", leadId);

  if (leadError) {
    throw new Error("Kunde inte uppdatera leaden.");
  }

  const { error: bookingError } = await supabase
    .from("bookings")
    .update({ source_lead_id: leadId })
    .eq("id", bookingId);

  if (bookingError) {
    throw new Error("Kunde inte koppla bokningen till leaden.");
  }
}

export async function convertCleaningLeadToBooking(input: ConvertCleaningLeadInput) {
  const lead = await getLeadById(input.leadId);

  if (!lead) {
    throw new Error("Leaden hittades inte.");
  }

  if (lead.status === "converted" || lead.convertedBookingId) {
    throw new Error("Leaden är redan omvandlad till en bokning.");
  }

  if (lead.leadType !== "cleaning_expert" || !lead.cleaningDetails) {
    throw new Error("Leaden innehåller inte städuppgifter.");
  }

  if (lead.serviceSlug !== WEB_BOOKING_SERVICE_SLUG) {
    throw new Error("Städbokning kan bara skapas från städleads.");
  }

  const isAvailable = await isTimeAvailableForBooking(
    lead.serviceSlug,
    input.preferredDate,
    input.preferredTime,
  );

  if (!isAvailable) {
    throw new Error("Den valda tiden är inte tillgänglig.");
  }

  const bookingId = await saveCleaningBooking({
    serviceSlug: lead.serviceSlug,
    postalCode: lead.postalCode,
    municipality: lead.municipality,
    squareMeters: lead.cleaningDetails.squareMeters,
    hasPets: lead.cleaningDetails.hasPets ? "ja" : "nej",
    frequency: lead.cleaningDetails.frequency,
    tidying: lead.cleaningDetails.tidying as "nej" | "ja-undanplockning",
    weekdayPreference: lead.cleaningDetails.weekdayPreference as "flexibel" | "valj-dag",
    keyAccess: input.keyAccess,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    name: lead.contactName,
    phone: lead.contactPhone,
    email: lead.contactEmail,
    address: lead.streetAddress ?? undefined,
    message: lead.message ?? undefined,
    propertyType: lead.cleaningDetails.propertyType as
      | "hem"
      | "kontor"
      | "ovrigt"
      | undefined,
    sourceLeadId: lead.id,
  });

  await markLeadConverted(lead.id, bookingId);

  return bookingId;
}

export async function convertServiceLeadToBooking(input: ConvertServiceLeadInput) {
  const lead = await getLeadById(input.leadId);

  if (!lead) {
    throw new Error("Leaden hittades inte.");
  }

  if (lead.status === "converted" || lead.convertedBookingId) {
    throw new Error("Leaden är redan omvandlad till en bokning.");
  }

  if (lead.leadType !== "service_inquiry") {
    throw new Error("Leaden är inte en tjänsteförfrågan.");
  }

  const supabase = createAdminClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_type: "service_booking",
      service_slug: lead.serviceSlug,
      contact_name: lead.contactName,
      contact_phone: lead.contactPhone,
      contact_email: lead.contactEmail,
      postal_code: lead.postalCode,
      municipality: lead.municipality,
      street_address: lead.streetAddress,
      message: input.note?.trim() || lead.message,
      source: "lead_conversion",
      status: "confirmed",
      source_lead_id: lead.id,
      profile_id: null,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    throw new Error("Kunde inte skapa bokningen.");
  }

  await supabase.from("booking_status_events").insert({
    booking_id: booking.id,
    status: "confirmed",
    note: "Bokning skapad från lead.",
  });

  if (lead.contactPhone && lead.contactEmail) {
    try {
      const account = await ensureCustomerAccount({
        name: lead.contactName,
        phone: lead.contactPhone,
        email: lead.contactEmail,
        address: lead.streetAddress ?? undefined,
        postalCode: lead.postalCode,
        municipality: lead.municipality,
      });

      if (account) {
        await supabase
          .from("bookings")
          .update({ profile_id: account.userId })
          .eq("id", booking.id);
      }
    } catch (error) {
      console.error("convertServiceLeadToBooking account link failed:", error);
    }
  }

  await markLeadConverted(lead.id, booking.id);

  return booking.id;
}
