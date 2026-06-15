import { generateVisitDates } from "@/lib/booking-schedule";
import type { CleaningFrequency } from "@/lib/booking";
import { createAdminClient } from "@/lib/supabase/admin";

function toDbTime(time: string) {
  return time.length === 5 ? `${time}:00` : time;
}

function toDisplayTime(time: string) {
  return time.slice(0, 5);
}

type GenerateCleaningVisitsInput = {
  bookingId: string;
  frequency: CleaningFrequency;
  startDate: string;
  startTime: string;
};

export async function generateCleaningVisits(input: GenerateCleaningVisitsInput) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("cleaning_visits")
    .select("id")
    .eq("booking_id", input.bookingId)
    .limit(1);

  if (existing?.length) {
    return;
  }

  const visitDates = generateVisitDates(input.startDate, input.frequency);
  const visitTime = toDbTime(input.startTime);

  const rows = visitDates.map((visitDate, index) => ({
    booking_id: input.bookingId,
    visit_date: visitDate,
    visit_time: visitTime,
    sequence_number: index + 1,
    status: "scheduled" as const,
  }));

  const { error } = await supabase.from("cleaning_visits").insert(rows);

  if (error) {
    throw new Error("Kunde inte skapa städbesök.");
  }
}

export async function getBookedVisitTimesForDate(serviceSlug: string, slotDate: string) {
  const supabase = createAdminClient();
  const booked = new Set<string>();

  const { data, error } = await supabase
    .from("cleaning_visits")
    .select("visit_time, bookings!inner(service_slug, status)")
    .eq("visit_date", slotDate)
    .eq("bookings.service_slug", serviceSlug)
    .neq("bookings.status", "cancelled")
    .in("status", ["scheduled", "completed"]);

  if (error) {
    console.error("getBookedVisitTimesForDate failed:", error.message);
    return booked;
  }

  for (const row of data ?? []) {
    booked.add(toDisplayTime(row.visit_time));
  }

  return booked;
}

export type UpcomingVisit = {
  id: string;
  bookingId: string;
  visitDate: string;
  visitTime: string;
  status: string;
  sequenceNumber: number;
};

export async function getUpcomingVisitsForBookings(bookingIds: string[]) {
  if (bookingIds.length === 0) {
    return new Map<string, UpcomingVisit[]>();
  }

  const supabase = createAdminClient();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
  }).format(new Date());

  const { data, error } = await supabase
    .from("cleaning_visits")
    .select("id, booking_id, visit_date, visit_time, status, sequence_number")
    .in("booking_id", bookingIds)
    .eq("status", "scheduled")
    .gte("visit_date", today)
    .order("visit_date", { ascending: true })
    .order("visit_time", { ascending: true });

  if (error || !data) {
    return new Map<string, UpcomingVisit[]>();
  }

  const visitsByBooking = new Map<string, UpcomingVisit[]>();

  for (const row of data) {
    const visit: UpcomingVisit = {
      id: row.id,
      bookingId: row.booking_id,
      visitDate: row.visit_date,
      visitTime: toDisplayTime(row.visit_time),
      status: row.status,
      sequenceNumber: row.sequence_number,
    };

    const current = visitsByBooking.get(row.booking_id) ?? [];
    current.push(visit);
    visitsByBooking.set(row.booking_id, current);
  }

  return visitsByBooking;
}

export async function getNextVisitForBookings(bookingIds: string[]) {
  const visitsByBooking = await getUpcomingVisitsForBookings(bookingIds);
  const nextByBooking = new Map<string, UpcomingVisit>();

  for (const [bookingId, visits] of visitsByBooking) {
    if (visits[0]) {
      nextByBooking.set(bookingId, visits[0]);
    }
  }

  return nextByBooking;
}
