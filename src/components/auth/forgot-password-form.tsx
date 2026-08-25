"use client";

import Link from "next/link";
import { useState } from "react";
import { buildAuthConfirmUrl } from "@/lib/auth/login-redirect";
import { createClient } from "@/lib/supabase/client";

type ForgotPasswordFormProps = {
  initialEmail?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const fieldClassName =
  "h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70";

export function ForgotPasswordForm({ initialEmail = "" }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setError("Ange en giltig e-postadress.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: buildAuthConfirmUrl("/nytt-losenord"),
      },
    );

    if (resetError) {
      console.error("resetPasswordForEmail failed:", resetError.message, resetError.code);
      setError("Kunde inte skicka återställningsmejl. Försök igen.");
      setLoading(false);
      return;
    }

    // Always show success to avoid revealing whether the email exists.
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-green p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">
            Kolla din inkorg
          </p>
          <h2 className="mt-3 font-display text-4xl">Mejl skickat</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Om det finns ett konto för {email.trim()} får du ett mejl med en länk
            för att välja ett nytt lösenord. Länken gäller en begränsad tid.
          </p>
        </div>
        <Link
          href="/logga-in"
          className="inline-flex text-sm font-semibold text-green/60 transition hover:text-gold"
        >
          Tillbaka till inloggning
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-green">Glömt lösenord</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Ange din e-post så skickar vi en länk för att välja ett nytt lösenord.
          Har du aldrig satt ett lösenord fungerar samma flöde för att skapa ett.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
          E-postadress
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="namn@exempel.se"
          className={fieldClassName}
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-full bg-gold px-6 text-sm font-bold text-green transition hover:bg-sand disabled:opacity-60"
      >
        {loading ? "Skickar..." : "Skicka återställningslänk"}
      </button>

      <Link
        href="/logga-in"
        className="inline-flex text-sm font-semibold text-green/60 transition hover:text-gold"
      >
        Tillbaka till inloggning
      </Link>
    </form>
  );
}
