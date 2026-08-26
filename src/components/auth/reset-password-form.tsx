"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 8;

const fieldClassName =
  "h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green outline-none placeholder:text-muted/70";
const labelClassName =
  "mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60";

type ResetPasswordFormProps = {
  redirectTo?: string;
};

export function ResetPasswordForm({
  redirectTo = "/mitt-konto",
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const isAdminDestination = redirectTo.startsWith("/admin");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Lösenordet måste vara minst ${MIN_PASSWORD_LENGTH} tecken.`);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Länken har gått ut. Begär en ny återställningslänk.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      console.error("updateUser password failed:", updateError.message, updateError.code);
      setError(
        updateError.message.toLowerCase().includes("same password")
          ? "Välj ett annat lösenord än det du hade tidigare."
          : "Kunde inte spara lösenordet. Försök igen eller begär en ny länk.",
      );
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    window.setTimeout(() => {
      router.push(redirectTo);
      router.refresh();
    }, 1200);
  }

  if (done) {
    return (
      <div className="rounded-xl bg-green p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">
          Klart
        </p>
        <h2 className="mt-3 font-display text-4xl">Lösenord sparat</h2>
        <p className="mt-3 text-sm leading-6 text-white/70">
          {isAdminDestination
            ? "Du skickas vidare till adminpanelen."
            : "Du skickas vidare till Mitt HemVända."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-green">Välj nytt lösenord</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Ange ett nytt lösenord för ditt konto. Minst {MIN_PASSWORD_LENGTH} tecken.
        </p>
      </div>

      <label className="block">
        <span className={labelClassName}>Nytt lösenord</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className={labelClassName}>Bekräfta lösenord</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={fieldClassName}
        />
      </label>

      {error ? (
        <div className="space-y-2">
          <p className="text-sm text-red-700">{error}</p>
          {error.includes("gått ut") ? (
            <Link
              href="/glomt-losenord"
              className="inline-flex text-sm font-semibold text-green/60 transition hover:text-gold"
            >
              Begär ny länk
            </Link>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-full bg-gold px-6 text-sm font-bold text-green transition hover:bg-sand disabled:opacity-60"
      >
        {loading ? "Sparar..." : "Spara lösenord"}
      </button>
    </form>
  );
}
