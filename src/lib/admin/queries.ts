import { createClient } from "@/lib/supabase/server";
import type { TeamProfile } from "@/lib/admin/auth";
import { isAdmin } from "@/lib/admin/auth";
import { getCleaningFrequencyLabel } from "@/lib/booking-schedule";
import {
  addDays,
  type AssignableStaffMember,
  type BookingVisitItem,
  type ScheduleVisit,
  toDateKey,
} from "@/lib/admin/schedule";

const ACTIVE_STATUSES = ["submitted", "contacted", "confirmed"] as const;
const ACTIVE_BOOKING_TYPES = ["cleaning_direct", "service_booking"] as const;

const bookingSelect = `
  id,
  booking_type,
  status,
  service_slug,
  contact_name,
  municipality,
  postal_code,
  created_at,
  cleaning_booking_details(preferred_date, preferred_time, frequency)
`;

const visitSelect = `
  id,
  visit_date,
  visit_time,
  bookings!inner(
    id,
    booking_type,
    status,
    service_slug,
    contact_name,
    municipality,
    postal_code,
    created_at,
    cleaning_booking_details(frequency, preferred_date, preferred_time)
  )
`;

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
  frequency: string | null;
  frequencyLabel: string | null;
  nextVisitDate: string | null;
  nextVisitTime: string | null;
  upcomingVisitCount: number;
};

export type DashboardLead = {
  id: string;
  lead_type: "cleaning_expert" | "service_inquiry";
  status: string;
  service_slug: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  municipality: string;
  postal_code: string;
  street_address: string | null;
  message: string | null;
  created_at: string;
  converted_booking_id: string | null;
  frequency: string | null;
  timeframe: string | null;
};

export type DashboardStats = {
  activeBookings: number;
  todaysJobs: number;
  unhandledLeads: number;
  activeStaff: number;
};

function getStockholmToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
  }).format(new Date());
}

type BookingQueryRow = {
  id: string;
  booking_type: string;
  status: string;
  service_slug: string;
  contact_name: string;
  municipality: string;
  postal_code: string;
  created_at: string;
  cleaning_booking_details:
    | {
        preferred_date: string | null;
        preferred_time: string | null;
        frequency: string;
      }
    | {
        preferred_date: string | null;
        preferred_time: string | null;
        frequency: string;
      }[]
    | null;
};

type VisitQueryRow = {
  id: string;
  visit_date: string;
  visit_time: string;
  bookings: BookingQueryRow | BookingQueryRow[];
};

function formatVisitTime(time: string | null) {
  if (!time) {
    return null;
  }

  return time.slice(0, 5);
}

function mapBookingRow(row: BookingQueryRow): DashboardBooking {
  const details = Array.isArray(row.cleaning_booking_details)
    ? row.cleaning_booking_details[0]
    : row.cleaning_booking_details;

  const frequency = details?.frequency ?? null;

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
    preferredTime: formatVisitTime(details?.preferred_time ?? null),
    frequency,
    frequencyLabel: frequency ? getCleaningFrequencyLabel(frequency) : null,
    nextVisitDate: null,
    nextVisitTime: null,
    upcomingVisitCount: 0,
  };
}

function mapVisitRow(row: VisitQueryRow): DashboardBooking {
  const booking = Array.isArray(row.bookings) ? row.bookings[0] : row.bookings;
  const mapped = mapBookingRow(booking);

  return {
    ...mapped,
    preferredDate: row.visit_date,
    preferredTime: formatVisitTime(row.visit_time),
    nextVisitDate: row.visit_date,
    nextVisitTime: formatVisitTime(row.visit_time),
    upcomingVisitCount: 1,
  };
}

async function enrichBookingsWithVisits(bookings: DashboardBooking[]) {
  if (bookings.length === 0) {
    return bookings;
  }

  const supabase = await createClient();
  const today = getStockholmToday();
  const bookingIds = bookings.map((booking) => booking.id);

  const { data, error } = await supabase
    .from("cleaning_visits")
    .select("booking_id, visit_date, visit_time")
    .in("booking_id", bookingIds)
    .eq("status", "scheduled")
    .gte("visit_date", today)
    .order("visit_date", { ascending: true })
    .order("visit_time", { ascending: true });

  if (error || !data) {
    return bookings;
  }

  const visitsByBooking = new Map<string, { visit_date: string; visit_time: string }[]>();

  for (const visit of data) {
    const current = visitsByBooking.get(visit.booking_id) ?? [];
    current.push(visit);
    visitsByBooking.set(visit.booking_id, current);
  }

  return bookings.map((booking) => {
    const visits = visitsByBooking.get(booking.id) ?? [];
    const nextVisit = visits[0];

    if (!nextVisit) {
      return booking;
    }

    return {
      ...booking,
      nextVisitDate: nextVisit.visit_date,
      nextVisitTime: formatVisitTime(nextVisit.visit_time),
      upcomingVisitCount: visits.length,
    };
  });
}

