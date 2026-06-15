import { createAdminClient } from "@/lib/supabase/admin";

export type ScheduleClient = {
  key: string;
  profileId: string | null;
  name: string;
  email: string;
  phone: string;
  streetAddress: string | null;
  postalCode: string;
  municipality: string;
};

type BookingContactRow = {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  street_address: string | null;
  postal_code: string;
  municipality: string;
  profile_id: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

function clientKey(profileId: string | null, email: string) {
  return profileId ?? `email:${email.toLowerCase()}`;
}

function mapBookingContact(row: BookingContactRow): ScheduleClient {
  return {
    key: clientKey(row.profile_id, row.contact_email),
    profileId: row.profile_id,
    name: row.contact_name,
    email: row.contact_email,
    phone: row.contact_phone,
    streetAddress: row.street_address,
    postalCode: row.postal_code,
    municipality: row.municipality,
  };
}

async function getTeamMemberIds() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("team_members")
    .select("user_id")
    .eq("is_active", true);

  return new Set((data ?? []).map((row) => row.user_id));
}

async function getPrimaryAddress(profileId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("customer_addresses")
    .select("street_address, postal_code, municipality")
    .eq("profile_id", profileId)
    .order("is_primary", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

async function getLatestBookingForProfile(profileId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(
      "contact_name, contact_email, contact_phone, street_address, postal_code, municipality, profile_id, created_at",
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as BookingContactRow | null;
}

async function mapProfileToClient(profile: ProfileRow): Promise<ScheduleClient | null> {
  if (!profile.email?.trim()) {
    return null;
  }

  const address = await getPrimaryAddress(profile.id);
  const latestBooking = await getLatestBookingForProfile(profile.id);

  return {
    key: clientKey(profile.id, profile.email),
    profileId: profile.id,
    name: profile.full_name?.trim() || latestBooking?.contact_name || profile.email,
    email: profile.email,
    phone: profile.phone?.trim() || latestBooking?.contact_phone || "",
    streetAddress:
      address?.street_address ?? latestBooking?.street_address ?? null,
    postalCode: address?.postal_code ?? latestBooking?.postal_code ?? "",
    municipality: address?.municipality ?? latestBooking?.municipality ?? "",
  };
}

export async function searchScheduleClients(query = "", limit = 20) {
  const admin = createAdminClient();
  const teamMemberIds = await getTeamMemberIds();
  const normalizedQuery = query.trim();
  const clients = new Map<string, ScheduleClient>();

  let profileQuery = admin
    .from("profiles")
    .select("id, full_name, email, phone")
    .not("email", "is", null)
    .limit(50);

  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    profileQuery = profileQuery.or(
      `full_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`,
    );
  }

  const { data: profiles } = await profileQuery;

  for (const profile of profiles ?? []) {
    if (teamMemberIds.has(profile.id)) {
      continue;
    }

    const client = await mapProfileToClient(profile as ProfileRow);

    if (client) {
      clients.set(client.key, client);
    }
  }

  let bookingQuery = admin
    .from("bookings")
    .select(
      "contact_name, contact_email, contact_phone, street_address, postal_code, municipality, profile_id, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    bookingQuery = bookingQuery.or(
      `contact_name.ilike.${pattern},contact_email.ilike.${pattern},contact_phone.ilike.${pattern}`,
    );
  }

  const { data: bookings } = await bookingQuery;

  for (const row of bookings ?? []) {
    const booking = row as BookingContactRow;
    const key = clientKey(booking.profile_id, booking.contact_email);

    if (booking.profile_id && teamMemberIds.has(booking.profile_id)) {
      continue;
    }

    if (!clients.has(key)) {
      clients.set(key, mapBookingContact(booking));
    }
  }

  return Array.from(clients.values())
    .sort((left, right) => left.name.localeCompare(right.name, "sv"))
    .slice(0, limit);
}
