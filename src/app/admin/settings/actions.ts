"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  parseWeeklyAvailabilityPayload,
  type WeeklyAvailabilitySchedule,
} from "@/lib/booking-availability";
import { WEB_BOOKING_SERVICE_SLUG } from "@/lib/booking";
import { saveWeeklyAvailabilitySchedule } from "@/lib/db/weekly-availability";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type SaveWeeklyAvailabilityResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveWeeklyAvailabilityAction(
  schedule: WeeklyAvailabilitySchedule,
): Promise<SaveWeeklyAvailabilityResult> {
  await requireAdminSession();

  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: "Supabase service role saknas. Lägg till SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const parsed = parseWeeklyAvailabilityPayload(schedule);
  if (!parsed) {
    return { ok: false, error: "Ogiltigt schema för bokningstider." };
  }

  try {
    await saveWeeklyAvailabilitySchedule(WEB_BOOKING_SERVICE_SLUG, parsed);
    revalidatePath("/admin/settings");
    revalidatePath("/api/booking/availability");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Kunde inte spara bokningstider.",
    };
  }
}
