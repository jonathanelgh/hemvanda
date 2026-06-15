"use server";

import { revalidatePath } from "next/cache";
import { requireTeamSession } from "@/lib/admin/auth";
import {
  convertCleaningLeadToBooking,
  convertServiceLeadToBooking,
} from "@/lib/admin/convert-lead";
import type { KeyAccess } from "@/lib/booking";

export type ConvertLeadActionResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

export async function convertCleaningLeadAction(
  leadId: string,
  formData: FormData,
): Promise<ConvertLeadActionResult> {
  await requireTeamSession();

  const preferredDate = String(formData.get("preferredDate") ?? "").trim();
  const preferredTime = String(formData.get("preferredTime") ?? "").trim();
  const keyAccess = String(formData.get("keyAccess") ?? "").trim() as KeyAccess;

  if (!preferredDate || !preferredTime) {
    return { ok: false, error: "Välj datum och tid för bokningen." };
  }

  if (!["hemma", "lamnar-kontor", "redan-lamnat"].includes(keyAccess)) {
    return { ok: false, error: "Välj hur vi får åtkomst till nycklar." };
  }

  try {
    const bookingId = await convertCleaningLeadToBooking({
      leadId,
      preferredDate,
      preferredTime,
      keyAccess,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/leads/${leadId}`);

    return { ok: true, bookingId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte skapa bokningen.",
    };
  }
}

export async function convertServiceLeadAction(
  leadId: string,
  formData: FormData,
): Promise<ConvertLeadActionResult> {
  await requireTeamSession();

  const note = String(formData.get("note") ?? "").trim();

  try {
    const bookingId = await convertServiceLeadToBooking({
      leadId,
      note: note || undefined,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/leads/${leadId}`);

    return { ok: true, bookingId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte skapa bokningen.",
    };
  }
}
