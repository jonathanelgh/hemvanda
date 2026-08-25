"use server";

import { revalidatePath } from "next/cache";
import { WEB_BOOKING_SERVICE_SLUG } from "@/lib/booking";
import { getCustomerSession } from "@/lib/auth/customer";
import { isStockholmAreaZip, normalizeZipCode } from "@/lib/coverage";
import { listAvailableTimes } from "@/lib/db/bookings";
import { notifyAdminCustomerChange } from "@/lib/email";
import { normalizePhoneToE164 } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatEmailDate, formatEmailTime } from "@/lib/email/templates";

export type CustomerActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function stockholmToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
  }).format(new Date());
}

function toDbTime(time: string) {
  return time.length === 5 ? `${time}:00` : time;
}

function toDisplayTime(time: string) {
  return time.slice(0, 5);
}

async function requireCustomerProfile() {
  const session = await getCustomerSession();

  if (!session.user || !session.profile) {
    return null;
  }

  return session.profile;
}

async function getOwnedVisit(visitId: string, profileId: string) {
  const admin = createAdminClient();

  const { data } = await admin
    .from("cleaning_visits")
    .select(
      `
      id,
      visit_date,
      visit_time,
      status,
      note,
      booking_id,
      bookings!inner (
        id,
        profile_id,
        status,
        service_slug
      )
    `,
    )
    .eq("id", visitId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const booking = Array.isArray(data.bookings) ? data.bookings[0] : data.bookings;

  if (!booking || booking.profile_id !== profileId) {
    return null;
  }

  return {
    id: data.id,
    visitDate: data.visit_date,
    visitTime: toDisplayTime(data.visit_time),
    status: data.status,
    note: data.note,
    bookingId: data.booking_id,
    bookingStatus: booking.status,
    serviceSlug: booking.service_slug,
  };
}

async function getOwnedBooking(bookingId: string, profileId: string) {
  const admin = createAdminClient();

  const { data } = await admin
    .from("bookings")
    .select("id, profile_id, status, service_slug, message")
    .eq("id", bookingId)
    .eq("profile_id", profileId)
    .maybeSingle();

  return data;
}

export async function updateCustomerProfileAction(input: {
  fullName: string;
  phone: string;
  streetAddress: string;
  postalCode: string;
  municipality: string;
}): Promise<CustomerActionResult> {
  const profile = await requireCustomerProfile();

  if (!profile) {
    return { ok: false, error: "Du måste vara inloggad." };
  }

  const fullName = input.fullName.trim();
  const phoneE164 = normalizePhoneToE164(input.phone);
  const streetAddress = input.streetAddress.trim();
  const postalCode = normalizeZipCode(input.postalCode);
  const municipality = input.municipality.trim();

  if (!fullName) {
    return { ok: false, error: "Ange ditt namn." };
  }

  if (!phoneE164) {
    return { ok: false, error: "Ange ett giltigt telefonnummer." };
  }

  if (!streetAddress || !postalCode || !municipality) {
    return { ok: false, error: "Fyll i adress, postnummer och ort." };
  }

  if (!isStockholmAreaZip(postalCode)) {
    return { ok: false, error: "Vi tar för närvarande emot adresser i Stockholm med omnejd." };
  }

  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phoneE164,
    })
    .eq("id", profile.id);

  if (profileError) {
    return { ok: false, error: "Kunde inte uppdatera dina uppgifter." };
  }

  await admin.auth.admin.updateUserById(profile.id, {
    user_metadata: { full_name: fullName },
  });

  const { data: existingAddress } = await admin
    .from("customer_addresses")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (existingAddress) {
    const { error: addressError } = await admin
      .from("customer_addresses")
      .update({
        street_address: streetAddress,
        postal_code: postalCode,
        municipality,
        label: "Hem",
      })
      .eq("id", existingAddress.id);

    if (addressError) {
      return { ok: false, error: "Kunde inte uppdatera adressen." };
    }
  } else {
    const { error: addressError } = await admin.from("customer_addresses").insert({
      profile_id: profile.id,
      street_address: streetAddress,
      postal_code: postalCode,
      municipality,
      label: "Hem",
      is_primary: true,
    });

    if (addressError) {
      return { ok: false, error: "Kunde inte spara adressen." };
    }
  }

  await admin
    .from("bookings")
    .update({
      contact_name: fullName,
      contact_phone: phoneE164,
      street_address: streetAddress,
      postal_code: postalCode,
      municipality,
    })
    .eq("profile_id", profile.id)
    .in("status", ["submitted", "contacted", "confirmed"]);

  await notifyAdminCustomerChange({
    title: "Kund uppdaterade uppgifter",
    summary: `${fullName} har uppdaterat namn, telefon eller adress via Mitt HemVända.`,
    customerName: fullName,
    customerEmail: profile.email,
    customerPhone: phoneE164,
    rows: [
      {
        label: "Adress",
        value: `${streetAddress}, ${postalCode} ${municipality}`,
      },
    ],
  });

  revalidatePath("/mitt-konto");
  return { ok: true, message: "Dina uppgifter är uppdaterade." };
}

