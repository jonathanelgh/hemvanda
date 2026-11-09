export type LocalClock = {
  date: string;
  hours: number;
  minutes: number;
  hhmm: string;
};

export function getLocalClock(timeZone: string, now = new Date()): LocalClock {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  const hours = Number(get("hour"));
  const minutes = Number(get("minute"));

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hours,
    minutes,
    hhmm: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  };
}

export function normalizePublishTimes(times: string[] | null | undefined) {
  const cleaned = (times || [])
    .map((time) => String(time || "").trim())
    .filter((time) => /^\d{2}:\d{2}$/.test(time))
    .slice(0, 4);

  return cleaned.length ? cleaned : ["08:30", "17:30"];
}

/** True when the local clock is within [slot, slot + windowMinutes). */
export function isSlotOpen(slotHhmm: string, clock: LocalClock, windowMinutes = 25) {
  const [slotHours, slotMinutes] = slotHhmm.split(":").map(Number);
  const slotTotal = slotHours * 60 + slotMinutes;
  const nowTotal = clock.hours * 60 + clock.minutes;
  return nowTotal >= slotTotal && nowTotal < slotTotal + windowMinutes;
}

export function activeSlotsForSettings(options: { postsPerDay: number; publishTimes: string[] }) {
  return normalizePublishTimes(options.publishTimes).slice(
    0,
    Math.max(1, Math.min(4, options.postsPerDay || 1)),
  );
}

export function daysBetweenDates(earlierDate: string, laterDate: string) {
  const earlier = Date.parse(`${earlierDate}T00:00:00Z`);
  const later = Date.parse(`${laterDate}T00:00:00Z`);
  return Math.round((later - earlier) / 86_400_000);
}

/** True when no post has been published inside the current interval. */
export function isPublishIntervalOpen(options: {
  intervalDays: number;
  lastPublishedDate: string | null;
  today: string;
}) {
  if (!options.lastPublishedDate) return true;
  const interval = Math.max(1, Math.min(30, options.intervalDays || 1));
  return daysBetweenDates(options.lastPublishedDate, options.today) >= interval;
}
