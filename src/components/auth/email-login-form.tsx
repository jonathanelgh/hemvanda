"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildAuthConfirmUrl } from "@/lib/auth/login-redirect";
import { createClient } from "@/lib/supabase/client";

type EmailLoginFormProps = {
  redirectTo?: string;
  initialEmail?: string;
};

type LoginMode = "password" | "magic";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const fieldClassName =
  "h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70";
const labelClassName =
  "mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60";

export function EmailLoginForm({
  redirectTo = "/mitt-konto",
  initialEmail = "",
}: EmailLoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handlePasswordLogin(normalizedEmail: string) {
    if (!password) {
      setError("Ange ditt lösenord.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      console.error("signInWithPassword failed:", signInError.message, signInError.code);
      setError(
        signInError.message.toLowerCase().includes("email not confirmed")
          ? "E-postadressen är inte bekräftad ännu. Använd inloggningslänk eller återställ lösenord."
          : "Fel e-post eller lösenord. Har du inte satt lösenord ännu? Använd glömt lösenord eller inloggningslänk.",
      );
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Inloggningen misslyckades. Försök igen.");
      setLoading(false);
      return;
    }

    const { data: teamMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (teamMember) {
      await supabase.auth.signOut();
      setError("Det här kontot hör till admin. Logga in via adminpanelen istället.");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleMagicLink(normalizedEmail: string) {
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

    setMagicLinkSent(true);
    setLoading(false);
  }

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

    if (mode === "password") {
      await handlePasswordLogin(normalizedEmail);
      return;
    }

    await handleMagicLink(normalizedEmail);
  }

  if (magicLinkSent) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-green p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">
            Kolla din inkorg
          </p>
          <h2 className="mt-3 font-display text-4xl">Länk skickad</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Öppna mejlet vi skickade till {email.trim()} och klicka på länken
            för att gå vidare till Mitt HemVända.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMagicLinkSent(false);
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
      <div>
        <h2 className="font-display text-3xl text-green">Logga in</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Logga in med e-post och lösenord, eller få en engångslänk till inkorgen.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-full border border-green/10 bg-ivory/60 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setError("");
          }}
          className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            mode === "password"
              ? "bg-green text-white"
              : "text-green/70 hover:text-green"
          }`}
        >
          Lösenord
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("magic");
            setError("");
          }}
          className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            mode === "magic"
              ? "bg-green text-white"
              : "text-green/70 hover:text-green"
          }`}
        >
          Inloggningslänk
        </button>
      </div>

      <label className="block">
        <span className={labelClassName}>E-postadress</span>
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

      {mode === "password" ? (
        <label className="block">
          <span className={labelClassName}>Lösenord</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ditt lösenord"
            className={fieldClassName}
          />
          <div className="mt-3 text-right">
            <Link
              href={`/glomt-losenord${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ""}`}
              className="text-sm font-semibold text-green/60 transition hover:text-gold"
            >
              Glömt lösenord?
            </Link>
          </div>
        </label>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-full bg-gold px-6 text-sm font-bold text-green transition hover:bg-sand disabled:opacity-60"
      >
        {loading
          ? mode === "password"
            ? "Loggar in..."
            : "Skickar..."
          : mode === "password"
            ? "Logga in"
            : "Skicka inloggningslänk"}
      </button>
    </form>
  );
}