function applyVisitStaffFilter<T extends { in: (column: string, values: string[]) => T }>(
  query: T,
  bookingIds: string[] | null,
) {
  if (bookingIds === null) {
    return query;
  }

  if (bookingIds.length === 0) {
    return null;
  }

  return query.in("booking_id", bookingIds);
}

async function getAssignedBookingIds(profile: TeamProfile) {
  if (isAdmin(profile)) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("job_assignments")
    .select("booking_id")
    .eq("staff_id", profile.id);

  return data?.map((row) => row.booking_id) ?? [];
}

function applyStaffFilter<T extends { in: (column: string, values: string[]) => T }>(
  query: T,
  bookingIds: string[] | null,
) {
  if (bookingIds === null) {
    return query;
  }

  if (bookingIds.length === 0) {
    return null;
  }

  return query.in("id", bookingIds);
}

export async function getDashboardStats(profile: TeamProfile): Promise<DashboardStats> {
  const supabase = await createClient();
  const bookingIds = await getAssignedBookingIds(profile);
  const today = getStockholmToday();

  if (isAdmin(profile)) {
    const [active, todayJobs, leads, staff] = await Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("booking_type", [...ACTIVE_BOOKING_TYPES])
        .in("status", [...ACTIVE_STATUSES]),
      supabase
        .from("cleaning_visits")
        .select("id, bookings!inner(status)", { count: "exact", head: true })
        .eq("visit_date", today)
        .eq("status", "scheduled")
        .neq("bookings.status", "cancelled"),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted"),
      supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("role", "staff")
        .eq("is_active", true),
    ]);

    return {
      activeBookings: active.count ?? 0,
      todaysJobs: todayJobs.count ?? 0,
      unhandledLeads: leads.count ?? 0,
      activeStaff: staff.count ?? 0,
    };
  }

  const assignedIds = bookingIds ?? [];

  if (assignedIds.length === 0) {
    return {
      activeBookings: 0,
      todaysJobs: 0,
      unhandledLeads: 0,
      activeStaff: 0,
    };
  }

  const [active, todayJobs] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("id", assignedIds)
      .in("booking_type", [...ACTIVE_BOOKING_TYPES])
      .in("status", [...ACTIVE_STATUSES]),
    supabase
      .from("cleaning_visits")
      .select("id, bookings!inner(status)", { count: "exact", head: true })
      .in("booking_id", assignedIds)
      .eq("visit_date", today)
      .eq("status", "scheduled")
      .neq("bookings.status", "cancelled"),
  ]);

  return {
    activeBookings: active.count ?? 0,
    todaysJobs: todayJobs.count ?? 0,
    unhandledLeads: 0,
    activeStaff: 0,
  };
}

export async function listActiveBookings(profile: TeamProfile, limit = 8) {
  const supabase = await createClient();
  const bookingIds = await getAssignedBookingIds(profile);

  let query = supabase
    .from("bookings")
    .select(bookingSelect)
    .in("booking_type", [...ACTIVE_BOOKING_TYPES])
    .in("status", [...ACTIVE_STATUSES])
    .order("created_at", { ascending: false })
    .limit(limit);

  const filtered = applyStaffFilter(query, bookingIds);
  if (!filtered) {
    return [];
  }

  const { data, error } = await filtered;

  if (error || !data) {
    return [];
  }

  return enrichBookingsWithVisits(
    data.map((row) => mapBookingRow(row as BookingQueryRow)),
  );
}

