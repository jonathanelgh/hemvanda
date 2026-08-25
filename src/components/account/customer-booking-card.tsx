"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  cancelBookingAction,
  cancelVisitAction,
  getVisitTimesAction,
  rescheduleVisitAction,
  updateBookingInstructionsAction,
  updateVisitInstructionsAction,
} from "@/app/(site)/mitt-konto/actions";
import type { CustomerBooking } from "@/lib/db/customer-bookings";
import { services } from "@/lib/services";

type CustomerBookingCardProps = {
  booking: CustomerBooking;
};

function serviceTitle(slug: string) {
  return services.find((service) => service.slug === slug)?.title ?? slug;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const fieldClassName =
  "mt-1 h-11 w-full rounded-xl border border-green/15 bg-white px-4 text-sm text-green outline-none";
const textareaClassName =
  "mt-1 min-h-24 w-full rounded-xl border border-green/15 bg-white px-4 py-3 text-sm text-green outline-none";

export function CustomerBookingCard({ booking }: CustomerBookingCardProps) {
  const [bookingMessage, setBookingMessage] = useState(booking.message ?? "");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [activeVisitId, setActiveVisitId] = useState<string | null>(null);
  const [visitNotes, setVisitNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      booking.upcomingVisits.map((visit) => [visit.id, visit.note ?? ""]),
    ),
  );
  const [reschedule, setReschedule] = useState<Record<
    string,
    { date: string; time: string; times: string[] }
  >>({});

  function setStatus(nextError: string, nextFeedback = "") {
    setError(nextError);
    setFeedback(nextFeedback);
  }

  function handleSaveBookingMessage() {
    setStatus("");
    startTransition(async () => {
      const result = await updateBookingInstructionsAction(
        booking.id,
        bookingMessage,
      );
      if (!result.ok) {
        setStatus(result.error);
        return;
      }
      setStatus("", result.message ?? "Sparat.");
    });
  }

  function handleSaveVisitNote(visitId: string) {
    setStatus("");
    startTransition(async () => {
      const result = await updateVisitInstructionsAction(
        visitId,
        visitNotes[visitId] ?? "",
      );
      if (!result.ok) {
        setStatus(result.error);
        return;
      }
      setStatus("", result.message ?? "Sparat.");
      setActiveVisitId(null);
    });
  }

  function handleCancelVisit(visitId: string) {
    if (!window.confirm("Vill du avboka det här besöket?")) {
      return;
    }

    setStatus("");
    startTransition(async () => {
      const result = await cancelVisitAction(visitId);
      if (!result.ok) {
        setStatus(result.error);
        return;
      }
      setStatus("", result.message ?? "Avbokat.");
    });
  }

  function handleCancelBooking() {
    if (
      !window.confirm(
        "Vill du avboka hela bokningen och alla kommande besök?",
      )
    ) {
      return;
    }

    setStatus("");
    startTransition(async () => {
      const result = await cancelBookingAction(booking.id);
      if (!result.ok) {
        setStatus(result.error);
        return;
      }
      setStatus("", result.message ?? "Avbokat.");
    });
  }

  function openReschedule(visitId: string, visitDate: string, visitTime: string) {
    setActiveVisitId(visitId);
    setReschedule((current) => ({
      ...current,
      [visitId]: {
        date: visitDate,
        time: visitTime,
        times: current[visitId]?.times ?? [],
      },
    }));
  }

  function handleReschedule(visitId: string) {
    const draft = reschedule[visitId];
    if (!draft) return;

    setStatus("");
    startTransition(async () => {
      const result = await rescheduleVisitAction({
        visitId,
        visitDate: draft.date,
        visitTime: draft.time,
      });
      if (!result.ok) {
        setStatus(result.error);
        return;
      }
      setStatus("", result.message ?? "Flyttat.");
      setActiveVisitId(null);
    });
  }

  return (
    <article className="rounded-xl border border-green/10 bg-white/80 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
            {booking.bookingTypeLabel}
          </p>
          <h3 className="mt-2 font-display text-2xl text-green">
            {serviceTitle(booking.serviceSlug)}
          </h3>
        </div>
        <span className="rounded-full bg-ivory px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-green/70">
          {booking.statusLabel}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm text-muted sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-green">Ort</dt>
          <dd className="mt-1">
            {booking.municipality} ({booking.postalCode})
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-green">Inskickad</dt>
          <dd className="mt-1">
            {new Date(booking.createdAt).toLocaleDateString("sv-SE")}
          </dd>
        </div>
        {booking.frequencyLabel ? (
          <div>
            <dt className="font-semibold text-green">Frekvens</dt>
            <dd className="mt-1">{booking.frequencyLabel}</dd>
          </div>
        ) : null}
        {booking.streetAddress ? (
          <div className="sm:col-span-2">
            <dt className="font-semibold text-green">Adress</dt>
            <dd className="mt-1">{booking.streetAddress}</dd>
          </div>
        ) : null}
      </dl>

      {booking.status !== "cancelled" && booking.status !== "completed" ? (
        <div className="mt-5 border-t border-green/10 pt-5">
          <label className="block">
            <span className="text-sm font-semibold text-green">
              Meddelande till oss / städaren
            </span>
            <textarea
              className={textareaClassName}
              value={bookingMessage}
              onChange={(event) => setBookingMessage(event.target.value)}
              placeholder="T.ex. portkod, husdjur, särskilda önskemål..."
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={handleSaveBookingMessage}
            className="mt-3 rounded-full border border-green/15 px-4 py-2 text-sm font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
          >
            Spara meddelande
          </button>
        </div>
      ) : null}

      {booking.upcomingVisits.length > 0 ? (
        <div className="mt-5 border-t border-green/10 pt-5">
          <h4 className="text-sm font-semibold text-green">Kommande besök</h4>
          <ul className="mt-3 space-y-4">
            {booking.upcomingVisits.map((visit) => {
              const draft = reschedule[visit.id];
              const isOpen = activeVisitId === visit.id;

              return (
                <li
                  key={visit.id}
                  className="rounded-xl bg-ivory/70 px-4 py-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-green">
                        {formatDate(visit.visitDate)}
                      </p>
                      <p className="text-muted">kl. {visit.visitTime}</p>
                    </div>
                    {visit.canModify ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            openReschedule(
                              visit.id,
                              visit.visitDate,
                              visit.visitTime,
                            )
                          }
                          className="rounded-full border border-green/15 px-3 py-1.5 text-xs font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
                        >
                          Flytta
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleCancelVisit(visit.id)}
                          className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          Avboka
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">
                        Kontakta oss för ändring av dagens besök
                      </span>
                    )}
                  </div>

                  {visit.canModify ? (
                    <div className="mt-4 space-y-3 border-t border-green/10 pt-4">
                      <label className="block">
                        <span className="font-semibold text-green">
                          Instruktioner till städaren
                        </span>
                        <textarea
                          className={textareaClassName}
                          value={visitNotes[visit.id] ?? ""}
                          onChange={(event) =>
                            setVisitNotes((current) => ({
                              ...current,
                              [visit.id]: event.target.value,
                            }))
                          }
                          placeholder="T.ex. fokus, alarm, fokusområden..."
                        />
                      </label>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleSaveVisitNote(visit.id)}
                        className="rounded-full border border-green/15 px-3 py-1.5 text-xs font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
                      >
                        Spara instruktioner
                      </button>

                      {isOpen && draft ? (
                        <VisitRescheduleFields
                          visitId={visit.id}
                          originalDate={visit.visitDate}
                          currentTime={visit.visitTime}
                          draft={draft}
                          pending={pending}
                          onChange={(next) =>
                            setReschedule((current) => ({
                              ...current,
                              [visit.id]: next,
                            }))
                          }
                          onSave={() => handleReschedule(visit.id)}
                          onCancel={() => setActiveVisitId(null)}
                        />
                      ) : null}
                    </div>
                  ) : visit.note ? (
                    <p className="mt-3 text-muted">Instruktion: {visit.note}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {booking.canCancelBooking ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-green/10 pt-5">
          <button
            type="button"
            disabled={pending}
            onClick={handleCancelBooking}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            Avboka hela bokningen
          </button>
          <Link
            href="/tjanster/stad"
            className="text-sm font-semibold text-green/60 transition hover:text-gold"
          >
            Boka ny tid istället
          </Link>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {feedback ? <p className="mt-4 text-sm text-green">{feedback}</p> : null}
    </article>
  );
}

function VisitRescheduleFields({
  visitId,
  originalDate,
  currentTime,
  draft,
  pending,
  onChange,
  onSave,
  onCancel,
}: {
  visitId: string;
  originalDate: string;
  currentTime: string;
  draft: { date: string; time: string; times: string[] };
  pending: boolean;
  onChange: (next: { date: string; time: string; times: string[] }) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    let cancelled = false;

    async function loadTimes() {
      const times = await getVisitTimesAction(draft.date);
      if (cancelled) return;

      const merged =
        draft.date === originalDate
          ? Array.from(new Set([...times, currentTime])).sort()
          : times;

      onChange({
        date: draft.date,
        times: merged,
        time: merged.includes(draft.time) ? draft.time : merged[0] ?? draft.time,
      });
    }

    void loadTimes();

    return () => {
      cancelled = true;
    };
  }, [draft.date, visitId, originalDate, currentTime]);

  return (
    <div className="grid gap-3 rounded-xl border border-green/10 bg-white p-4 sm:grid-cols-2">
      <label className="block">
        <span className="font-semibold text-green">Nytt datum</span>
        <input
          type="date"
          className={fieldClassName}
          value={draft.date}
          min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
          onChange={(event) =>
            onChange({ ...draft, date: event.target.value, times: [] })
          }
        />
      </label>
      <label className="block">
        <span className="font-semibold text-green">Ny tid</span>
        <select
          className={fieldClassName}
          value={draft.time}
          onChange={(event) => onChange({ ...draft, time: event.target.value })}
        >
          {(draft.times.length > 0 ? draft.times : [draft.time]).map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          type="button"
          disabled={pending}
          onClick={onSave}
          className="rounded-full bg-green px-4 py-2 text-xs font-bold text-white transition hover:bg-ink disabled:opacity-60"
        >
          Bekräfta flytt
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="rounded-full border border-green/15 px-4 py-2 text-xs font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
