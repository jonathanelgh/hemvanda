import type { Metadata } from "next";
import Link from "next/link";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { BrandLogo } from "@/components/brand-logo";
import { redirectIfCustomerLoggedIn } from "@/lib/auth/customer";

export const metadata: Metadata = {
  title: "Logga in | Hemvanda",
  description:
    "Logga in eller skapa konto hos Hemvanda med telefonnummer och SMS-verifiering.",
};

export default async function LoginPage() {
  await redirectIfCustomerLoggedIn();

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
              Skapa konto eller logga in med ditt mobilnummer. Vi skickar en
              engångskod via SMS så att du snabbt kommer åt dina bokningar och
              uppgifter.
            </p>
          </section>

          <section className="rounded-xl border border-green/10 bg-card p-6 shadow-[0_24px_80px_rgba(47,58,51,0.14)] md:p-10">
            <PhoneLoginForm />
          </section>
        </div>
      </div>
    </main>
  );
}