export async function listTodaysJobs(profile: TeamProfile, limit = 8) {
  const supabase = await createClient();
  const bookingIds = await getAssignedBookingIds(profile);
  const today = getStockholmToday();

  let query = supabase
    .from("cleaning_visits")
    .select(visitSelect)
    .eq("visit_date", today)
    .eq("status", "scheduled")
    .neq("bookings.status", "cancelled")
    .order("visit_time", { ascending: true })
    .limit(limit);

  const filtered = applyVisitStaffFilter(query, bookingIds);
  if (!filtered) {
    return [];
  }

  const { data, error } = await filtered;

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapVisitRow(row as VisitQueryRow));
}

export async function listUnhandledLeads(limit = 6) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      id,
      lead_type,
      status,
      service_slug,
      contact_name,
      contact_phone,
      contact_email,
      municipality,
      postal_code,
      street_address,
      message,
      created_at,
      converted_booking_id,
      cleaning_lead_details (frequency),
      service_lead_details (timeframe)
    `,
    )
    .eq("status", "submitted")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapLeadRow(row));
}

function mapLeadRow(row: {
  id: string;
  lead_type: "cleaning_expert" | "service_inquiry";
  status: string;
  service_slug: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  municipality: string;
  postal_code: string;
  street_address: string | null;
  message: string | null;
  created_at: string;
  converted_booking_id: string | null;
  cleaning_lead_details:
    | { frequency: string }
    | { frequency: string }[]
    | null;
  service_lead_details: { timeframe: string } | { timeframe: string }[] | null;
}): DashboardLead {
  const cleaningDetails = Array.isArray(row.cleaning_lead_details)
    ? row.cleaning_lead_details[0]
    : row.cleaning_lead_details;
  const serviceDetails = Array.isArray(row.service_lead_details)
    ? row.service_lead_details[0]
    : row.service_lead_details;

  return {
    id: row.id,
    lead_type: row.lead_type,
    status: row.status,
    service_slug: row.service_slug,
    contact_name: row.contact_name,
    contact_phone: row.contact_phone,
    contact_email: row.contact_email,
    municipality: row.municipality,
    postal_code: row.postal_code,
    street_address: row.street_address,
    message: row.message,
    created_at: row.created_at,
    converted_booking_id: row.converted_booking_id,
    frequency: cleaningDetails?.frequency ?? null,
    timeframe: serviceDetails?.timeframe ?? null,
  };
}

export async function listLeads(limit = 30) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      id,
      lead_type,
      status,
      service_slug,
      contact_name,
      contact_phone,
      contact_email,
      municipality,
      postal_code,
      street_address,
      message,
      created_at,
      converted_booking_id,
      cleaning_lead_details (frequency),
      service_lead_details (timeframe)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapLeadRow(row));
}

export async function listBookingsForTeam(profile: TeamProfile, limit = 20) {
  const supabase = await createClient();
  const bookingIds = await getAssignedBookingIds(profile);

  let query = supabase
    .from("bookings")
    .select(bookingSelect)
    .in("booking_type", [...ACTIVE_BOOKING_TYPES])
    .order("created_at", { ascending: false })
    .limit(limit);

  const filtered = applyStaffFilter(query, bookingIds);
  if (!filtered) {
    return [];
  }

  const { data, error } = await filtered;

  if (error || !data) {
    return [];
  }

  return enrichBookingsWithVisits(
    data.map((row) => mapBookingRow(row as BookingQueryRow)),
  );
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
    .select("id, user_id, role, job_title, is_active, created_at, full_name, phone")
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
      full_name: member.full_name ?? profile?.full_name ?? null,
      email: profile?.email ?? null,
      phone: member.phone ?? profile?.phone ?? null,
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

const scheduleVisitSelect = `
  id,
  visit_date,
  visit_time,
  duration_minutes,
  status,
  sequence_number,
  staff_id,
  note,
  bookings!inner(
    id,
    booking_type,
    status,
    service_slug,
    contact_name,
    contact_phone,
    contact_email,
    municipality,
    postal_code,
    street_address,
    message,
    cleaning_booking_details(
      frequency,
      square_meters,
      has_pets,
      tidying,
      weekday_preference,
      key_access,
      quoted_monthly_price_ore,
      booking_path,
      admin_pricing_mode,
      admin_fixed_price_ore
    ),
    service_inquiry_details(
      timeframe,
      admin_pricing_mode,
      admin_fixed_price_ore
    )
  ),
  staff:profiles!cleaning_visits_staff_id_fkey(full_name)
