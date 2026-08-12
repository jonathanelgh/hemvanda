import {
  cleaningFrequencyPlans,
  type CleaningFrequency,
} from "@/lib/booking";

export const VISIT_GENERATION_HORIZON_MONTHS = 3;

const frequencyIntervalDays: Record<CleaningFrequency, number | null> = {
  "varje-vecka": 7,
  "varannan-vecka": 14,
  "var-fjarde-vecka": 28,
  storstadning: null,
  flyttstadning: null,
  fonster: null,
};

export function getCleaningIntervalDays(frequency: CleaningFrequency) {
  return frequencyIntervalDays[frequency];
}

export function getCleaningFrequencyLabel(frequency: string) {
  if (frequency === "storstadning") return "Storstädning";
  if (frequency === "flyttstadning") return "Flyttstädning";
  if (frequency === "fonster") return "Fönsterputs";

  return (
    cleaningFrequencyPlans.find((plan) => plan.value === frequency)?.label ?? frequency
  );
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(dateKey: string, months: number) {
  const date = parseDateKey(dateKey);
  date.setMonth(date.getMonth() + months);
  return formatDateKey(date);
}

export function generateVisitDates(
  startDate: string,
  frequency: CleaningFrequency,
  horizonMonths = VISIT_GENERATION_HORIZON_MONTHS,
) {
  const dates = [startDate];

  const intervalDays = frequencyIntervalDays[frequency];
  if (!intervalDays) {
    return dates;
  }

  const endDate = addMonths(startDate, horizonMonths);
  let current = parseDateKey(startDate);

  while (true) {
    current.setDate(current.getDate() + intervalDays);
    const nextDate = formatDateKey(current);

    if (nextDate > endDate) {
      break;
    }

    dates.push(nextDate);
  }

  return dates;
}
