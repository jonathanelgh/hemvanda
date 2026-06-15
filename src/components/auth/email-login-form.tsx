"use client";

import { useState } from "react";
import { buildAuthConfirmUrl } from "@/lib/auth/login-redirect";
import { createClient } from "@/lib/supabase/client";

type EmailLoginFormProps = {
  redirectTo?: string;
  initialEmail?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EmailLoginForm({
  redirectTo = "/mitt-konto",
  initialEmail = "",
}: EmailLoginFormProps) {
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
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: buildAuthConfirmUrl(redirectTo),
      },
    });

    if (otpError) {
      console.error("signInWithOtp failed:", otpError.message, otpError.code);
      setError(
        otpError.message.toLowerCase().includes("signups not allowed") ||
          otpError.message.toLowerCase().includes("user not found")
          ? "Vi hittar inget konto med den e-postadressen. Boka en tjänst hos oss först så skapar vi ett konto åt dig."
          : "Kunde inte skicka inloggningslänk. Försök igen.",
      );
      setLoading(false);
      return;
    }

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
          <h2 className="mt-3 font-display text-4xl">Länk skickad</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Vi skickade en inloggningslänk till {email.trim()}. Öppna mejlet och
            klicka på länken för att komma till Mitt HemVända.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setError("");
          }}
          className="text-sm font-semibold text-green/60 transition hover:text-gold"
        >
          Skicka till en annan adress
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-green p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">
          Logga in
        </p>
        <h2 className="mt-3 font-display text-4xl">Din e-post</h2>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Ange samma e-postadress som du använde när du bokade. Vi skickar en
          säker inloggningslänk till dig.
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
          className="h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70"
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-full bg-gold px-6 text-sm font-bold text-green transition hover:bg-sand disabled:opacity-60"
      >
        {loading ? "Skickar..." : "Skicka inloggningslänk"}
      </button>
    </form>
  );
}
