"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneDisplay, normalizePhoneToE164 } from "@/lib/phone";

type Step = "phone" | "otp";

export function PhoneLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const normalized = normalizePhoneToE164(phoneInput);

    if (!normalized || normalized.length < 10) {
      setError("Ange ett giltigt svenskt mobilnummer.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalized,
    });

    if (otpError) {
      setError("Kunde inte skicka SMS-kod. Försök igen.");
      setLoading(false);
      return;
    }

    setPhoneE164(normalized);
    setStep("otp");
    setLoading(false);
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (otp.trim().length < 6) {
      setError("Ange den sexsiffriga koden.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phoneE164,
      token: otp.trim(),
      type: "sms",
    });

    if (verifyError) {
      setError("Fel kod. Kontrollera SMS:et och försök igen.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-6">
        <div className="rounded-xl bg-green p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">
            Steg 2
          </p>
          <h2 className="mt-3 font-display text-4xl">Verifiera koden</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Vi skickade en kod till {formatPhoneDisplay(phoneE164)}.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
            SMS-kod
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="h-14 w-full rounded-full border border-green/15 bg-white px-5 text-center text-2xl font-semibold tracking-[0.35em] text-green outline-none"
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-full bg-gold px-6 text-sm font-bold text-green transition hover:bg-sand disabled:opacity-60"
        >
          {loading ? "Verifierar..." : "Logga in"}
        </button>

        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setOtp("");
            setError("");
          }}
          className="text-sm font-semibold text-green/60 transition hover:text-gold"
        >
          Byt telefonnummer
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="space-y-6">
      <div className="rounded-xl bg-green p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">
          Steg 1
        </p>
        <h2 className="mt-3 font-display text-4xl">Ditt telefonnummer</h2>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Ange mobilnummer så skickar vi en engångskod via SMS.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
          Mobilnummer
        </span>
        <input
          type="tel"
          required
          value={phoneInput}
          onChange={(event) => setPhoneInput(event.target.value)}
          placeholder="070 123 45 67"
          className="h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70"
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-full bg-gold px-6 text-sm font-bold text-green transition hover:bg-sand disabled:opacity-60"
      >
        {loading ? "Skickar..." : "Skicka kod"}
      </button>
    </form>
  );
}