`;

type ScheduleVisitQueryRow = {
  id: string;
  visit_date: string;
  visit_time: string;
  duration_minutes: number;
  status: string;
  sequence_number: number;
  staff_id: string | null;
  note: string | null;
  staff: { full_name: string | null } | { full_name: string | null }[] | null;
  bookings:
    | {
        id: string;
        booking_type: string;
        status: string;
        service_slug: string;
        contact_name: string;
        contact_phone: string;
        contact_email: string;
        municipality: string;
        postal_code: string;
        street_address: string | null;
        message: string | null;
        cleaning_booking_details:
          | {
              frequency: string;
              square_meters: number;
              has_pets: boolean;
              tidying: string;
              weekday_preference: string;
              key_access: string | null;
              quoted_monthly_price_ore: number | null;
              booking_path: string;
            }
          | {
              frequency: string;
              square_meters: number;
              has_pets: boolean;
              tidying: string;
              weekday_preference: string;
              key_access: string | null;
              quoted_monthly_price_ore: number | null;
              booking_path: string;
            }[]
          | null;
      }
    | {
        id: string;
        booking_type: string;
        status: string;
        service_slug: string;
        contact_name: string;
        contact_phone: string;
        contact_email: string;
        municipality: string;
        postal_code: string;
        street_address: string | null;
        message: string | null;
        cleaning_booking_details:
          | {
              frequency: string;
              square_meters: number;
              has_pets: boolean;
              tidying: string;
              weekday_preference: string;
              key_access: string | null;
              quoted_monthly_price_ore: number | null;
              booking_path: string;
            }
          | {
              frequency: string;
              square_meters: number;
              has_pets: boolean;
              tidying: string;
              weekday_preference: string;
              key_access: string | null;
              quoted_monthly_price_ore: number | null;
              booking_path: string;
            }[]
          | null;
      }[];
};

function mapScheduleVisitRow(row: ScheduleVisitQueryRow): ScheduleVisit {
  const booking = Array.isArray(row.bookings) ? row.bookings[0] : row.bookings;
  const details = booking.cleaning_booking_details
    ? Array.isArray(booking.cleaning_booking_details)
      ? booking.cleaning_booking_details[0]
      : booking.cleaning_booking_details
    : null;
  const staff = Array.isArray(row.staff) ? row.staff[0] : row.staff;

  return {
    id: row.id,
    visitDate: row.visit_date,
    visitTime: formatVisitTime(row.visit_time) ?? row.visit_time.slice(0, 5),
    durationMinutes: row.duration_minutes,
    status: row.status,
    sequenceNumber: row.sequence_number,
    staffId: row.staff_id,
    staffName: staff?.full_name ?? null,
    bookingId: booking.id,
    bookingType: booking.booking_type,
    bookingStatus: booking.status,
    contactName: booking.contact_name,
    contactPhone: booking.contact_phone,
    contactEmail: booking.contact_email,
    municipality: booking.municipality,
    postalCode: booking.postal_code,
    streetAddress: booking.street_address,
    serviceSlug: booking.service_slug,
    frequency: details?.frequency ?? null,
    frequencyLabel: details?.frequency
      ? getCleaningFrequencyLabel(details.frequency)
      : null,
    squareMeters: details?.square_meters ?? null,
    hasPets: details?.has_pets ?? null,
    tidying: details?.tidying ?? null,
    weekdayPreference: details?.weekday_preference ?? null,
    keyAccess: details?.key_access ?? null,
    quotedMonthlyPriceOre: details?.quoted_monthly_price_ore ?? null,
    bookingPath: details?.booking_path ?? null,
    message: booking.message,
    note: row.note,
  };
}

export async function listScheduleVisits(
  profile: TeamProfile,
  weekStartKey: string,
): Promise<ScheduleVisit[]> {
  const supabase = await createClient();
  const weekEndKey = toDateKey(addDays(new Date(`${weekStartKey}T12:00:00`), 6));

  let query = supabase
    .from("cleaning_visits")
    .select(scheduleVisitSelect)
    .gte("visit_date", weekStartKey)
    .lte("visit_date", weekEndKey)
    .eq("status", "scheduled")
    .neq("bookings.status", "cancelled")
    .order("visit_date", { ascending: true })
    .order("visit_time", { ascending: true });

  if (!isAdmin(profile)) {
    query = query.eq("staff_id", profile.id);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapScheduleVisitRow(row as ScheduleVisitQueryRow));
}

export async function listAssignableStaff(): Promise<AssignableStaffMember[]> {
  const members = await listTeamMembers();

  return members
    .filter((member) => member.is_active)
    .map((member) => ({
      userId: member.user_id,
      name: member.full_name?.trim() || member.email || "Namnlös",
      role: member.role,
    }));
}

const bookingVisitSelect = `
  id,
  visit_date,
  visit_time,
  duration_minutes,
  status,
  sequence_number,
  staff_id,
  note,
  staff:profiles!cleaning_visits_staff_id_fkey(full_name)
