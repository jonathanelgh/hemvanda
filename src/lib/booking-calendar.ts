export const SWEDISH_WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

export const SWEDISH_MONTHS = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];

export const DEFAULT_AVAILABLE_TIMES = ["08:00", "13:00"];

export type CalendarDayCell = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};

export type CalendarWeekRow = {
  isoWeek: number;
  isCurrentWeek: boolean;
  days: CalendarDayCell[];
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeekMonday(date: Date) {
  const d = startOfDay(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
}

export function getISOWeek(date: Date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - startOfWeekMonday(week1).getTime()) / 86400000 - 3) / 7,
    )
  );
}

export function getISOWeekYear(date: Date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  return d.getFullYear();
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatSwedishMonthYear(year: number, month: number) {
  const label = SWEDISH_MONTHS[month];
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${year}`;
}

export function buildMonthGrid(year: number, month: number): CalendarWeekRow[] {
  const today = startOfDay(new Date());
  const todayWeek = getISOWeek(today);
  const todayWeekYear = getISOWeekYear(today);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const gridStart = startOfWeekMonday(monthStart);
  const gridEnd = startOfWeekMonday(monthEnd);

  const weeks: CalendarWeekRow[] = [];

  for (
    let weekStart = new Date(gridStart);
    weekStart <= gridEnd;
    weekStart.setDate(weekStart.getDate() + 7)
  ) {
    const days: CalendarDayCell[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const normalized = startOfDay(date);

      days.push({
        date: normalized,
        dateKey: toDateKey(normalized),
        dayNumber: normalized.getDate(),
        inMonth: normalized.getMonth() === month,
        isToday: normalized.getTime() === today.getTime(),
        isPast: normalized < today,
      });
    }

    const isoWeek = getISOWeek(days[0].date);

    weeks.push({
      isoWeek,
      isCurrentWeek: isoWeek === todayWeek && getISOWeekYear(days[0].date) === todayWeekYear,
      days,
    });
  }

  return weeks;
}
