import { createClient } from "@/lib/supabase/server";
import { getCleaningFrequencyLabel } from "@/lib/booking-schedule";

const bookingTypeLabels: Record<string, string> = {
  cleaning_direct: "Direktbokning",
  cleaning_expert: "Expertförfrågan",
  service_inquiry: "Förfrågan",
  service_booking: "Tjänstebokning",
};

const statusLabels: Record<string, string> = {
  submitted: "Inskickad",
  contacted: "Kontaktad",
  confirmed: "Bekräftad",
  cancelled: "Avbokad",
  completed: "Slutförd",
};

export type CustomerVisit = {
  id: string;
  visitDate: string;
  visitTime: string;
  sequenceNumber: number;
  status: string;
  note: string | null;
  canModify: boolean;
};

export type CustomerBooking = {
  id: string;
  createdAt: string;
  status: string;
  statusLabel: string;
  bookingType: string;
  bookingTypeLabel: string;
  serviceSlug: string;
  municipality: string;
  postalCode: string;
  streetAddress: string | null;
  message: string | null;
  frequency: string | null;
  frequencyLabel: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  upcomingVisits: CustomerVisit[];
  canCancelBooking: boolean;
};

function formatTime(time: string | null) {
  if (!time) {
    return null;
  }

  return time.slice(0, 5);
}

function stockholmToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
  }).format(new Date());
}

export async function getCustomerBookings(profileId: string) {
  const supabase = await createClient();
  const today = stockholmToday();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      created_at,
      status,
      booking_type,
      service_slug,
      municipality,
      postal_code,
      street_address,
      message,
      cleaning_booking_details (
        preferred_date,
        preferred_time,
        frequency
      ),
      cleaning_visits (
        id,
        visit_date,
        visit_time,
        sequence_number,
        status,
        note
      )
    `,
    )
    .eq("profile_id", profileId)
    .in("booking_type", ["cleaning_direct", "service_booking"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCustomerBookings failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const details = Array.isArray(row.cleaning_booking_details)
      ? row.cleaning_booking_details[0]
      : row.cleaning_booking_details;
    const visits = Array.isArray(row.cleaning_visits) ? row.cleaning_visits : [];
    const frequency = details?.frequency ?? null;

    const upcomingVisits = visits
      .filter((visit) => visit.status === "scheduled" && visit.visit_date >= today)
      .sort((a, b) => {
        if (a.visit_date === b.visit_date) {
          return a.visit_time.localeCompare(b.visit_time);
        }

        return a.visit_date.localeCompare(b.visit_date);
      })
      .map((visit) => ({
        id: visit.id,
        visitDate: visit.visit_date,
        visitTime: formatTime(visit.visit_time) ?? visit.visit_time,
        sequenceNumber: visit.sequence_number,
        status: visit.status,
        note: visit.note,
        canModify: visit.visit_date > today,
      }));

    return {
      id: row.id,
      createdAt: row.created_at,
      status: row.status,
      statusLabel: statusLabels[row.status] ?? row.status,
      bookingType: row.booking_type,
      bookingTypeLabel: bookingTypeLabels[row.booking_type] ?? row.booking_type,
      serviceSlug: row.service_slug,
      municipality: row.municipality,
      postalCode: row.postal_code,
      streetAddress: row.street_address,
      message: row.message,
      frequency,
      frequencyLabel: frequency ? getCleaningFrequencyLabel(frequency) : null,
      preferredDate: details?.preferred_date ?? null,
      preferredTime: formatTime(details?.preferred_time ?? null),
      upcomingVisits,
      canCancelBooking:
        row.status !== "cancelled" &&
        row.status !== "completed" &&
        upcomingVisits.some((visit) => visit.canModify),
    } satisfies CustomerBooking;
  });
}

export type CustomerAddress = {
  streetAddress: string;
  postalCode: string;
  municipality: string;
};

export async function getCustomerPrimaryAddress(
  profileId: string,
): Promise<CustomerAddress | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("customer_addresses")
    .select("street_address, postal_code, municipality")
    .eq("profile_id", profileId)
    .eq("is_primary", true)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    streetAddress: data.street_address,
    postalCode: data.postal_code,
    municipality: data.municipality,
  };
}
