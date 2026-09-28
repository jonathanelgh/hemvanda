"use server";

import { revalidatePath } from "next/cache";
import { isAdmin, requireTeamSession } from "@/lib/admin/auth";
import {
  convertCleaningLeadToBooking,
  convertServiceLeadToBooking,
} from "@/lib/admin/convert-lead";
import type { KeyAccess } from "@/lib/booking";
import { createAdminClient } from "@/lib/supabase/admin";

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

  if (!["hemma", "tillsammans"].includes(keyAccess)) {
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

export async function deleteLeadAction(
  leadId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { profile } = await requireTeamSession();

  if (!isAdmin(profile)) {
    return { ok: false, error: "Endast admin kan ta bort förfrågningar." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("leads").delete().eq("id", leadId);

  if (error) {
    return { ok: false, error: "Kunde inte ta bort förfrågan." };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");

  return { ok: true };
}

export async function clearOpenLeadsAction(): Promise<
  { ok: true; deleted: number } | { ok: false; error: string }
> {
  const { profile } = await requireTeamSession();

  if (!isAdmin(profile)) {
    return { ok: false, error: "Endast admin kan rensa förfrågningar." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leads")
    .delete()
    .in("status", ["submitted", "contacted"])
    .select("id");

  if (error) {
    return { ok: false, error: "Kunde inte rensa förfrågningar." };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");

  return { ok: true, deleted: data?.length ?? 0 };
}
