import { normalizeZipCode } from "@/lib/coverage";
import { calculateCleaningPrice } from "@/lib/cleaning-pricing";
import {
  formatCleaningLeadScheduleMessage,
  formatCleaningPropertyMessage,
  usesFixedCleaningPrice,
  type CleaningAddons,
  type CleaningFrequency,
  type CleaningPropertyType,
  type ContactPreference,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
  type WindowBookingMode,
} from "@/lib/booking";
import { ensureCustomerAccount } from "@/lib/auth/customer-account";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

type CleaningLeadInput = {
  serviceSlug: string;
  postalCode: string;
  municipality: string;
  squareMeters: number;
  hasPets: PetAnswer;
  frequency: CleaningFrequency;
  tidying: TidyingOption;
  weekdayPreference: WeekdayPreference;
  contactPreference?: ContactPreference;
  preferredDate?: string;
  preferredTime?: string;
  keyAccessLabel?: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  message?: string;
  propertyType?: CleaningPropertyType;
  addons?: CleaningAddons;
  windowCount?: number;
  windowMode?: WindowBookingMode;
};

type ServiceLeadInput = {
  serviceSlug: string;
  postalCode: string;
  municipality: string;
  name: string;
  phone: string;
  email: string;
  timeframe: string;
  message: string;
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

async function linkLeadToCustomer(
  leadId: string,
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
      return;
    }

    const supabase = createAdminClient();
    await supabase
      .from("leads")
      .update({ profile_id: account.userId })
      .eq("id", leadId);
  } catch (error) {
    console.error("linkLeadToCustomer failed:", error);
  }
}

export async function saveCleaningLead(input: CleaningLeadInput) {
  const supabase = createAdminClient();
  const postalCode = normalizeZipCode(input.postalCode) ?? input.postalCode;
  const quote = usesFixedCleaningPrice(input.propertyType)
    ? calculateCleaningPrice({
        squareMeters: String(input.squareMeters),
        hasPets: input.hasPets,
        frequency: input.frequency,
        tidying: input.tidying,
        weekdayPreference: input.weekdayPreference,
        propertyType: input.propertyType,
        addons: input.addons,
        windowCount: input.windowCount,
        windowMode: input.windowMode,
      })
    : null;

  const scheduleMessage = formatCleaningLeadScheduleMessage({
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    keyAccessLabel: input.keyAccessLabel,
  });

  const combinedMessage = [scheduleMessage, input.message?.trim()]
    .filter(Boolean)
    .join("\n\n");

  await upsertServiceArea(postalCode, input.municipality);

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      lead_type: "cleaning_expert",
      service_slug: input.serviceSlug,
      contact_name: input.name.trim(),
      contact_phone: input.phone.trim(),
      contact_email: input.email.trim(),
      postal_code: postalCode,
      municipality: input.municipality.trim(),
      street_address: input.address?.trim() ?? null,
      message: formatCleaningPropertyMessage(input.propertyType, combinedMessage),
      source: "web",
      status: "submitted",
    })
    .select("id")
    .single();

  if (leadError || !lead) {
    throw new Error("Kunde inte spara leaden.");
  }

  const { error: detailsError } = await supabase.from("cleaning_lead_details").insert({
    lead_id: lead.id,
    square_meters: input.squareMeters,
    has_pets: input.hasPets === "ja",
    frequency: input.frequency,
    tidying: input.tidying,
    weekday_preference: input.weekdayPreference,
    contact_preference: input.contactPreference ?? null,
    property_type: input.propertyType ?? null,
  });

  if (detailsError) {
    throw new Error("Kunde inte spara städdetaljer för leaden.");
  }

  await linkLeadToCustomer(lead.id, {
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    postalCode,
    municipality: input.municipality,
  });

  return {
    leadId: lead.id,
    quotedMonthlyPriceOre: quote ? Math.round(quote.total * 100) : null,
    pricingBreakdown: quote ? (quote as unknown as Json) : null,
  };
}

export async function saveServiceLead(input: ServiceLeadInput) {
  const supabase = createAdminClient();
  const postalCode = normalizeZipCode(input.postalCode) ?? input.postalCode;

  await upsertServiceArea(postalCode, input.municipality);

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      lead_type: "service_inquiry",
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

  if (leadError || !lead) {
    throw new Error("Kunde inte spara leaden.");
  }

  const { error: detailsError } = await supabase.from("service_lead_details").insert({
    lead_id: lead.id,
    timeframe: input.timeframe,
  });

  if (detailsError) {
    throw new Error("Kunde inte spara förfrågansdetaljer.");
  }

  await linkLeadToCustomer(lead.id, {
    name: input.name,
    phone: input.phone,
    email: input.email,
    postalCode,
    municipality: input.municipality,
  });

  return lead.id;
}
