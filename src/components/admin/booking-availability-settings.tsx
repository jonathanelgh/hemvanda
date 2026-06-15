"use client";

import { useMemo, useState, useTransition } from "react";
import { saveWeeklyAvailabilityAction } from "@/app/admin/settings/actions";
import {
  normalizeTimeValue,
  sortTimes,
  WEEKDAY_LABELS,
  type WeekdayIndex,
  type WeeklyAvailabilitySchedule,
} from "@/lib/booking-availability";

type BookingAvailabilitySettingsProps = {
  initialSchedule: WeeklyAvailabilitySchedule;
};

function cloneSchedule(schedule: WeeklyAvailabilitySchedule): WeeklyAvailabilitySchedule {
  return {
    0: [...schedule[0]],
    1: [...schedule[1]],
    2: [...schedule[2]],
    3: [...schedule[3]],
    4: [...schedule[4]],
    5: [...schedule[5]],
    6: [...schedule[6]],
  };
}

export function BookingAvailabilitySettings({
  initialSchedule,
}: BookingAvailabilitySettingsProps) {
  const [schedule, setSchedule] = useState(() => cloneSchedule(initialSchedule));
  const [draftTime, setDraftTime] = useState<Record<WeekdayIndex, string>>({
    0: "08:00",
    1: "08:00",
    2: "08:00",
    3: "08:00",
    4: "08:00",
    5: "08:00",
    6: "08:00",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalSlots = useMemo(
    () => Object.values(schedule).reduce((sum, times) => sum + times.length, 0),
    [schedule],
  );

  function updateDayTimes(weekday: WeekdayIndex, times: string[]) {
    setSchedule((current) => ({
      ...current,
      [weekday]: sortTimes(times),
    }));
  }

  function addTime(weekday: WeekdayIndex) {
    const normalized = normalizeTimeValue(draftTime[weekday]);
    if (!normalized) {
      setError("Ange en giltig tid i formatet HH:MM.");
      return;
    }

    if (schedule[weekday].includes(normalized)) {
      setError("Tiden finns redan för den här dagen.");
      return;
    }

    setError(null);
    updateDayTimes(weekday, [...schedule[weekday], normalized]);
  }

  function removeTime(weekday: WeekdayIndex, time: string) {
    setError(null);
    updateDayTimes(
      weekday,
      schedule[weekday].filter((value) => value !== time),
    );
  }

  function handleSave() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await saveWeeklyAvailabilityAction(schedule);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Bokningstiderna har sparats.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-green/10 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-green">Bokningstider per veckodag</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
          Ställ in vilka tider kunder kan boka hemstädning för varje veckodag. Tiderna
          visas i datum- och tidsvalet i bokningsflödet. Lämna en dag tom om ni inte
          tar emot bokningar den dagen.
        </p>
        <p className="mt-3 text-sm font-semibold text-green">
          {totalSlots} tider konfigurerade totalt
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {WEEKDAY_LABELS.map((label, weekday) => {
          const day = weekday as WeekdayIndex;
          const times = schedule[day];

          return (
            <section
              key={label}
              className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-xl text-green">{label}</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {times.length} {times.length === 1 ? "tid" : "tider"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {times.length === 0 ? (
                  <span className="rounded-full bg-ivory px-3 py-1.5 text-xs font-semibold text-muted">
                    Inga tider – dagen är stängd
                  </span>
                ) : (
                  times.map((time) => (
                    <span
                      key={time}
                      className="inline-flex items-center gap-2 rounded-full border border-green/10 bg-ivory px-3 py-1.5 text-sm font-semibold text-green"
                    >
                      {time}
                      <button
                        type="button"
                        onClick={() => removeTime(day, time)}
                        className="text-muted transition hover:text-red-700"
                        aria-label={`Ta bort ${time} på ${label}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  type="time"
                  value={draftTime[day]}
                  onChange={(event) =>
                    setDraftTime((current) => ({
                      ...current,
                      [day]: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border border-green/15 bg-white px-3 text-sm text-green outline-none"
                />
                <button
                  type="button"
                  onClick={() => addTime(day)}
                  className="h-11 rounded-full border border-green/15 px-4 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
                >
                  Lägg till tid
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="h-12 rounded-full bg-green px-6 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sparar..." : "Spara bokningstider"}
        </button>
        {message ? <p className="text-sm font-semibold text-green">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
