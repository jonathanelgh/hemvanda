"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  convertCleaningLeadAction,
  convertServiceLeadAction,
} from "@/app/admin/(dashboard)/leads/actions";
import { keyAccessOptions } from "@/lib/booking";
import { getCleaningFrequencyLabel } from "@/lib/booking-schedule";
import type { LeadRecord } from "@/lib/admin/convert-lead";

const leadStatusLabels: Record<string, string> = {
  submitted: "Inskickad",
  contacted: "Kontaktad",
  converted: "Omvandlad",
  cancelled: "Avbruten",
};

type ConvertLeadPanelProps = {
  lead: LeadRecord;
};

export function ConvertLeadPanel({ lead }: ConvertLeadPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [keyAccess, setKeyAccess] = useState("hemma");
  const [note, setNote] = useState(lead.message ?? "");

  const isConverted = lead.status === "converted" || Boolean(lead.convertedBookingId);

  function handleCleaningSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("preferredDate", preferredDate);
    formData.set("preferredTime", preferredTime);
    formData.set("keyAccess", keyAccess);

    startTransition(async () => {
      const result = await convertCleaningLeadAction(lead.id, formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/admin/bookings`);
      router.refresh();
    });
  }

  function handleServiceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("note", note);

    startTransition(async () => {
      const result = await convertServiceLeadAction(lead.id, formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/admin/bookings`);
      router.refresh();
    });
  }

  if (isConverted && lead.convertedBookingId) {
    return (
      <div className="rounded-2xl border border-green/10 bg-ivory/50 p-5">
        <p className="text-sm font-semibold text-green">Leaden är omvandlad till bokning.</p>
        <Link
          href="/admin/bookings"
          className="mt-3 inline-flex text-sm font-semibold text-gold transition hover:text-green"
        >
          Visa bokningar
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
      <h2 className="font-display text-2xl text-green">Skapa bokning från lead</h2>
      <p className="mt-2 text-sm text-muted">
        Leadstatus: {leadStatusLabels[lead.status] ?? lead.status}
      </p>

      {lead.leadType === "cleaning_expert" && lead.cleaningDetails ? (
        <form onSubmit={handleCleaningSubmit} className="mt-6 space-y-5">
          <dl className="grid gap-3 rounded-xl bg-ivory/60 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-green">Yta</dt>
              <dd className="mt-1 text-muted">{lead.cleaningDetails.squareMeters} kvm</dd>
            </div>
            <div>
              <dt className="font-semibold text-green">Frekvens</dt>
              <dd className="mt-1 text-muted">
                {getCleaningFrequencyLabel(lead.cleaningDetails.frequency)}
              </dd>
            </div>
          </dl>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
                Startdatum
              </span>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(event) => setPreferredDate(event.target.value)}
                className="h-12 w-full rounded-full border border-green/15 bg-white px-4 text-green outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
                Tid
              </span>
              <input
                type="time"
                required
                value={preferredTime}
                onChange={(event) => setPreferredTime(event.target.value)}
                className="h-12 w-full rounded-full border border-green/15 bg-white px-4 text-green outline-none"
              />
            </label>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-xs font-bold uppercase tracking-[0.2em] text-green/60">
              Nyckelåtkomst
            </legend>
            {keyAccessOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-green/10 bg-ivory/40 px-4 py-3"
              >
                <input
                  type="radio"
                  name="keyAccess"
                  value={option.value}
                  checked={keyAccess === option.value}
                  onChange={() => setKeyAccess(option.value)}
                  className="mt-1 accent-gold"
                />
                <span className="text-sm text-green">{option.label}</span>
              </label>
            ))}
          </fieldset>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="h-12 rounded-full bg-green px-6 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
          >
            {isPending ? "Skapar bokning..." : "Skapa städbokning"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleServiceSubmit} className="mt-6 space-y-5">
          {lead.serviceDetails ? (
            <p className="rounded-xl bg-ivory/60 px-4 py-3 text-sm text-muted">
              Önskad tidsram: {lead.serviceDetails.timeframe}
            </p>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
              Anteckning till bokning
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-green/15 bg-white px-4 py-3 text-sm text-green outline-none"
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="h-12 rounded-full bg-green px-6 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
          >
            {isPending ? "Skapar bokning..." : "Skapa bokning"}
          </button>
        </form>
      )}
    </div>
  );
}
