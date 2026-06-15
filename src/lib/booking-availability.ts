import { DEFAULT_AVAILABLE_TIMES } from "@/lib/booking-calendar";

export const WEEKDAY_LABELS = [
  "Måndag",
  "Tisdag",
  "Ons",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
] as const;

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WeeklyAvailabilitySchedule = Record<WeekdayIndex, string[]>;

export const EMPTY_WEEKLY_SCHEDULE: WeeklyAvailabilitySchedule = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
};

export function getWeekdayIndexFromDateKey(dateKey: string): WeekdayIndex {
  const date = new Date(`${dateKey}T12:00:00`);
  return ((date.getDay() + 6) % 7) as WeekdayIndex;
}

export function normalizeTimeValue(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function sortTimes(times: string[]) {
  return [...times].sort((left, right) => left.localeCompare(right));
}

export function parseWeeklyAvailabilityPayload(
  payload: unknown,
): WeeklyAvailabilitySchedule | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const schedule = { ...EMPTY_WEEKLY_SCHEDULE };

  for (let weekday = 0; weekday <= 6; weekday += 1) {
    const rawTimes = (payload as Record<string, unknown>)[String(weekday)];
    if (!Array.isArray(rawTimes)) {
      return null;
    }

    const normalized = rawTimes
      .map((value) => (typeof value === "string" ? normalizeTimeValue(value) : null))
      .filter((value): value is string => Boolean(value));

    schedule[weekday as WeekdayIndex] = sortTimes([...new Set(normalized)]);
  }

  return schedule;
}

export function getFallbackTimesForWeekday(weekday: WeekdayIndex) {
  return weekday <= 4 ? [...DEFAULT_AVAILABLE_TIMES] : [];
}
