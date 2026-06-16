"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createClientAction,
  createScheduleBookingAction,
} from "@/app/admin/(dashboard)/schedule/actions";
import { ScheduleClientCombobox } from "@/components/admin/schedule-client-combobox";
import { ScheduleCreateBookingServiceFields } from "@/components/admin/schedule-create-booking-service-fields";
import type { ScheduleClient } from "@/lib/admin/clients";
import {
  isCleaningServiceSlug,
  requiresManualPricing,
  type AdminPricingMode,
} from "@/lib/admin/schedule-booking";
import {
  formatDayHeading,
  parseDateKey,
  resolveWeekStartKey,
  type AssignableStaffMember,
} from "@/lib/admin/schedule";
import {
  type CleaningFrequency,
  type CleaningPropertyType,
  type KeyAccess,
  type PetAnswer,
  type TidyingOption,
} from "@/lib/booking";
import { services } from "@/lib/services";

type ScheduleCreateBookingModalProps = {
  visitDate: string;
  visitTime: string;
  weekStartKey: string;
  staffMembers: AssignableStaffMember[];
  onClose: () => void;
  allowEditDateTime?: boolean;
};

type ClientMode = "search" | "create";

const emptyNewClient = {
  name: "",
  email: "",
  phone: "",
  streetAddress: "",
  postalCode: "",
  municipality: "",
};

