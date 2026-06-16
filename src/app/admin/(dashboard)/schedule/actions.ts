"use server";

import { revalidatePath } from "next/cache";
import { getAdminActor, isAdmin, requireTeamSession, type TeamProfile } from "@/lib/admin/auth";
import {
  searchScheduleClients,
  type ScheduleClient,
} from "@/lib/admin/clients";
import { listBookingVisits } from "@/lib/admin/queries";
import type { BookingVisitItem } from "@/lib/admin/schedule";
import { ensureCustomerAccount } from "@/lib/auth/customer-account";
import type { AdminScheduleBookingInput } from "@/lib/admin/schedule-booking";
import { saveAdminScheduleBooking } from "@/lib/db/bookings";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

type VisitAccessRow = {
  id: string;
  staff_id: string | null;
  status: string;
};

async function getVisitForAction(visitId: string): Promise<VisitAccessRow | null> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("cleaning_visits")
    .select("id, staff_id, status")
    .eq("id", visitId)
    .maybeSingle();

  return data;
}

function canManageVisit(profile: TeamProfile, visit: VisitAccessRow) {
  return isAdmin(profile) || visit.staff_id === profile.id;
}

function revalidateSchedule(weekStartKey: string) {
  revalidatePath("/admin/schedule");
  revalidatePath(`/admin/schedule?week=${weekStartKey}`);
}

export async function assignVisitStaffAction(
  visitId: string,
  staffId: string | null,
  weekStartKey: string,
): Promise<ActionResult> {
  const actor = await getAdminActor();

  if (!actor) {
    return { ok: false, error: "Endast admin kan tilldela personal." };
  }

  if (!visitId) {
    return { ok: false, error: "Besöket saknas." };
  }

  const admin = createAdminClient();

  if (staffId) {
    const { data: member } = await admin
      .from("team_members")
      .select("user_id")
      .eq("user_id", staffId)
      .eq("is_active", true)
      .maybeSingle();

    if (!member) {
      return { ok: false, error: "Ogiltig personal." };
    }
  }

  const { error } = await admin
    .from("cleaning_visits")
    .update({ staff_id: staffId })
    .eq("id", visitId);

  if (error) {
    return { ok: false, error: "Kunde inte uppdatera tilldelningen." };
  }

  revalidateSchedule(weekStartKey);
  revalidatePath("/admin/bookings");

  return { ok: true };
}

export async function updateVisitStatusAction(
  visitId: string,
  status: "scheduled" | "completed",
  weekStartKey: string,
): Promise<ActionResult> {
  const { profile } = await requireTeamSession();

  if (!visitId) {
    return { ok: false, error: "Besöket saknas." };
  }

  const visit = await getVisitForAction(visitId);

  if (!visit) {
    return { ok: false, error: "Besöket hittades inte." };
  }

  if (!canManageVisit(profile, visit)) {
    return { ok: false, error: "Du har inte behörighet att uppdatera besöket." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("cleaning_visits")
    .update({ status })
    .eq("id", visitId);

  if (error) {
    return { ok: false, error: "Kunde inte uppdatera status." };
  }

  revalidateSchedule(weekStartKey);
  revalidatePath("/admin/bookings");

  return { ok: true };
}

export async function updateVisitNoteAction(
  visitId: string,
  note: string,
  weekStartKey: string,
): Promise<ActionResult> {
  const { profile } = await requireTeamSession();

  if (!visitId) {
    return { ok: false, error: "Besöket saknas." };
  }

  const visit = await getVisitForAction(visitId);

  if (!visit) {
    return { ok: false, error: "Besöket hittades inte." };
  }

  if (!canManageVisit(profile, visit)) {
    return { ok: false, error: "Du har inte behörighet att uppdatera besöket." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("cleaning_visits")
    .update({ note: note.trim() || null })
    .eq("id", visitId);

  if (error) {
    return { ok: false, error: "Kunde inte spara anteckningen." };
  }

  revalidateSchedule(weekStartKey);
  revalidatePath("/admin/bookings");

  return { ok: true };
}

export async function getBookingVisitsAction(
  bookingId: string,
): Promise<{ ok: true; visits: BookingVisitItem[] } | { ok: false; error: string }> {
  const { profile } = await requireTeamSession();

  if (!bookingId) {
    return { ok: false, error: "Bokningen saknas." };
  }

  const visits = await listBookingVisits(profile, bookingId);

  return { ok: true, visits };
}

async function requireAdminActor() {
  const { profile } = await requireTeamSession();

  if (!isAdmin(profile)) {
    return { ok: false as const, error: "Endast admin kan skapa bokningar." };
  }

  return { ok: true as const, profile };
}

export async function searchClientsAction(
  query: string,
): Promise<
  { ok: true; clients: ScheduleClient[] } | { ok: false; error: string }
> {
  const admin = await requireAdminActor();

  if (!admin.ok) {
    return admin;
  }

  const clients = await searchScheduleClients(query);

  return { ok: true, clients };
}

export async function createClientAction(input: {
  name: string;
  email: string;
  phone: string;
  streetAddress: string;
  postalCode: string;
  municipality: string;
}): Promise<
  { ok: true; client: ScheduleClient } | { ok: false; error: string }
> {
  const admin = await requireAdminActor();

  if (!admin.ok) {
    return admin;
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const streetAddress = input.streetAddress.trim();
  const postalCode = input.postalCode.trim();
  const municipality = input.municipality.trim();

  if (!name || !email || !phone || !streetAddress || !postalCode || !municipality) {
    return { ok: false, error: "Fyll i alla kunduppgifter." };
  }

  const account = await ensureCustomerAccount({
    name,
    email,
    phone,
    address: streetAddress,
    postalCode,
    municipality,
  });

  if (!account) {
    return { ok: false, error: "Kunde inte skapa kundkonto." };
  }

  return {
    ok: true,
    client: {
      key: account.userId,
      profileId: account.userId,
      name,
      email,
      phone,
      streetAddress,
      postalCode,
      municipality,
    },
  };
}

export async function createScheduleBookingAction(
  input: AdminScheduleBookingInput & { weekStartKey: string },
): Promise<ActionResult> {
  const admin = await requireAdminActor();

  if (!admin.ok) {
    return admin;
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const postalCode = input.postalCode.trim();
  const municipality = input.municipality.trim();

  if (!name || !email || !phone || !postalCode || !municipality) {
    return { ok: false, error: "Kunduppgifter saknas." };
  }

  if (!input.visitDate || !input.visitTime) {
    return { ok: false, error: "Datum och tid krävs." };
  }

  if (!input.serviceSlug) {
    return { ok: false, error: "Välj en tjänst." };
  }

  if (input.staffId) {
    const supabase = createAdminClient();
    const { data: member } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("user_id", input.staffId)
      .eq("is_active", true)
      .maybeSingle();

    if (!member) {
      return { ok: false, error: "Ogiltig personal." };
    }
  }

  try {
    await saveAdminScheduleBooking({
      ...input,
      name,
      email,
      phone,
      postalCode,
      municipality,
      profileId: input.profileId ?? null,
      staffId: input.staffId ?? null,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte skapa bokningen.",
    };
  }

  revalidateSchedule(input.weekStartKey);
  revalidatePath("/admin/bookings");

  return { ok: true };
}