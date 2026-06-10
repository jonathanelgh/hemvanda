import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Logga in | Hemvanda",
  description:
    "Logga in eller skapa konto hos Hemvanda med telefonnummer. SMS-verifiering kopplas på i nästa fas.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(201,164,106,0.22),transparent_32%),linear-gradient(135deg,#f8f5ef,#e7e1d6)] px-4 py-8 text-green">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold transition hover:border-gold hover:text-gold"
          >
            Till startsidan
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-gold">
              Mitt Hemvanda
            </p>
            <h1 className="mt-5 max-w-2xl font-display text-6xl leading-none md:text-8xl">
              Logga in med telefon.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted">
              Den här sidan är förberedd för telefonbaserad registrering och
              inloggning. I nästa fas kopplas SMS-kod och kundkonto till ett
              riktigt auth-system.
            </p>
          </section>

          <section className="rounded-xl border border-green/10 bg-card p-6 shadow-[0_24px_80px_rgba(47,58,51,0.14)] md:p-10">
            <div className="rounded-xl bg-green p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">
                Steg 1
              </p>
              <h2 className="mt-3 font-display text-4xl">Ditt telefonnummer</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Ange mobilnummer så skickar Hemvanda senare en engångskod via
                SMS.
              </p>
            </div>

            <form className="mt-8 space-y-6">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
                  Mobilnummer
                </span>
                <input
                  type="tel"
                  placeholder="+46 70 123 45 67"
                  className="h-14 w-full rounded-full border border-green/15 bg-white px-5 text-base text-green placeholder:text-muted/70"
                />
              </label>

              <button
                type="button"
                className="h-14 w-full rounded-full bg-gold px-6 text-sm font-bold text-green transition hover:bg-sand"
              >
                Skicka kod
              </button>

              <div className="rounded-xl border border-dashed border-green/20 bg-background p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-green/60">
                  Steg 2 · Kommer senare
                </p>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((item) => (
                    <input
                      key={item}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      placeholder="0"
                      disabled
                      className="h-14 rounded-md border border-green/10 bg-white text-center text-xl font-semibold text-green disabled:opacity-50"
                    />
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-muted">
                  OTP-fälten är en visuell placeholder. Ingen kod skickas än.
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
