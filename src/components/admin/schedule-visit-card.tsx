"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  assignVisitStaffAction,
  getBookingVisitsAction,
  updateVisitNoteAction,
  updateVisitStatusAction,
} from "@/app/admin/(dashboard)/schedule/actions";
import {
  formatDayHeading,
  formatMinutesAsTime,
  parseDateKey,
  parseTimeToMinutes,
  type AssignableStaffMember,
  type BookingVisitItem,
  type ScheduleVisit,
} from "@/lib/admin/schedule";
import { keyAccessOptions } from "@/lib/booking";
import { formatKr } from "@/lib/cleaning-pricing";
import { services } from "@/lib/services";

type TabId = "details" | "upcoming";

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

function formatVisitEndTime(visit: Pick<ScheduleVisit, "visitTime" | "durationMinutes">) {
  const endMinutes = parseTimeToMinutes(visit.visitTime) + visit.durationMinutes;
  return formatMinutesAsTime(endMinutes);
}

function formatAddress(visit: ScheduleVisit) {
  if (visit.streetAddress) {
    return `${visit.streetAddress}, ${visit.postalCode} ${visit.municipality}`;
  }

  return `${visit.postalCode} ${visit.municipality}`;
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className={className}>
      <dt className="font-semibold text-green">{label}</dt>
      <dd className="mt-1 text-muted">{value}</dd>
    </div>
  );
}

type ScheduleVisitCardProps = {
  visit: ScheduleVisit;
  weekStartKey: string;
  staffMembers: AssignableStaffMember[];
  canAssignStaff: boolean;
  onClose: () => void;
};

