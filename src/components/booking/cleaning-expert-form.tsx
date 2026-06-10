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
import {
  contactPreferenceOptions,
  type BookingParams,
  type CleaningFrequency,
  type ContactPreference,
  type PetAnswer,
  type TidyingOption,
  type WeekdayPreference,
} from "@/lib/booking";

type CleaningExpertFormProps = BookingParams & {
  onBack: () => void;
};

const fieldClassName =
  "h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70";
const labelClassName =
  "mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60";

export function CleaningExpertForm({
  tjanst,
  postnummer,
  kommun,
  onBack,
}: CleaningExpertFormProps) {
  const [squareMeters, setSquareMeters] = useState("");
  const [hasPets, setHasPets] = useState<PetAnswer | "">("");
  const [frequency, setFrequency] = useState<CleaningFrequency>("varannan-vecka");
  const [tidying, setTidying] = useState<TidyingOption>("nej");
  const [weekdayPreference, setWeekdayPreference] =
    useState<WeekdayPreference>("flexibel");
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>("ring");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const infoComplete = isCleaningInfoComplete(squareMeters, hasPets);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!infoComplete) return;

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
          bookingPath: "expert",
          squareMeters: Number(squareMeters),
          hasPets,
          frequency,
          tidying,
          weekdayPreference,
          contactPreference,
          name,
          phone,
          email,
          address,
          message,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Kunde inte skicka förfrågan.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Kunde inte skicka förfrågan.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className={bookingSuccessClassName}>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
          Förfrågan skickad
        </p>
        <h2 className="mt-3 font-display text-3xl text-green md:text-4xl">
          Tack, vi hör av oss.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          En av våra experter kontaktar dig för att hitta rätt upplägg för din
          hemstädning i {kommun}.
        </p>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} className={`space-y-8 ${cleaningPriceBarSpacerClassName}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl text-green">Kontakta mig</h2>
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

      <section className={bookingSectionClassName}>
        <h3 className="font-display text-2xl text-green">Hur vill du bli kontaktad?</h3>
        <div className="mt-4 grid gap-3">
          {contactPreferenceOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-4 rounded-lg border border-green/10 bg-white px-4 py-4 transition has-checked:border-gold has-checked:bg-ivory"
            >
              <input
                type="radio"
                name="contactPreference"
                value={option.value}
                checked={contactPreference === option.value}
                onChange={() => setContactPreference(option.value)}
                className="mt-1 h-4 w-4 shrink-0 accent-gold"
              />
              <span>
                <span className="block font-semibold text-green">{option.label}</span>
                <span className="mt-1 block text-sm leading-6 text-muted">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className={bookingSectionClassName}>
        <h3 className="font-display text-2xl text-green">Kontaktuppgifter</h3>
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
          <label className="block sm:col-span-2">
            <span className={labelClassName}>Meddelande (valfritt)</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-green/15 bg-white px-5 py-4 text-base text-green outline-none placeholder:text-muted/70"
            />
          </label>
        </div>
      </section>

      {status === "error" ? (
        <p className="text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={status === "loading" || !infoComplete}
          className="h-14 w-full rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
        >
          {status === "loading" ? "Skickar..." : "Skicka förfrågan"}
        </button>
        <p className="text-xs text-muted">*Fyll i dessa fält för att fortsätta</p>
      </div>
    </form>
    <CleaningPriceBar
      squareMeters={squareMeters}
      hasPets={hasPets}
      frequency={frequency}
      tidying={tidying}
      weekdayPreference={weekdayPreference}
    />
    </>
  );
}
