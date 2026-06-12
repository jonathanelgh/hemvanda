import { createClient } from "@/lib/supabase/server";
import type { TeamProfile } from "@/lib/admin/auth";
import { isAdmin } from "@/lib/admin/auth";

export type DashboardBooking = {
  id: string;
  bookingType: string;
  status: string;
  serviceSlug: string;
  contactName: string;
  municipality: string;
  postalCode: string;
  createdAt: string;
  preferredDate: string | null;
  preferredTime: string | null;
};

export async function getDashboardStats(profile: TeamProfile) {
  const supabase = await createClient();

  if (isAdmin(profile)) {
    const [bookings, leads, staff] = await Promise.all([
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("booking_type", ["cleaning_expert", "service_inquiry"]),
      supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("role", "staff")
        .eq("is_active", true),
    ]);

    return {
      totalBookings: bookings.count ?? 0,
      openLeads: leads.count ?? 0,
      activeStaff: staff.count ?? 0,
      assignedJobs: bookings.count ?? 0,
    };
  }

  const { count } = await supabase
    .from("job_assignments")
    .select("id", { count: "exact", head: true })
    .eq("staff_id", profile.id);

  return {
    totalBookings: count ?? 0,
    openLeads: 0,
    activeStaff: 0,
    assignedJobs: count ?? 0,
  };
}

export async function listBookingsForTeam(profile: TeamProfile, limit = 20) {
  const supabase = await createClient();

  let bookingIds: string[] | null = null;

  if (!isAdmin(profile)) {
    const { data: assignments } = await supabase
      .from("job_assignments")
      .select("booking_id")
      .eq("staff_id", profile.id);

    bookingIds = assignments?.map((row) => row.booking_id) ?? [];

    if (bookingIds.length === 0) {
      return [];
    }
  }

  let query = supabase
    .from("bookings")
    .select(
      "id, booking_type, status, service_slug, contact_name, municipality, postal_code, created_at, cleaning_booking_details(preferred_date, preferred_time)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (bookingIds) {
    query = query.in("id", bookingIds);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const details = Array.isArray(row.cleaning_booking_details)
      ? row.cleaning_booking_details[0]
      : row.cleaning_booking_details;

    return {
      id: row.id,
      bookingType: row.booking_type,
      status: row.status,
      serviceSlug: row.service_slug,
      contactName: row.contact_name,
      municipality: row.municipality,
      postalCode: row.postal_code,
      createdAt: row.created_at,
      preferredDate: details?.preferred_date ?? null,
      preferredTime: details?.preferred_time ?? null,
    } satisfies DashboardBooking;
  });
}

export async function listLeads(limit = 30) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_type, status, service_slug, contact_name, contact_phone, contact_email, municipality, postal_code, message, created_at",
    )
    .in("booking_type", ["cleaning_expert", "service_inquiry"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export type TeamMemberRow = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "admin" | "staff";
  job_title: string | null;
  is_active: boolean;
  created_at: string;
};

export async function listTeamMembers(): Promise<TeamMemberRow[]> {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from("team_members")
    .select("id, user_id, role, job_title, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error || !members?.length) {
    return [];
  }

  const userIds = members.map((member) => member.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .in("id", userIds);

  const profileById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return members.map((member) => {
    const profile = profileById.get(member.user_id);

    return {
      id: member.id,
      user_id: member.user_id,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      role: member.role,
      job_title: member.job_title,
      is_active: member.is_active,
      created_at: member.created_at,
    };
  });
}

export async function listCustomers(limit = 30) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "contact_name, contact_email, contact_phone, municipality, postal_code, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  const unique = new Map<string, (typeof data)[number]>();

  for (const row of data) {
    const key = row.contact_email.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, row);
    }
  }

  return Array.from(unique.values()).slice(0, limit);
}