`;

type BookingVisitQueryRow = {
  id: string;
  visit_date: string;
  visit_time: string;
  duration_minutes: number;
  status: string;
  sequence_number: number;
  staff_id: string | null;
  note: string | null;
  staff: { full_name: string | null } | { full_name: string | null }[] | null;
};

function mapBookingVisitRow(row: BookingVisitQueryRow): BookingVisitItem {
  const staff = Array.isArray(row.staff) ? row.staff[0] : row.staff;

  return {
    id: row.id,
    visitDate: row.visit_date,
    visitTime: formatVisitTime(row.visit_time) ?? row.visit_time.slice(0, 5),
    durationMinutes: row.duration_minutes,
    status: row.status,
    sequenceNumber: row.sequence_number,
    staffId: row.staff_id,
    staffName: staff?.full_name ?? null,
    note: row.note,
  };
}

export async function listBookingVisits(
  profile: TeamProfile,
  bookingId: string,
): Promise<BookingVisitItem[]> {
  const supabase = await createClient();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
  }).format(new Date());

  let query = supabase
    .from("cleaning_visits")
    .select(bookingVisitSelect)
    .eq("booking_id", bookingId)
    .eq("status", "scheduled")
    .gte("visit_date", today)
    .order("visit_date", { ascending: true })
    .order("visit_time", { ascending: true });

  if (!isAdmin(profile)) {
    query = query.eq("staff_id", profile.id);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapBookingVisitRow(row as BookingVisitQueryRow));
}

const bookingDetailSelect = `
  id,
  booking_type,
  status,
  service_slug,
  contact_name,
  contact_phone,
  contact_email,
  municipality,
  postal_code,
  street_address,
  message,
  source,
  profile_id,
  created_at,
  cleaning_booking_details(
    frequency,
    square_meters,
    has_pets,
    tidying,
    weekday_preference,
    key_access,
    preferred_date,
    preferred_time,
    quoted_monthly_price_ore,
    booking_path,
    admin_pricing_mode,
    admin_fixed_price_ore
  ),
  service_inquiry_details(
    timeframe,
    admin_pricing_mode,
    admin_fixed_price_ore
  ),
  booking_status_events(
    id,
    status,
    note,
    created_at
  ),
  cleaning_visits(
    id,
    visit_date,
    visit_time,
    duration_minutes,
    status,
    sequence_number,
    staff_id,
    note,
    staff:profiles!cleaning_visits_staff_id_fkey(full_name)
  )
