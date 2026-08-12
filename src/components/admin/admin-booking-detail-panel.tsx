"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  updateBookingContactAction,
  updateBookingStatusAction,
} from "@/app/admin/(dashboard)/bookings/actions";
import {
  assignVisitStaffAction,
  updateVisitNoteAction,
  updateVisitStatusAction,
} from "@/app/admin/(dashboard)/schedule/actions";
import type { AdminBookingDetail } from "@/lib/admin/queries";
import {
  formatDayHeading,
  parseDateKey,
  resolveWeekStartKey,
  type AssignableStaffMember,
} from "@/lib/admin/schedule";
import { keyAccessOptions } from "@/lib/booking";
import { formatKr } from "@/lib/cleaning-pricing";
import { services } from "@/lib/services";

const bookingTypeLabels: Record<string, string> = {
  cleaning_direct: "Direktbokning",
  service_booking: "Tjänstebokning",
};

const bookingStatusLabels: Record<string, string> = {
  submitted: "Inskickad",
  contacted: "Kontaktad",
  confirmed: "Bekräftad",
  cancelled: "Avbokad",
  completed: "Slutförd",
};

const visitStatusLabels: Record<string, string> = {
  scheduled: "Planerat",
  completed: "Utförd",
  cancelled: "Avbokat",
  skipped: "Överhoppat",
};

const bookingPathLabels: Record<string, string> = {
  hem: "Hemstäd",
  flyttstad: "Flyttstäd",
  fonster: "Fönster",
  kontor: "Kontorsstäd",
  ovrigt: "Övrigt",
  storstad: "Storstäd",
};

function serviceTitle(slug: string) {
  return services.find((service) => service.slug === slug)?.title ?? slug;
}

function formatVisitDate(dateKey: string) {
  return formatDayHeading(parseDateKey(dateKey));
}

type AdminBookingDetailPanelProps = {
  booking: AdminBookingDetail;
  staffMembers: AssignableStaffMember[];
  canAssignStaff: boolean;
};

