"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildMonthGrid,
  DEFAULT_AVAILABLE_TIMES,
  formatSwedishMonthYear,
  SWEDISH_WEEKDAYS,
} from "@/lib/booking-calendar";

type CleaningSchedulePickerProps = {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function CleaningSchedulePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onBack,
  onContinue,
}: CleaningSchedulePickerProps) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const weeks = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const [availableTimes, setAvailableTimes] = useState<string[]>(
    [...DEFAULT_AVAILABLE_TIMES],
  );

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([...DEFAULT_AVAILABLE_TIMES]);
      return;
    }

    let cancelled = false;

    fetch(`/api/booking/availability?date=${selectedDate}`)
      .then((response) => response.json())
      .then((data: { times?: string[] }) => {
        if (!cancelled) {
          setAvailableTimes(data.times?.length ? data.times : [...DEFAULT_AVAILABLE_TIMES]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailableTimes([...DEFAULT_AVAILABLE_TIMES]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const canContinue = Boolean(selectedDate && selectedTime);

  function goToPreviousMonth() {
    setViewMonth((month) => {
      if (month === 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      return month - 1;
    });
  }

  function goToNextMonth() {
    setViewMonth((month) => {
      if (month === 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return month + 1;
    });
  }

  function handleDateSelect(dateKey: string, isPast: boolean, inMonth: boolean) {
    if (isPast || !inMonth) return;
    onDateChange(dateKey);
    onTimeChange(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl text-green">Välj datum och tid</h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-green/60 transition hover:text-gold"
        >
          Tillbaka
        </button>
      </div>

      <section>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green/15 text-green transition hover:border-gold hover:text-gold"
            aria-label="Föregående månad"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <p className="font-display text-2xl text-green">
            {formatSwedishMonthYear(viewYear, viewMonth)}
          </p>

          <button
            type="button"
            onClick={goToNextMonth}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green/15 text-green transition hover:border-gold hover:text-gold"
            aria-label="Nästa månad"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[320px]">
            <div className="grid grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] gap-1 text-center text-xs font-semibold uppercase tracking-wide text-green/50">
              <div className="py-2">V</div>
              {SWEDISH_WEEKDAYS.map((weekday) => (
                <div key={weekday} className="py-2">
                  {weekday}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {weeks.map((week) => (
                <div
                  key={`${viewYear}-${viewMonth}-${week.isoWeek}`}
                  className={`grid grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] gap-1 rounded-lg ${
                    week.isCurrentWeek ? "bg-green/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-center py-2 text-xs font-semibold text-muted">
                    v.{week.isoWeek}
                  </div>

                  {week.days.map((day) => {
                    const isSelected = selectedDate === day.dateKey;
                    const isDisabled = day.isPast || !day.inMonth;

                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        disabled={isDisabled}
                        onClick={() =>
                          handleDateSelect(day.dateKey, day.isPast, day.inMonth)
                        }
                        className={`flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition ${
                          isSelected
                            ? "bg-green text-white"
                            : day.isToday
                              ? "border border-gold text-green"
                              : isDisabled
                                ? "text-green/20"
                                : day.inMonth
                                  ? "text-green hover:bg-ivory"
                                  : "text-green/25"
                        }`}
                      >
                        {day.dayNumber}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedDate ? (
        <section>
          <h3 className="font-display text-2xl text-green">Lediga tider</h3>
          <p className="mt-2 text-sm text-muted">
            Välj en tid för din första städning.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {availableTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onTimeChange(time)}
                className={`h-12 min-w-24 rounded-full border px-6 text-sm font-semibold transition ${
                  selectedTime === time
                    ? "border-green bg-green text-white"
                    : "border-green/15 bg-white text-green hover:border-gold hover:bg-ivory"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="space-y-3">
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="h-14 w-full rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
        >
          Fortsätt
        </button>
        {!canContinue ? (
          <p className="text-xs text-muted">*Välj datum och tid för att fortsätta</p>
        ) : null}
      </div>
    </div>
  );
}