export async function updateVisitInstructionsAction(
  visitId: string,
  note: string,
): Promise<CustomerActionResult> {
  const profile = await requireCustomerProfile();

  if (!profile) {
    return { ok: false, error: "Du måste vara inloggad." };
  }

  const visit = await getOwnedVisit(visitId, profile.id);

  if (!visit) {
    return { ok: false, error: "Besöket hittades inte." };
  }

  if (visit.status !== "scheduled") {
    return { ok: false, error: "Instruktioner kan bara sparas för kommande besök." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("cleaning_visits")
    .update({ note: note.trim() || null })
    .eq("id", visitId);

  if (error) {
    return { ok: false, error: "Kunde inte spara instruktionerna." };
  }

  const trimmedNote = note.trim();

  await notifyAdminCustomerChange({
    title: "Ny instruktion till städaren",
    summary: `${profile.fullName ?? "En kund"} har uppdaterat instruktioner för ett besök.`,
    customerName: profile.fullName ?? "Kund",
    customerEmail: profile.email,
    customerPhone: profile.phone,
    bookingId: visit.bookingId,
    rows: [
      {
        label: "Besök",
        value: `${formatEmailDate(visit.visitDate)} kl. ${formatEmailTime(visit.visitTime)}`,
      },
      {
        label: "Instruktion",
        value: trimmedNote || "(borttagen)",
      },
    ],
  });

  revalidatePath("/mitt-konto");
  return { ok: true, message: "Instruktionerna är sparade." };
}

export async function updateBookingInstructionsAction(
  bookingId: string,
  message: string,
): Promise<CustomerActionResult> {
  const profile = await requireCustomerProfile();

  if (!profile) {
    return { ok: false, error: "Du måste vara inloggad." };
  }

  const booking = await getOwnedBooking(bookingId, profile.id);

  if (!booking) {
    return { ok: false, error: "Bokningen hittades inte." };
  }

  if (booking.status === "cancelled" || booking.status === "completed") {
    return { ok: false, error: "Den här bokningen kan inte ändras." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("bookings")
    .update({ message: message.trim() || null })
    .eq("id", bookingId)
    .eq("profile_id", profile.id);

  if (error) {
    return { ok: false, error: "Kunde inte spara meddelandet." };
  }

  const trimmedMessage = message.trim();

  await notifyAdminCustomerChange({
    title: "Kund uppdaterade bokningsmeddelande",
    summary: `${profile.fullName ?? "En kund"} har uppdaterat meddelandet på en bokning.`,
    customerName: profile.fullName ?? "Kund",
    customerEmail: profile.email,
    customerPhone: profile.phone,
    bookingId: booking.id,
    rows: [
      {
        label: "Meddelande",
        value: trimmedMessage || "(borttaget)",
      },
    ],
  });

  revalidatePath("/mitt-konto");
  return { ok: true, message: "Meddelandet är sparat." };
}

export async function rescheduleVisitAction(input: {
  visitId: string;
  visitDate: string;
  visitTime: string;
}): Promise<CustomerActionResult> {
  const profile = await requireCustomerProfile();

  if (!profile) {
    return { ok: false, error: "Du måste vara inloggad." };
  }

  const visit = await getOwnedVisit(input.visitId, profile.id);

  if (!visit) {
    return { ok: false, error: "Besöket hittades inte." };
  }

  if (visit.status !== "scheduled") {
    return { ok: false, error: "Endast kommande besök kan flyttas." };
  }

  if (visit.bookingStatus === "cancelled" || visit.bookingStatus === "completed") {
    return { ok: false, error: "Bokningen kan inte ändras." };
  }

  const today = stockholmToday();
  const visitDate = input.visitDate.trim();
  const visitTime = toDisplayTime(input.visitTime.trim());

  if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
    return { ok: false, error: "Ange ett giltigt datum." };
  }

  if (!/^\d{2}:\d{2}$/.test(visitTime)) {
    return { ok: false, error: "Ange en giltig tid." };
  }

  if (visitDate <= today) {
    return { ok: false, error: "Du kan bara flytta till ett datum från och med imorgon." };
  }

  const sameSlot = visit.visitDate === visitDate && visit.visitTime === visitTime;

  if (!sameSlot) {
    const available = await listAvailableTimes(
      visit.serviceSlug || WEB_BOOKING_SERVICE_SLUG,
      visitDate,
    );

    if (!available.includes(visitTime)) {
      return {
        ok: false,
        error: "Den valda tiden är inte ledig. Välj en annan tid.",
      };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("cleaning_visits")
    .update({
      visit_date: visitDate,
      visit_time: toDbTime(visitTime),
    })
    .eq("id", visit.id);

  if (error) {
    return { ok: false, error: "Kunde inte flytta besöket." };
  }

  await admin.from("booking_status_events").insert({
    booking_id: visit.bookingId,
    status: "confirmed",
    note: `Kund flyttade besök till ${visitDate} kl. ${visitTime}.`,
  });

  await notifyAdminCustomerChange({
    title: "Kund flyttade besök",
    summary: `${profile.fullName ?? "En kund"} har flyttat ett städbesök.`,
    customerName: profile.fullName ?? "Kund",
    customerEmail: profile.email,
    customerPhone: profile.phone,
    bookingId: visit.bookingId,
    rows: [
      {
        label: "Tidigare",
        value: `${formatEmailDate(visit.visitDate)} kl. ${formatEmailTime(visit.visitTime)}`,
      },
      {
        label: "Ny tid",
        value: `${formatEmailDate(visitDate)} kl. ${formatEmailTime(visitTime)}`,
      },
    ],
  });

  revalidatePath("/mitt-konto");
  return { ok: true, message: "Besöket är flyttat." };
}

export async function cancelVisitAction(visitId: string): Promise<CustomerActionResult> {
  const profile = await requireCustomerProfile();

  if (!profile) {
    return { ok: false, error: "Du måste vara inloggad." };
  }

  const visit = await getOwnedVisit(visitId, profile.id);

  if (!visit) {
    return { ok: false, error: "Besöket hittades inte." };
  }

  if (visit.status !== "scheduled") {
    return { ok: false, error: "Besöket kan inte avbokas." };
  }

  const today = stockholmToday();

  if (visit.visitDate <= today) {
    return {
      ok: false,
      error: "Dagens eller passerade besök kan inte avbokas här. Kontakta oss istället.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("cleaning_visits")
    .update({ status: "cancelled" })
    .eq("id", visit.id);

  if (error) {
    return { ok: false, error: "Kunde inte avboka besöket." };
  }

  await admin.from("booking_status_events").insert({
    booking_id: visit.bookingId,
    status: "confirmed",
    note: `Kund avbokade besök ${visit.visitDate} kl. ${visit.visitTime}.`,
  });

  const { count } = await admin
    .from("cleaning_visits")
    .select("id", { count: "exact", head: true })
    .eq("booking_id", visit.bookingId)
    .eq("status", "scheduled")
    .gt("visit_date", today);

  if ((count ?? 0) === 0) {
    await admin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", visit.bookingId)
      .eq("profile_id", profile.id);

    await admin.from("booking_status_events").insert({
      booking_id: visit.bookingId,
      status: "cancelled",
      note: "Bokning avbokad av kund (inga kvarvarande besök).",
    });
  }

  await notifyAdminCustomerChange({
    title:
      (count ?? 0) === 0
        ? "Kund avbokade sista besöket"
        : "Kund avbokade besök",
    summary:
      (count ?? 0) === 0
        ? `${profile.fullName ?? "En kund"} avbokade sitt sista kommande besök – bokningen är nu avbokad.`
        : `${profile.fullName ?? "En kund"} har avbokat ett städbesök.`,
    customerName: profile.fullName ?? "Kund",
    customerEmail: profile.email,
    customerPhone: profile.phone,
    bookingId: visit.bookingId,
    rows: [
      {
        label: "Avbokat besök",
        value: `${formatEmailDate(visit.visitDate)} kl. ${formatEmailTime(visit.visitTime)}`,
      },
    ],
  });

  revalidatePath("/mitt-konto");
  return { ok: true, message: "Besöket är avbokat." };
}

export async function cancelBookingAction(bookingId: string): Promise<CustomerActionResult> {
  const profile = await requireCustomerProfile();

  if (!profile) {
    return { ok: false, error: "Du måste vara inloggad." };
  }

  const booking = await getOwnedBooking(bookingId, profile.id);

  if (!booking) {
    return { ok: false, error: "Bokningen hittades inte." };
  }

  if (booking.status === "cancelled" || booking.status === "completed") {
    return { ok: false, error: "Bokningen är redan avslutad." };
  }

  const today = stockholmToday();
  const admin = createAdminClient();

  await admin
    .from("cleaning_visits")
    .update({ status: "cancelled" })
    .eq("booking_id", bookingId)
    .eq("status", "scheduled")
    .gt("visit_date", today);

  const { error } = await admin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("profile_id", profile.id);

  if (error) {
    return { ok: false, error: "Kunde inte avboka." };
  }

  await admin.from("booking_status_events").insert({
    booking_id: bookingId,
    status: "cancelled",
    note: "Bokning avbokad av kund.",
  });

  await notifyAdminCustomerChange({
    title: "Kund avbokade hela bokningen",
    summary: `${profile.fullName ?? "En kund"} har avbokat en bokning och alla kommande besök.`,
    customerName: profile.fullName ?? "Kund",
    customerEmail: profile.email,
    customerPhone: profile.phone,
    bookingId,
    rows: [
      { label: "Tjänst", value: booking.service_slug },
    ],
  });

  revalidatePath("/mitt-konto");
  return { ok: true, message: "Bokningen är avbokad." };
}

export async function getVisitTimesAction(visitDate: string): Promise<string[]> {
  const profile = await requireCustomerProfile();

  if (!profile || !/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
    return [];
  }

  return listAvailableTimes(WEB_BOOKING_SERVICE_SLUG, visitDate);
}