export function AdminBookingDetailPanel({
  booking,
  staffMembers,
  canAssignStaff,
}: AdminBookingDetailPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const [contactName, setContactName] = useState(booking.contactName);
  const [contactPhone, setContactPhone] = useState(booking.contactPhone);
  const [contactEmail, setContactEmail] = useState(booking.contactEmail);
  const [streetAddress, setStreetAddress] = useState(booking.streetAddress ?? "");
  const [postalCode, setPostalCode] = useState(booking.postalCode);
  const [municipality, setMunicipality] = useState(booking.municipality);
  const [message, setMessage] = useState(booking.message ?? "");
  const [status, setStatus] = useState(booking.status);

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>, successMessage: string) {
    setError("");
    setSavedMessage("");
    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }

      setSavedMessage(successMessage);
      router.refresh();
    });
  }

  function handleContactSubmit(formData: FormData) {
    runAction(async () => updateBookingContactAction(booking.id, formData), "Kontaktuppgifter sparade.");
  }

  function handleStatusSave() {
    runAction(
      async () => updateBookingStatusAction(booking.id, status),
      "Status uppdaterad.",
    );
  }

  const keyAccessLabel = booking.cleaningDetails?.keyAccess
    ? keyAccessOptions.find((option) => option.value === booking.cleaningDetails?.keyAccess)?.label
    : null;

  const monthlyPrice =
    booking.cleaningDetails?.quotedMonthlyPriceOre != null
      ? formatKr(booking.cleaningDetails.quotedMonthlyPriceOre / 100)
      : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            {bookingTypeLabels[booking.bookingType] ?? booking.bookingType}
          </p>
          <h2 className="mt-2 font-display text-3xl text-green">{booking.contactName}</h2>
          <p className="mt-2 text-sm text-muted">
            {serviceTitle(booking.serviceSlug)} · {booking.postalCode} {booking.municipality}
          </p>
          <p className="mt-1 text-xs text-muted">
            Skapad{" "}
            {new Intl.DateTimeFormat("sv-SE", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/Stockholm",
            }).format(new Date(booking.createdAt))}
          </p>
        </section>

        <section className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
            Status
          </h3>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="grid flex-1 gap-2 text-sm font-semibold text-green">
              Bokningsstatus
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
              >
                {Object.entries(bookingStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={isPending || status === booking.status}
              onClick={handleStatusSave}
              className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
            >
              Spara status
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
            Kontakt & adress
          </h3>
          <form action={handleContactSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-green sm:col-span-2">
              Namn
              <input
                name="contactName"
                required
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-green">
              Telefon
              <input
                name="contactPhone"
                required
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-green">
              E-post
              <input
                name="contactEmail"
                type="email"
                required
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-green sm:col-span-2">
              Adress
              <input
                name="streetAddress"
                value={streetAddress}
                onChange={(event) => setStreetAddress(event.target.value)}
                className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-green">
              Postnummer
              <input
                name="postalCode"
                required
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-green">
              Ort
              <input
                name="municipality"
                required
                value={municipality}
                onChange={(event) => setMunicipality(event.target.value)}
                className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-green sm:col-span-2">
              Meddelande
              <textarea
                name="message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
              >
                Spara kontaktuppgifter
              </button>
            </div>
          </form>
        </section>

        {booking.cleaningDetails ? (
          <section className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
              Städdetaljer
            </h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <DetailItem
                label="Städtyp"
                value={
                  bookingPathLabels[booking.cleaningDetails.bookingPath] ??
                  booking.cleaningDetails.bookingPath
                }
              />
              <DetailItem label="Frekvens" value={booking.cleaningDetails.frequencyLabel} />
              <DetailItem label="Yta" value={`${booking.cleaningDetails.squareMeters} kvm`} />
              <DetailItem
                label="Husdjur"
                value={booking.cleaningDetails.hasPets ? "Ja" : "Nej"}
              />
              <DetailItem label="Ordning" value={booking.cleaningDetails.tidying} />
              <DetailItem label="Veckodag" value={booking.cleaningDetails.weekdayPreference} />
              <DetailItem label="Nyckelåtkomst" value={keyAccessLabel} />
              <DetailItem label="Månadspris" value={monthlyPrice} />
            </dl>
          </section>
        ) : null}

        {booking.serviceDetails ? (
          <section className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
              Tjänstedetaljer
            </h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <DetailItem label="Tidsram" value={booking.serviceDetails.timeframe} />
              <DetailItem label="Prisupplägg" value={booking.serviceDetails.adminPricingMode} />
            </dl>
          </section>
        ) : null}
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
              Besök
            </h3>
            <Link
              href="/admin/schedule"
              className="text-sm font-semibold text-gold transition hover:text-green"
            >
              Öppna schema →
            </Link>
          </div>

          {booking.visits.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-green/15 bg-ivory/50 px-4 py-8 text-center text-sm text-muted">
              Inga besök registrerade för den här bokningen.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {booking.visits.map((visit) => (
                <BookingVisitEditor
                  key={visit.id}
                  visit={visit}
                  staffMembers={staffMembers}
                  canAssignStaff={canAssignStaff}
                  disabled={isPending}
                  onError={setError}
                  onSaved={() => {
                    setSavedMessage("Besök uppdaterat.");
                    router.refresh();
                  }}
                />
              ))}
            </ul>
          )}
        </section>

        {booking.statusEvents.length > 0 ? (
          <section className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
              Händelser
            </h3>
            <ul className="mt-4 space-y-3">
              {booking.statusEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-green/10 bg-ivory/40 px-4 py-3 text-sm"
                >
                  <p className="font-semibold text-green">
                    {bookingStatusLabels[event.status] ?? event.status}
                  </p>
                  {event.note ? <p className="mt-1 text-muted">{event.note}</p> : null}
                  <p className="mt-2 text-xs text-muted">
                    {new Intl.DateTimeFormat("sv-SE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Europe/Stockholm",
                    }).format(new Date(event.createdAt))}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {error ? (
        <div className="xl:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {savedMessage ? (
        <div className="xl:col-span-2 rounded-xl border border-green/10 bg-ivory/70 px-4 py-3 text-sm text-green">
          {savedMessage}
        </div>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="font-semibold text-green">{label}</dt>
      <dd className="mt-1 text-muted">{value}</dd>
    </div>
  );
}

function BookingVisitEditor({
  visit,
  staffMembers,
  canAssignStaff,
  disabled,
  onError,
  onSaved,
}: {
  visit: AdminBookingDetail["visits"][number];
  staffMembers: AssignableStaffMember[];
  canAssignStaff: boolean;
  disabled: boolean;
  onError: (message: string) => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState(visit.note ?? "");
  const weekStartKey = resolveWeekStartKey(visit.visitDate);

  function handleStaffChange(staffId: string | null) {
    if (!canAssignStaff) {
      return;
    }

    onError("");
    startTransition(async () => {
      const result = await assignVisitStaffAction(visit.id, staffId, weekStartKey);

      if (!result.ok) {
        onError(result.error);
        return;
      }

      onSaved();
    });
  }

  function handleStatusChange(status: "scheduled" | "completed") {
    onError("");
    startTransition(async () => {
      const result = await updateVisitStatusAction(visit.id, status, weekStartKey);

      if (!result.ok) {
        onError(result.error);
        return;
      }

      onSaved();
    });
  }

  function handleSaveNote() {
    onError("");
    startTransition(async () => {
      const result = await updateVisitNoteAction(visit.id, note, weekStartKey);

      if (!result.ok) {
        onError(result.error);
        return;
      }

      onSaved();
    });
  }

  return (
    <li className="rounded-xl border border-green/10 bg-ivory/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-green">
            Besök #{visit.sequenceNumber}
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatVisitDate(visit.visitDate)} · {visit.visitTime}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green">
          {visitStatusLabels[visit.status] ?? visit.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || isPending || visit.status === "scheduled"}
          onClick={() => handleStatusChange("scheduled")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            visit.status === "scheduled"
              ? "bg-green text-white"
              : "border border-green/15 text-green hover:border-gold"
          }`}
        >
          Planerat
        </button>
        <button
          type="button"
          disabled={disabled || isPending || visit.status === "completed"}
          onClick={() => handleStatusChange("completed")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            visit.status === "completed"
              ? "bg-gold text-green"
              : "border border-green/15 text-green hover:border-gold"
          }`}
        >
          Utförd
        </button>
      </div>

      {canAssignStaff ? (
        <label className="mt-4 block text-sm font-semibold text-green">
          Personal
          <select
            value={visit.staffId ?? ""}
            disabled={disabled || isPending}
            onChange={(event) => handleStaffChange(event.target.value || null)}
            className="mt-2 w-full rounded-xl border border-green/10 bg-white px-4 py-3 font-normal text-green"
          >
            <option value="">Ingen tilldelad</option>
            {staffMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="mt-4 text-sm text-muted">{visit.staffName ?? "Ej tilldelad"}</p>
      )}

      <label className="mt-4 block text-sm font-semibold text-green">
        Anteckning
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-xl border border-green/10 bg-white px-4 py-3 font-normal text-green"
        />
      </label>
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={handleSaveNote}
        className="mt-3 rounded-full border border-green/15 px-4 py-2 text-sm font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
      >
        Spara anteckning
      </button>
    </li>
  );
}
