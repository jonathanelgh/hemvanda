const STOCKHOLM_TIMEZONE = "Europe/Stockholm";

export const SCHEDULE_START_HOUR = 7;
export const SCHEDULE_END_HOUR = 20;
export const SCHEDULE_HOUR_HEIGHT_PX = 56;
export const DEFAULT_VISIT_DURATION_MINUTES = 120;

export type ScheduleVisit = {
  id: string;
  visitDate: string;
  visitTime: string;
  durationMinutes: number;
  status: string;
  sequenceNumber: number;
  staffId: string | null;
  staffName: string | null;
  bookingId: string;
  bookingType: string;
  bookingStatus: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  municipality: string;
  postalCode: string;
  streetAddress: string | null;
  serviceSlug: string;
  frequency: string | null;
  frequencyLabel: string | null;
  squareMeters: number | null;
  hasPets: boolean | null;
  tidying: string | null;
  weekdayPreference: string | null;
  keyAccess: string | null;
  quotedMonthlyPriceOre: number | null;
  bookingPath: string | null;
  message: string | null;
  note: string | null;
};

export type BookingVisitItem = {
  id: string;
  visitDate: string;
  visitTime: string;
  durationMinutes: number;
  status: string;
  sequenceNumber: number;
  staffId: string | null;
  staffName: string | null;
  note: string | null;
};

export type AssignableStaffMember = {
  userId: string;
  name: string;
  role: "admin" | "staff";
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getStockholmTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STOCKHOLM_TIMEZONE,
  }).format(new Date());
}

export function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfWeekMonday(date: Date) {
  const day = startOfDay(date);
  const weekday = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - weekday);
  return day;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function buildWeekDays(weekStartKey: string) {
  const start = startOfWeekMonday(parseDateKey(weekStartKey));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      dateKey: toDateKey(date),
    };
  });
}

export function formatWeekRangeLabel(weekStartKey: string) {
  const days = buildWeekDays(weekStartKey);
  const start = days[0].date;
  const end = days[6].date;

  const formatter = new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    timeZone: STOCKHOLM_TIMEZONE,
  });

  const startLabel = formatter.format(start);
  const endLabel = formatter.format(end);
  const year = start.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${formatter.formatToParts(end).find((part) => part.type === "month")?.value} ${year}`;
  }

  return `${startLabel} – ${endLabel} ${year}`;
}

export function formatDayHeading(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: STOCKHOLM_TIMEZONE,
  }).format(date);
}

export function resolveWeekStartKey(week?: string | null) {
  if (week && /^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return toDateKey(startOfWeekMonday(parseDateKey(week)));
  }

  return toDateKey(startOfWeekMonday(new Date()));
}

export function shiftWeekStartKey(weekStartKey: string, weeks: number) {
  const date = addDays(parseDateKey(weekStartKey), weeks * 7);
  return toDateKey(startOfWeekMonday(date));
}

export function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesAsTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getVisitPosition(durationMinutes: number, visitTime: string) {
  const startMinutes = parseTimeToMinutes(visitTime);
  const gridStartMinutes = SCHEDULE_START_HOUR * 60;
  const gridEndMinutes = SCHEDULE_END_HOUR * 60;

  if (startMinutes >= gridEndMinutes || startMinutes + durationMinutes <= gridStartMinutes) {
    return null;
  }

  const topMinutes = Math.max(startMinutes, gridStartMinutes);
  const endMinutes = Math.min(startMinutes + durationMinutes, gridEndMinutes);
  const visibleDuration = Math.max(endMinutes - topMinutes, 30);

  return {
    top: ((topMinutes - gridStartMinutes) / 60) * SCHEDULE_HOUR_HEIGHT_PX,
    height: Math.max((visibleDuration / 60) * SCHEDULE_HOUR_HEIGHT_PX - 4, 44),
  };
}

export function buildHourLabels() {
  const labels = [];

  for (let hour = SCHEDULE_START_HOUR; hour < SCHEDULE_END_HOUR; hour += 1) {
    labels.push(`${String(hour).padStart(2, "0")}:00`);
  }

  return labels;
}

export function groupVisitsByDate(visits: ScheduleVisit[]) {
  const grouped = new Map<string, ScheduleVisit[]>();

  for (const visit of visits) {
    const current = grouped.get(visit.visitDate) ?? [];
    current.push(visit);
    grouped.set(visit.visitDate, current);
  }

  for (const [dateKey, dayVisits] of grouped) {
    grouped.set(
      dateKey,
      [...dayVisits].sort(
        (left, right) => parseTimeToMinutes(left.visitTime) - parseTimeToMinutes(right.visitTime),
      ),
    );
  }

  return grouped;
}
