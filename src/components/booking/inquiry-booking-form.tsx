"use client";

import { useState } from "react";
import {
  bookingSectionClassName,
  bookingSuccessClassName,
} from "@/components/booking/booking-styles";
import type { BookingParams } from "@/lib/booking";
import { serviceDisplayName } from "@/lib/booking";
import { getService } from "@/lib/services";

type InquiryBookingFormProps = BookingParams;

const fieldClassName =
  "h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70";
const labelClassName =
  "mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60";

export function InquiryBookingForm({
  tjanst,
  postnummer,
  kommun,
}: InquiryBookingFormProps) {
  const service = getService(tjanst);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [timeframe, setTimeframe] = useState("snarast");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/booking/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tjanst,
          postnummer,
          kommun,
          name,
          phone,
          email,
          timeframe,
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
          Vi återkommer till dig med förslag och nästa steg för{" "}
          {service ? serviceDisplayName(service).toLowerCase() : "din tjänst"} i{" "}
          {kommun}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={bookingSectionClassName}>
        <h2 className="font-display text-2xl text-green">Berätta vad du behöver</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          För {service ? serviceDisplayName(service).toLowerCase() : "den här tjänsten"}{" "}
          tar vi emot din förfrågan och återkommer med offert eller förslag på upplägg.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
            <span className={labelClassName}>När behöver du hjälp?</span>
            <select
              value={timeframe}
              onChange={(event) => setTimeframe(event.target.value)}
              className={fieldClassName}
            >
              <option value="snarast">Snarast möjligt</option>
              <option value="inom-2-veckor">Inom 2 veckor</option>
              <option value="inom-1-manad">Inom 1 månad</option>
              <option value="flexibel">Flexibel tid</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClassName}>Beskriv uppdraget</span>
            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              placeholder="Beskriv vad du vill få gjort, omfattning och eventuella önskemål."
              className="w-full rounded-xl border border-green/15 bg-white px-5 py-4 text-base text-green outline-none placeholder:text-muted/70"
            />
          </label>
        </div>
      </div>

      {status === "error" ? (
        <p className="text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="h-14 w-full rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
      >
        {status === "loading" ? "Skickar..." : "Skicka förfrågan"}
      </button>
    </form>
  );
}
