import { createClient } from "@/lib/supabase/server";
import { getCleaningFrequencyLabel } from "@/lib/booking-schedule";

const leadTypeLabels: Record<string, string> = {
  cleaning_expert: "Expertförfrågan",
  service_inquiry: "Tjänsteförfrågan",
};

const leadStatusLabels: Record<string, string> = {
  submitted: "Inskickad",
  contacted: "Kontaktad",
  converted: "Omvandlad till bokning",
  cancelled: "Avbruten",
};

export type CustomerLead = {
  id: string;
  createdAt: string;
  status: string;
  statusLabel: string;
  leadType: string;
  leadTypeLabel: string;
  serviceSlug: string;
  municipality: string;
  postalCode: string;
  message: string | null;
  frequencyLabel: string | null;
  timeframe: string | null;
};

export async function getCustomerLeads(profileId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      id,
      created_at,
      status,
      lead_type,
      service_slug,
      municipality,
      postal_code,
      message,
      cleaning_lead_details (frequency),
      service_lead_details (timeframe)
    `,
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCustomerLeads failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const cleaningDetails = Array.isArray(row.cleaning_lead_details)
      ? row.cleaning_lead_details[0]
      : row.cleaning_lead_details;
    const serviceDetails = Array.isArray(row.service_lead_details)
      ? row.service_lead_details[0]
      : row.service_lead_details;

    return {
      id: row.id,
      createdAt: row.created_at,
      status: row.status,
      statusLabel: leadStatusLabels[row.status] ?? row.status,
      leadType: row.lead_type,
      leadTypeLabel: leadTypeLabels[row.lead_type] ?? row.lead_type,
      serviceSlug: row.service_slug,
      municipality: row.municipality,
      postalCode: row.postal_code,
      message: row.message,
      frequencyLabel: cleaningDetails?.frequency
        ? getCleaningFrequencyLabel(cleaningDetails.frequency)
        : null,
      timeframe: serviceDetails?.timeframe ?? null,
    } satisfies CustomerLead;
  });
}
