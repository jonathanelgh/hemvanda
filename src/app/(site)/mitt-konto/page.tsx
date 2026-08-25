import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerBookingCard } from "@/components/account/customer-booking-card";
import { CustomerProfileForm } from "@/components/account/customer-profile-form";
import { CustomerSignOutButton } from "@/components/auth/customer-sign-out-button";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/brand";
import { getCustomerSession } from "@/lib/auth/customer";
import {
  getCustomerBookings,
  getCustomerPrimaryAddress,
} from "@/lib/db/customer-bookings";
import { getCustomerLeads } from "@/lib/db/customer-leads";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: `Mitt konto | ${BRAND_NAME}`,
  description: `Se och hantera dina bokningar och uppgifter hos ${BRAND_NAME}.`,
};

function serviceTitle(slug: string) {
  return services.find((service) => service.slug === slug)?.title ?? slug;
}

export default async function CustomerAccountPage() {
  const session = await getCustomerSession();

  if (!session.user || !session.profile) {
    redirect("/logga-in?next=/mitt-konto");
  }

  const [bookings, leads, address] = await Promise.all([
    getCustomerBookings(session.profile.id),
    getCustomerLeads(session.profile.id),
    getCustomerPrimaryAddress(session.profile.id),
  ]);

  const fallbackAddress = bookings.find((booking) => booking.streetAddress);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(201,164,106,0.18),transparent_32%),linear-gradient(135deg,#f8f5ef,#e7e1d6)] px-4 py-8 text-green">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold transition hover:border-gold hover:text-gold"
            >
              Till startsidan
            </Link>
            <CustomerSignOutButton />
          </div>
        </div>

        <section className="mt-12 rounded-xl border border-green/10 bg-card p-6 shadow-[0_24px_80px_rgba(47,58,51,0.12)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-gold">
            Mitt {BRAND_NAME}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-none md:text-6xl">
            Hej{session.profile.fullName ? `, ${session.profile.fullName}` : ""}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Här ser du dina bokningar, kan uppdatera dina uppgifter, lägga till
            instruktioner till städaren samt flytta eller avboka kommande besök.
          </p>
        </section>

        <section className="mt-8 rounded-xl border border-green/10 bg-card p-6 md:p-8">
          <h2 className="font-display text-3xl text-green">Dina uppgifter</h2>
          <p className="mt-2 text-sm text-muted">
            Uppdatera namn, telefon och adress. Ändringar speglas i dina aktiva
            bokningar.
          </p>
          <div className="mt-6">
            <CustomerProfileForm
              fullName={session.profile.fullName ?? ""}
              email={session.profile.email}
              phone={session.profile.phone}
              streetAddress={
                address?.streetAddress ?? fallbackAddress?.streetAddress ?? ""
              }
              postalCode={
                address?.postalCode ?? fallbackAddress?.postalCode ?? ""
              }
              municipality={
                address?.municipality ?? fallbackAddress?.municipality ?? ""
              }
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-green">Dina bokningar</h2>
              <p className="mt-2 text-sm text-muted">
                {bookings.length === 0
                  ? "Du har inga bokningar kopplade till kontot ännu."
                  : `${bookings.length} bokning${bookings.length === 1 ? "" : "ar"}`}
              </p>
            </div>
            <Link
              href="/tjanster/stad"
              className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink"
            >
              Boka ny tjänst
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-green/15 bg-white/70 px-6 py-12 text-center text-sm text-muted">
              När du slutför en bokning kopplas den hit automatiskt till ditt konto.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <CustomerBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="font-display text-3xl text-green">Dina förfrågningar</h2>
            <p className="mt-2 text-sm text-muted">
              {leads.length === 0
                ? "Inga öppna förfrågningar just nu."
                : `${leads.length} förfråg${leads.length === 1 ? "an" : "or"}`}
            </p>
          </div>

          {leads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-green/15 bg-white/70 px-6 py-12 text-center text-sm text-muted">
              När du skickar en förfrågan via webben visas den här tills den blivit
              en bokning.
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <article
                  key={lead.id}
                  className="rounded-xl border border-green/10 bg-white/80 p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                        {lead.leadTypeLabel}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-green">
                        {serviceTitle(lead.serviceSlug)}
                      </h3>
                    </div>
                    <span className="rounded-full bg-ivory px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-green/70">
                      {lead.statusLabel}
                    </span>
                  </div>
                  <dl className="mt-5 grid gap-3 text-sm text-muted sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-green">Ort</dt>
                      <dd className="mt-1">
                        {lead.municipality} ({lead.postalCode})
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-green">Inskickad</dt>
                      <dd className="mt-1">
                        {new Date(lead.createdAt).toLocaleDateString("sv-SE")}
                      </dd>
                    </div>
                    {lead.frequencyLabel ? (
                      <div>
                        <dt className="font-semibold text-green">Frekvens</dt>
                        <dd className="mt-1">{lead.frequencyLabel}</dd>
                      </div>
                    ) : null}
                    {lead.timeframe ? (
                      <div>
                        <dt className="font-semibold text-green">Tidsram</dt>
                        <dd className="mt-1">{lead.timeframe}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {lead.message ? (
                    <p className="mt-4 rounded-xl bg-ivory/70 px-4 py-3 text-sm leading-7 text-green">
                      {lead.message}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