`;

type BookingDetailQueryRow = {
  id: string;
  booking_type: string;
  status: string;
  service_slug: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  municipality: string;
  postal_code: string;
  street_address: string | null;
  message: string | null;
  source: string;
  profile_id: string | null;
  created_at: string;
  cleaning_booking_details:
    | {
        frequency: string;
        square_meters: number;
        has_pets: boolean;
        tidying: string;
        weekday_preference: string;
        key_access: string | null;
        preferred_date: string | null;
        preferred_time: string | null;
        quoted_monthly_price_ore: number | null;
        booking_path: string;
        admin_pricing_mode: string | null;
        admin_fixed_price_ore: number | null;
      }
    | {
        frequency: string;
        square_meters: number;
        has_pets: boolean;
        tidying: string;
        weekday_preference: string;
        key_access: string | null;
        preferred_date: string | null;
        preferred_time: string | null;
        quoted_monthly_price_ore: number | null;
        booking_path: string;
        admin_pricing_mode: string | null;
        admin_fixed_price_ore: number | null;
      }[]
    | null;
  service_inquiry_details:
    | {
        timeframe: string;
        admin_pricing_mode: string | null;
        admin_fixed_price_ore: number | null;
      }
    | {
        timeframe: string;
        admin_pricing_mode: string | null;
        admin_fixed_price_ore: number | null;
      }[]
    | null;
  booking_status_events:
    | {
        id: string;
        status: string;
        note: string | null;
        created_at: string;
      }[]
    | null;
  cleaning_visits:
    | BookingVisitQueryRow[]
    | BookingVisitQueryRow
    | null;
};

export type AdminBookingStatusEvent = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
};

export type AdminBookingCleaningDetails = {
  frequency: string;
  frequencyLabel: string;
  squareMeters: number;
  hasPets: boolean;
  tidying: string;
  weekdayPreference: string;
  keyAccess: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  quotedMonthlyPriceOre: number | null;
  bookingPath: string;
  adminPricingMode: string | null;
  adminFixedPriceOre: number | null;
};

export type AdminBookingServiceDetails = {
  timeframe: string;
  adminPricingMode: string | null;
  adminFixedPriceOre: number | null;
};

export type AdminBookingDetail = {
  id: string;
  bookingType: string;
  status: string;
  serviceSlug: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  municipality: string;
  postalCode: string;
  streetAddress: string | null;
  message: string | null;
  source: string;
  profileId: string | null;
  createdAt: string;
  cleaningDetails: AdminBookingCleaningDetails | null;
  serviceDetails: AdminBookingServiceDetails | null;
  visits: BookingVisitItem[];
  statusEvents: AdminBookingStatusEvent[];
};

function mapBookingDetailRow(row: BookingDetailQueryRow): AdminBookingDetail {
  const cleaningDetails = row.cleaning_booking_details
    ? Array.isArray(row.cleaning_booking_details)
      ? row.cleaning_booking_details[0]
      : row.cleaning_booking_details
    : null;
  const serviceDetails = row.service_inquiry_details
    ? Array.isArray(row.service_inquiry_details)
      ? row.service_inquiry_details[0]
      : row.service_inquiry_details
    : null;
  const visits = Array.isArray(row.cleaning_visits)
    ? row.cleaning_visits
    : row.cleaning_visits
      ? [row.cleaning_visits]
      : [];
  const statusEvents = (row.booking_status_events ?? [])
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return {
    id: row.id,
    bookingType: row.booking_type,
    status: row.status,
    serviceSlug: row.service_slug,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    municipality: row.municipality,
    postalCode: row.postal_code,
    streetAddress: row.street_address,
    message: row.message,
    source: row.source,
    profileId: row.profile_id,
    createdAt: row.created_at,
    cleaningDetails: cleaningDetails
      ? {
          frequency: cleaningDetails.frequency,
          frequencyLabel: getCleaningFrequencyLabel(cleaningDetails.frequency),
          squareMeters: cleaningDetails.square_meters,
          hasPets: cleaningDetails.has_pets,
          tidying: cleaningDetails.tidying,
          weekdayPreference: cleaningDetails.weekday_preference,
          keyAccess: cleaningDetails.key_access,
          preferredDate: cleaningDetails.preferred_date,
          preferredTime: formatVisitTime(cleaningDetails.preferred_time),
          quotedMonthlyPriceOre: cleaningDetails.quoted_monthly_price_ore,
          bookingPath: cleaningDetails.booking_path,
          adminPricingMode: cleaningDetails.admin_pricing_mode,
          adminFixedPriceOre: cleaningDetails.admin_fixed_price_ore,
        }
      : null,
    serviceDetails: serviceDetails
      ? {
          timeframe: serviceDetails.timeframe,
          adminPricingMode: serviceDetails.admin_pricing_mode,
          adminFixedPriceOre: serviceDetails.admin_fixed_price_ore,
        }
      : null,
    visits: visits
      .map((visit) => mapBookingVisitRow(visit))
      .sort((a, b) => {
        if (a.visitDate === b.visitDate) {
          return a.visitTime.localeCompare(b.visitTime);
        }

        return a.visitDate.localeCompare(b.visitDate);
      }),
    statusEvents: statusEvents.map((event) => ({
      id: event.id,
      status: event.status,
      note: event.note,
      createdAt: event.created_at,
    })),
  };
}

export async function getBookingByIdForTeam(
  profile: TeamProfile,
  bookingId: string,
): Promise<AdminBookingDetail | null> {
  const supabase = await createClient();
  const bookingIds = await getAssignedBookingIds(profile);

  if (bookingIds !== null && !bookingIds.includes(bookingId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(bookingDetailSelect)
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapBookingDetailRow(data as BookingDetailQueryRow);
}
