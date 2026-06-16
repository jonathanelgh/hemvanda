"use server";

import { revalidatePath } from "next/cache";
import { getBookingByIdForTeam } from "@/lib/admin/queries";
import { requireTeamSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { ok: true } | { ok: false; error: string };

const bookingStatuses = [
  "submitted",
  "contacted",
  "confirmed",
  "cancelled",
  "completed",
] as const;

function revalidateBookingPaths(bookingId: string) {
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/schedule");
}

async function requireBookingAccess(bookingId: string) {
  const { profile } = await requireTeamSession();
  const booking = await getBookingByIdForTeam(profile, bookingId);

  if (!booking) {
    return { ok: false as const, error: "Bokningen hittades inte." };
  }

  return { ok: true as const, profile, booking };
}

export async function updateBookingStatusAction(
  bookingId: string,
  status: string,
): Promise<ActionResult> {
  if (!bookingStatuses.includes(status as (typeof bookingStatuses)[number])) {
    return { ok: false, error: "Ogiltig status." };
  }

  const nextStatus = status as (typeof bookingStatuses)[number];

  const access = await requireBookingAccess(bookingId);

  if (!access.ok) {
    return access;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("bookings")
    .update({ status: nextStatus })
    .eq("id", bookingId);

  if (error) {
    return { ok: false, error: "Kunde inte uppdatera status." };
  }

  await admin.from("booking_status_events").insert({
    booking_id: bookingId,
    status: nextStatus,
    note: "Status uppdaterad från admin.",
  });

  revalidateBookingPaths(bookingId);

  return { ok: true };
}

export async function updateBookingContactAction(
  bookingId: string,
  formData: FormData,
): Promise<ActionResult> {
  const access = await requireBookingAccess(bookingId);

  if (!access.ok) {
    return access;
  }

  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const streetAddress = String(formData.get("streetAddress") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const municipality = String(formData.get("municipality") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!contactName || !contactPhone || !contactEmail || !postalCode || !municipality) {
    return { ok: false, error: "Fyll i namn, telefon, e-post, postnummer och ort." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("bookings")
    .update({
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      street_address: streetAddress || null,
      postal_code: postalCode,
      municipality,
      message: message || null,
    })
    .eq("id", bookingId);

  if (error) {
    return { ok: false, error: "Kunde inte spara bokningen." };
  }

  revalidateBookingPaths(bookingId);

  return { ok: true };
}
