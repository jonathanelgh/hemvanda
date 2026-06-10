"use client";

import { useState } from "react";
import {
  bookingSectionClassName,
  bookingSuccessClassName,
} from "@/components/booking/booking-styles";
import {
  CleaningInfoSections,
  isCleaningInfoComplete,
} from "@/components/booking/cleaning-info-sections";
import {
  CleaningPriceBar,
  cleaningPriceBarSpacerClassName,
} from "@/components/booking/cleaning-price-bar";
import { CleaningSchedulePicker } from "@/components/booking/cleaning-schedule-picker";
import {
  keyAccessOptions,
  type BookingParams,
  type CleaningFrequency,
  type KeyAccess,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
} from "@/lib/booking";

type CleaningDirectFormProps = BookingParams & {
  onBack: () => void;
};

const fieldClassName =
  "h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70";
const labelClassName =
  "mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60";

export function CleaningDirectForm({
  tjanst,
  postnummer,
  kommun,
  onBack,
}: CleaningDirectFormProps) {
  const [subStep, setSubStep] = useState<"info" | "schedule" | "details" | "success">(
    "info",
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [squareMeters, setSquareMeters] = useState("");
  const [hasPets, setHasPets] = useState<PetAnswer | "">("");
  const [frequency, setFrequency] = useState<CleaningFrequency>("varannan-vecka");
  const [tidying, setTidying] = useState<TidyingOption>("nej");
  const [weekdayPreference, setWeekdayPreference] =
    useState<WeekdayPreference>("flexibel");
  const [keyAccess, setKeyAccess] = useState<KeyAccess>("hemma");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const infoComplete = isCleaningInfoComplete(squareMeters, hasPets);

  const priceBar = (
    <CleaningPriceBar
      squareMeters={squareMeters}
      hasPets={hasPets}
      frequency={frequency}
      tidying={tidying}
      weekdayPreference={weekdayPreference}
    />
  );

  function handleInfoContinue(event: React.FormEvent) {
    event.preventDefault();
    if (!infoComplete) return;
    setSubStep("schedule");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleScheduleContinue() {
    if (!selectedDate || !selectedTime) return;
    setSubStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/booking/stad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tjanst,
          postnummer,
          kommun,
          bookingPath: "direct",
          squareMeters: Number(squareMeters),
          hasPets,
          frequency,
          tidying,
          weekdayPreference,
          keyAccess,
          preferredDate: selectedDate,
          preferredTime: selectedTime,
          name,
          phone,
          email,
          address,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Kunde inte slutföra bokningen.");
      }

      setSubStep("success");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Kunde inte slutföra bokningen.",
      );
    }
  }

  if (subStep === "success") {
    return (
      <div className={bookingSuccessClassName}>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
          Bokning mottagen
        </p>
        <h2 className="mt-3 font-display text-3xl text-green md:text-4xl">
          Tack, {name || "vi har tagit emot din bokning"}.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Vi bekräftar din hemstädning och återkommer med exakt tid och pris
          baserat på dina uppgifter.
        </p>
      </div>
    );
  }

  if (subStep === "schedule") {
    return (
      <>
        <div className={cleaningPriceBarSpacerClassName}>
          <CleaningSchedulePicker
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
            onBack={() => setSubStep("info")}
            onContinue={handleScheduleContinue}
          />
        </div>
        {priceBar}
      </>
    );
  }

  if (subStep === "details") {
    return (
      <>
      <form onSubmit={handleSubmit} className={`space-y-8 ${cleaningPriceBarSpacerClassName}`}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-3xl text-green">Slutför bokningen</h2>
          <button
            type="button"
            onClick={() => setSubStep("schedule")}
            className="text-sm font-semibold text-green/60 transition hover:text-gold"
          >
            Tillbaka
          </button>
        </div>

        <section className={bookingSectionClassName}>
          <h3 className="font-display text-2xl text-green">Åtkomst till nycklar</h3>
          <div className="mt-4 grid gap-3">
            {keyAccessOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-4 rounded-lg border border-green/10 bg-white px-4 py-4 transition has-checked:border-gold has-checked:bg-ivory"
              >
                <input
                  type="radio"
                  name="keyAccess"
                  value={option.value}
                  checked={keyAccess === option.value}
                  onChange={() => setKeyAccess(option.value)}
                  className="mt-1 h-4 w-4 shrink-0 accent-gold"
                />
                <span className="text-sm leading-6 text-green">{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={bookingSectionClassName}>
          <h3 className="font-display text-2xl text-green">Kontakt och adress</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClassName}>Namn</span>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={fieldClassName}
              />
            </label>
            <label className="block">
              <span className={labelClassName}>Telefon</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={fieldClassName}
              />
            </label>
            <label className="block">
              <span className={labelClassName}>E-post</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClassName}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClassName}>Adress</span>
              <input
                type="text"
                required
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Gatuadress och nummer"
                className={fieldClassName}
              />
            </label>
          </div>
        </section>

        {status === "error" ? (
          <p className="text-sm text-red-700">{errorMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="h-14 w-full rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
        >
          {status === "loading" ? "Bokar..." : "Boka städning"}
        </button>
      </form>
      {priceBar}
      </>
    );
  }

  return (
    <>
    <form onSubmit={handleInfoContinue} className={`space-y-8 ${cleaningPriceBarSpacerClassName}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl text-green">Städinformation</h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-green/60 transition hover:text-gold"
        >
          Tillbaka
        </button>
      </div>

      <CleaningInfoSections
        squareMeters={squareMeters}
        onSquareMetersChange={setSquareMeters}
        hasPets={hasPets}
        onHasPetsChange={setHasPets}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        tidying={tidying}
        onTidyingChange={setTidying}
        weekdayPreference={weekdayPreference}
        onWeekdayPreferenceChange={setWeekdayPreference}
      />

      <div className="space-y-3">
        <button
          type="submit"
          disabled={!infoComplete}
          className="h-14 w-full rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
        >
          Fortsätt
        </button>
        <p className="text-xs text-muted">*Fyll i dessa fält för att fortsätta</p>
      </div>
    </form>
    {priceBar}
    </>
  );
}
