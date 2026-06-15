import { DEFAULT_AVAILABLE_TIMES } from "@/lib/booking-calendar";
import { getBookedVisitTimesForDate } from "@/lib/db/cleaning-visits";
import {
  EMPTY_WEEKLY_SCHEDULE,
  getFallbackTimesForWeekday,
  getWeekdayIndexFromDateKey,
  sortTimes,
  type WeekdayIndex,
  type WeeklyAvailabilitySchedule,
} from "@/lib/booking-availability";
import { createAdminClient } from "@/lib/supabase/admin";

function toDisplayTime(value: string) {
  return value.slice(0, 5);
}

function toDbTime(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}

function groupWeeklyRows(
  rows: { weekday: number; start_time: string }[],
): WeeklyAvailabilitySchedule {
  const schedule = { ...EMPTY_WEEKLY_SCHEDULE };

  for (const row of rows) {
    if (row.weekday < 0 || row.weekday > 6) continue;
    const weekday = row.weekday as WeekdayIndex;
    schedule[weekday].push(toDisplayTime(row.start_time));
  }

  for (let weekday = 0; weekday <= 6; weekday += 1) {
    schedule[weekday as WeekdayIndex] = sortTimes([
      ...new Set(schedule[weekday as WeekdayIndex]),
    ]);
  }

  return schedule;
}

export async function getWeeklyAvailabilitySchedule(
  serviceSlug: string,
): Promise<WeeklyAvailabilitySchedule> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("weekly_availability")
    .select("weekday, start_time")
    .eq("service_slug", serviceSlug)
    .order("weekday")
    .order("start_time");

  if (error) {
    throw new Error("Kunde inte hämta bokningstider.");
  }

  return groupWeeklyRows(data ?? []);
}

export async function saveWeeklyAvailabilitySchedule(
  serviceSlug: string,
  schedule: WeeklyAvailabilitySchedule,
) {
  const supabase = createAdminClient();

  const { error: deleteError } = await supabase
    .from("weekly_availability")
    .delete()
    .eq("service_slug", serviceSlug);

  if (deleteError) {
    throw new Error("Kunde inte uppdatera bokningstider.");
  }

  const rows = Object.entries(schedule).flatMap(([weekday, times]) =>
    times.map((startTime) => ({
      service_slug: serviceSlug,
      weekday: Number(weekday),
      start_time: toDbTime(startTime),
    })),
  );

  if (rows.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("weekly_availability").insert(rows);

  if (insertError) {
    throw new Error("Kunde inte spara bokningstider.");
  }
}

async function getBookedTimesForDate(serviceSlug: string, slotDate: string) {
  const supabase = createAdminClient();
  const booked = new Set<string>();

  const [{ data: bookingRows }, { data: slotRows }, visitBookedTimes] = await Promise.all([
    supabase
      .from("bookings")
      .select("cleaning_booking_details!inner(preferred_time, preferred_date)")
      .eq("service_slug", serviceSlug)
      .eq("booking_type", "cleaning_direct")
      .neq("status", "cancelled")
      .eq("cleaning_booking_details.preferred_date", slotDate)
      .not("cleaning_booking_details.preferred_time", "is", null),
    supabase
      .from("availability_slots")
      .select("start_time")
      .eq("service_slug", serviceSlug)
      .eq("slot_date", slotDate)
      .eq("is_available", false),
    getBookedVisitTimesForDate(serviceSlug, slotDate),
  ]);

  for (const row of bookingRows ?? []) {
    const details = Array.isArray(row.cleaning_booking_details)
      ? row.cleaning_booking_details[0]
      : row.cleaning_booking_details;

    if (details?.preferred_time) {
      booked.add(toDisplayTime(details.preferred_time));
    }
  }

  for (const row of slotRows ?? []) {
    booked.add(toDisplayTime(row.start_time));
  }

  for (const time of visitBookedTimes) {
    booked.add(time);
  }

  return booked;
}

export async function getAvailableTimesForDate(serviceSlug: string, slotDate: string) {
  const weekday = getWeekdayIndexFromDateKey(slotDate);
  let schedule = { ...EMPTY_WEEKLY_SCHEDULE };

  try {
    schedule = await getWeeklyAvailabilitySchedule(serviceSlug);
  } catch (error) {
    console.error("getAvailableTimesForDate schedule fallback:", error);
  }

  const templateTimes = schedule[weekday];

  const configuredTimes =
    templateTimes.length > 0 ? templateTimes : getFallbackTimesForWeekday(weekday);

  if (configuredTimes.length === 0) {
    return [];
  }

  const bookedTimes = await getBookedTimesForDate(serviceSlug, slotDate);

  return configuredTimes.filter((time) => !bookedTimes.has(time));
}

export async function isTimeAvailableForBooking(
  serviceSlug: string,
  slotDate: string,
  preferredTime: string,
) {
  const availableTimes = await getAvailableTimesForDate(serviceSlug, slotDate);
  return availableTimes.includes(preferredTime);
}

export function getDefaultAvailabilityFallback(dateKey: string) {
  const weekday = getWeekdayIndexFromDateKey(dateKey);
  const times = getFallbackTimesForWeekday(weekday);
  return times.length > 0 ? times : [...DEFAULT_AVAILABLE_TIMES];
}