export function ScheduleCreateBookingModal({
  visitDate: initialVisitDate,
  visitTime: initialVisitTime,
  weekStartKey: _weekStartKey,
  staffMembers,
  onClose,
  allowEditDateTime = false,
}: ScheduleCreateBookingModalProps) {
  const router = useRouter();
  const [visitDate, setVisitDate] = useState(initialVisitDate);
  const [visitTime, setVisitTime] = useState(initialVisitTime);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [clientMode, setClientMode] = useState<ClientMode>("search");
  const [selectedClient, setSelectedClient] = useState<ScheduleClient | null>(null);
  const [newClient, setNewClient] = useState(emptyNewClient);
  const [serviceSlug, setServiceSlug] = useState("stad");
  const [cleaningPropertyType, setCleaningPropertyType] =
    useState<CleaningPropertyType>("hem");
  const [frequency, setFrequency] = useState<CleaningFrequency>("varannan-vecka");
  const [squareMeters, setSquareMeters] = useState("80");
  const [hasPets, setHasPets] = useState<PetAnswer | "">("nej");
  const [tidying, setTidying] = useState<TidyingOption>("nej");
  const [keyAccess, setKeyAccess] = useState<KeyAccess>("hemma");
  const [pricingMode, setPricingMode] = useState<AdminPricingMode>("loppande");
  const [fixedPriceKr, setFixedPriceKr] = useState("");
  const [message, setMessage] = useState("");
  const [timeframe, setTimeframe] = useState("flexibel");
  const [durationMinutes, setDurationMinutes] = useState("120");
  const [staffId, setStaffId] = useState("");
  const [note, setNote] = useState("");

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

  async function lookupMunicipality(postalCode: string) {
    const zip = postalCode.replace(/\D/g, "").slice(0, 5);

    if (zip.length !== 5) {
      return;
    }

    try {
      const response = await fetch(`/api/postnummer?zip=${zip}`);
      const data = (await response.json()) as { municipality?: string };

      if (response.ok && data.municipality) {
        setNewClient((current) => ({
          ...current,
          postalCode: zip,
          municipality: data.municipality ?? current.municipality,
        }));
      }
    } catch {
      // Ignore lookup failures.
    }
  }

  function handleCreateClient() {
    setError("");
    startTransition(async () => {
      const result = await createClientAction(newClient);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSelectedClient(result.client);
      setClientMode("search");
      setNewClient(emptyNewClient);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const client = selectedClient;

    if (!client) {
      setError("Välj en kund eller lägg till en ny.");
      return;
    }

    const parsedSquareMeters = Number(squareMeters);
    const parsedDuration = Number(durationMinutes);
    const parsedFixedPrice = fixedPriceKr ? Number(fixedPriceKr) : undefined;
    const needsManualPricing = requiresManualPricing(serviceSlug, cleaningPropertyType);

    startTransition(async () => {
      const weekStartKey = resolveWeekStartKey(visitDate);
      const result = await createScheduleBookingAction({
        serviceSlug,
        profileId: client.profileId,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.streetAddress ?? undefined,
        postalCode: client.postalCode,
        municipality: client.municipality,
        visitDate,
        visitTime,
        weekStartKey,
        staffId: staffId || null,
        note,
        durationMinutes: parsedDuration > 0 ? parsedDuration : 120,
        cleaningPropertyType: isCleaningServiceSlug(serviceSlug)
          ? cleaningPropertyType
          : undefined,
        squareMeters: isCleaningServiceSlug(serviceSlug)
          ? parsedSquareMeters
          : undefined,
        hasPets: isCleaningServiceSlug(serviceSlug) && hasPets ? hasPets : undefined,
        frequency: isCleaningServiceSlug(serviceSlug) ? frequency : undefined,
        tidying: isCleaningServiceSlug(serviceSlug) ? tidying : undefined,
        keyAccess: isCleaningServiceSlug(serviceSlug) ? keyAccess : undefined,
        pricingMode: needsManualPricing || !isCleaningServiceSlug(serviceSlug)
          ? pricingMode
          : undefined,
        fixedPriceKr:
          (needsManualPricing || !isCleaningServiceSlug(serviceSlug)) &&
          pricingMode === "fixed"
            ? parsedFixedPrice
            : undefined,
        message: !isCleaningServiceSlug(serviceSlug) ? message : undefined,
        timeframe: !isCleaningServiceSlug(serviceSlug) ? timeframe : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <button
        type="button"
        aria-label="Stäng"
        className="absolute inset-0 bg-green/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-booking-title"
        className="relative flex h-full w-full flex-col bg-white shadow-2xl md:h-[min(92vh,900px)] md:max-w-3xl md:rounded-2xl md:border md:border-green/10"
      >
        <div className="shrink-0 border-b border-green/10 px-5 py-4 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                Ny bokning
              </p>
              <h2
                id="create-booking-title"
                className="mt-1 font-display text-2xl text-green md:text-3xl"
              >
                {allowEditDateTime ? "Skapa bokning" : formatDayHeading(parseDateKey(visitDate))}
              </h2>
              {allowEditDateTime ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-green">
                    Datum
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(event) => setVisitDate(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-green/15 bg-white px-4 py-3 text-sm text-green outline-none transition focus:border-gold"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-green">
                    Tid
                    <input
                      type="time"
                      value={visitTime}
                      onChange={(event) => setVisitTime(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-green/15 bg-white px-4 py-3 text-sm text-green outline-none transition focus:border-gold"
                    />
                  </label>
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted">Kl. {visitTime}</p>
              )}
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
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 md:px-6">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                Tjänst
              </h3>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-green">Välj tjänst</span>
                <select
                  value={serviceSlug}
                  onChange={(event) => {
                    setServiceSlug(event.target.value);
                    setError("");
                  }}
                  className="mt-1 w-full rounded-xl border border-green/15 bg-white px-4 py-3 text-sm text-green outline-none transition focus:border-gold"
                >
                  {services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-green/50">
                  Kund
                </h3>
                {clientMode === "search" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setClientMode("create");
                      setError("");
                    }}
                    className="text-sm font-semibold text-gold transition hover:text-green"
                  >
                    + Lägg till
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setClientMode("search");
                      setError("");
                    }}
                    className="text-sm font-semibold text-muted transition hover:text-green"
                  >
                    Tillbaka till sök
                  </button>
                )}
              </div>

              {clientMode === "search" ? (
                <ScheduleClientCombobox
                  selectedClient={selectedClient}
                  onSelect={setSelectedClient}
                />
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-green">Namn</span>
                    <input
                      value={newClient.name}
                      onChange={(event) =>
                        setNewClient((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-green/15 px-4 py-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-green">E-post</span>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(event) =>
                        setNewClient((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-green/15 px-4 py-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-green">Telefon</span>
                    <input
                      value={newClient.phone}
                      onChange={(event) =>
                        setNewClient((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-green/15 px-4 py-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-green">Adress</span>
                    <input
                      value={newClient.streetAddress}
                      onChange={(event) =>
                        setNewClient((current) => ({
                          ...current,
                          streetAddress: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-green/15 px-4 py-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-green">Postnummer</span>
                    <input
                      value={newClient.postalCode}
                      onChange={(event) => {
                        const postalCode = event.target.value;
                        setNewClient((current) => ({ ...current, postalCode }));
                        void lookupMunicipality(postalCode);
                      }}
                      className="mt-1 w-full rounded-xl border border-green/15 px-4 py-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-green">Ort</span>
                    <input
                      value={newClient.municipality}
                      onChange={(event) =>
                        setNewClient((current) => ({
                          ...current,
                          municipality: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-green/15 px-4 py-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleCreateClient}
                      className="inline-flex h-10 items-center rounded-full border border-green/15 px-5 text-sm font-semibold text-green transition hover:border-gold disabled:opacity-60"
                    >
                      Spara kund
                    </button>
                  </div>
                </div>
              )}
            </section>

            <ScheduleCreateBookingServiceFields
              serviceSlug={serviceSlug}
              cleaningPropertyType={cleaningPropertyType}
              onCleaningPropertyTypeChange={setCleaningPropertyType}
              squareMeters={squareMeters}
              onSquareMetersChange={setSquareMeters}
              hasPets={hasPets}
              onHasPetsChange={setHasPets}
              frequency={frequency}
              onFrequencyChange={setFrequency}
              tidying={tidying}
              onTidyingChange={setTidying}
              keyAccess={keyAccess}
              onKeyAccessChange={setKeyAccess}
              pricingMode={pricingMode}
              onPricingModeChange={setPricingMode}
              fixedPriceKr={fixedPriceKr}
              onFixedPriceKrChange={setFixedPriceKr}
              message={message}
              onMessageChange={setMessage}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              durationMinutes={durationMinutes}
              onDurationMinutesChange={setDurationMinutes}
              staffId={staffId}
              onStaffIdChange={setStaffId}
              note={note}
              onNoteChange={setNote}
              staffMembers={staffMembers}
            />

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </div>

          <div className="shrink-0 border-t border-green/10 px-5 py-4 md:px-6">
            <button
              type="submit"
              disabled={isPending || !selectedClient}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-green text-sm font-semibold text-white transition hover:bg-green/90 disabled:opacity-60"
            >
              {isPending ? "Skapar bokning..." : "Skapa bokning"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