export function ScheduleVisitCard({
  visit,
  weekStartKey,
  staffMembers,
  canAssignStaff,
  onClose,
}: ScheduleVisitCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [note, setNote] = useState(visit.note ?? "");
  const [noteSaved, setNoteSaved] = useState(false);
  const [upcomingVisits, setUpcomingVisits] = useState<BookingVisitItem[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setNote(visit.note ?? "");
    setNoteSaved(false);
  }, [visit.id, visit.note]);

  useEffect(() => {
    let cancelled = false;

    async function loadUpcoming() {
      setLoadingUpcoming(true);
      const result = await getBookingVisitsAction(visit.bookingId);

      if (!cancelled) {
        if (result.ok) {
          setUpcomingVisits(result.visits);
        }
        setLoadingUpcoming(false);
      }
    }

    void loadUpcoming();

    return () => {
      cancelled = true;
    };
  }, [visit.bookingId, visit.id, visit.status]);

  const keyAccessLabel = visit.keyAccess
    ? keyAccessOptions.find((option) => option.value === visit.keyAccess)?.label
    : null;

  const monthlyPrice =
    visit.quotedMonthlyPriceOre != null
      ? formatKr(visit.quotedMonthlyPriceOre / 100)
      : null;

  function handleStatusChange(status: "scheduled" | "completed") {
    setError("");
    startTransition(async () => {
      const result = await updateVisitStatusAction(visit.id, status, weekStartKey);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (status === "completed") {
        onClose();
      }

      router.refresh();
    });
  }

  function handleSaveNote() {
    setError("");
    setNoteSaved(false);
    startTransition(async () => {
      const result = await updateVisitNoteAction(visit.id, note, weekStartKey);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setNoteSaved(true);
      router.refresh();
    });
  }

  function handleStaffChange(staffId: string | null) {
    if (!canAssignStaff) {
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await assignVisitStaffAction(visit.id, staffId, weekStartKey);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <button
        type="button"
        aria-label="Stäng besökskort"
        className="absolute inset-0 bg-green/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-card-title"
        className="relative flex h-full w-full flex-col bg-white shadow-2xl md:h-[min(90vh,880px)] md:max-w-5xl md:rounded-2xl md:border md:border-green/10"
      >
        <div className="shrink-0 border-b border-green/10 px-5 py-4 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                Besök #{visit.sequenceNumber}
              </p>
              <h2
                id="visit-card-title"
                className="mt-1 truncate font-display text-2xl text-green md:text-3xl"
              >
                {visit.contactName}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green/15 text-lg text-green transition hover:border-gold hover:text-gold"
              aria-label="Stäng"
            >
              ×
            </button>
          </div>

          <div className="mt-4 flex gap-2 border-b border-green/10 pb-px">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                activeTab === "details"
                  ? "border-gold text-green"
                  : "border-transparent text-muted hover:text-green"
              }`}
            >
              Detaljer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                activeTab === "upcoming"
                  ? "border-gold text-green"
                  : "border-transparent text-muted hover:text-green"
              }`}
            >
              Kommande besök
              {upcomingVisits.length > 0 ? (
                <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-green">
                  {upcomingVisits.length}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
          {activeTab === "details" ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-green/10 bg-ivory/50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                  Besök
                </p>
                <p className="mt-3 font-display text-2xl text-green">
                  {formatVisitDate(visit.visitDate)}
                </p>
                <p className="mt-1 text-lg font-semibold text-green">
                  {visit.visitTime}–{formatVisitEndTime(visit)}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">{formatAddress(visit)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green">
                    {visit.durationMinutes} min
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green">
                    {visitStatusLabels[visit.status] ?? visit.status}
                  </span>
                  {visit.frequencyLabel ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green">
                      {visit.frequencyLabel}
                    </span>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-green/10 bg-white p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                  Status
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending || visit.status === "scheduled"}
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
                    disabled={isPending || visit.status === "completed"}
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
              </section>

              <section className="rounded-2xl border border-green/10 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                    Anteckning
                  </h3>
                  {noteSaved ? (
                    <span className="text-xs font-semibold text-green/60">Sparad</span>
                  ) : null}
                </div>
                <textarea
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    setNoteSaved(false);
                  }}
                  rows={4}
                  placeholder="Lägg till en intern anteckning om besöket..."
                  className="mt-4 w-full resize-y rounded-xl border border-green/15 bg-ivory/40 px-4 py-3 text-sm text-green outline-none transition focus:border-gold"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSaveNote}
                  className="mt-3 inline-flex h-10 items-center rounded-full bg-green px-5 text-sm font-semibold text-white transition hover:bg-green/90 disabled:opacity-60"
                >
                  Spara anteckning
                </button>
              </section>

              {canAssignStaff ? (
                <section className="rounded-2xl border border-green/10 bg-ivory/50 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                    Tilldela personal
                  </h3>
                  <label
                    className="mt-4 block text-sm font-semibold text-green"
                    htmlFor="visit-staff"
                  >
                    Ansvarig för besöket
                  </label>
                  <select
                    id="visit-staff"
                    value={visit.staffId ?? ""}
                    disabled={isPending}
                    onChange={(event) => handleStaffChange(event.target.value || null)}
                    className="mt-2 w-full rounded-xl border border-green/15 bg-white px-4 py-3 text-sm font-medium text-green outline-none transition focus:border-gold"
                  >
                    <option value="">Ingen tilldelad</option>
                    {staffMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </section>
              ) : (
                <section className="rounded-2xl border border-green/10 bg-white p-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                    Personal
                  </h3>
                  <p className="mt-3 text-sm text-muted">
                    {visit.staffName ?? "Ej tilldelad"}
                  </p>
                </section>
              )}

              <section>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                  Kund
                </h3>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <DetailRow label="Telefon" value={visit.contactPhone} />
                  <DetailRow label="E-post" value={visit.contactEmail} />
                </dl>
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                  Bokning
                </h3>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <DetailRow label="Tjänst" value={serviceTitle(visit.serviceSlug)} />
                  <DetailRow
                    label="Typ"
                    value={bookingTypeLabels[visit.bookingType] ?? visit.bookingType}
                  />
                  <DetailRow
                    label="Status"
                    value={
                      bookingStatusLabels[visit.bookingStatus] ?? visit.bookingStatus
                    }
                  />
                  <DetailRow
                    label="Städtyp"
                    value={
                      visit.bookingPath
                        ? bookingPathLabels[visit.bookingPath] ?? visit.bookingPath
                        : null
                    }
                  />
                  <DetailRow
                    label="Yta"
                    value={visit.squareMeters ? `${visit.squareMeters} kvm` : null}
                  />
                  <DetailRow
                    label="Husdjur"
                    value={
                      visit.hasPets == null ? null : visit.hasPets ? "Ja" : "Nej"
                    }
                  />
                  <DetailRow label="Ordning" value={visit.tidying} />
                  <DetailRow label="Veckodag" value={visit.weekdayPreference} />
                  <DetailRow label="Nyckelåtkomst" value={keyAccessLabel} />
                  <DetailRow label="Månadspris" value={monthlyPrice} />
                </dl>

                {visit.message ? (
                  <div className="mt-4 rounded-xl bg-ivory/70 px-4 py-3 text-sm leading-7 text-green">
                    {visit.message}
                  </div>
                ) : null}
              </section>
            </div>
          ) : (
            <section>
              {loadingUpcoming ? (
                <p className="text-sm text-muted">Laddar kommande besök...</p>
              ) : upcomingVisits.length === 0 ? (
                <p className="rounded-xl border border-dashed border-green/15 bg-ivory/50 px-4 py-8 text-center text-sm text-muted">
                  Inga fler planerade besök för den här bokningen.
                </p>
              ) : (
                <ul className="space-y-3">
                  {upcomingVisits.map((bookingVisit) => {
                    const isCurrent = bookingVisit.id === visit.id;

                    return (
                      <li
                        key={bookingVisit.id}
                        className={`rounded-2xl border p-4 ${
                          isCurrent
                            ? "border-gold bg-gold/10"
                            : "border-green/10 bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-green">
                              Besök #{bookingVisit.sequenceNumber}
                              {isCurrent ? (
                                <span className="ml-2 text-xs font-bold uppercase tracking-[0.14em] text-gold">
                                  Detta besök
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {formatVisitDate(bookingVisit.visitDate)} ·{" "}
                              {bookingVisit.visitTime}
                            </p>
                          </div>
                          <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-green">
                            {visitStatusLabels[bookingVisit.status] ?? bookingVisit.status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                          <span>{bookingVisit.durationMinutes} min</span>
                          <span>
                            {bookingVisit.staffName ?? "Ej tilldelad"}
                          </span>
                        </div>
                        {bookingVisit.note ? (
                          <p className="mt-3 rounded-lg bg-ivory/70 px-3 py-2 text-sm text-green">
                            {bookingVisit.note}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
