import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerSignOutButton } from "@/components/auth/customer-sign-out-button";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/brand";
import { getCustomerSession } from "@/lib/auth/customer";
import { getCustomerBookings } from "@/lib/db/customer-bookings";
import { getCustomerLeads } from "@/lib/db/customer-leads";
import { formatPhoneDisplay } from "@/lib/phone";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: `Mitt konto | ${BRAND_NAME}`,
  description: `Se dina bokningar och uppgifter hos ${BRAND_NAME}.`,
};

function serviceTitle(slug: string) {
  return services.find((service) => service.slug === slug)?.title ?? slug;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function CustomerAccountPage() {
  const session = await getCustomerSession();

  if (!session.user || !session.profile) {
    redirect("/logga-in?next=/mitt-konto");
  }

  const bookings = await getCustomerBookings(session.profile.id);
  const leads = await getCustomerLeads(session.profile.id);
  const displayPhone = session.profile.phone
    ? formatPhoneDisplay(session.profile.phone)
    : null;

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
            Här ser du dina bokningar och kontaktuppgifter. Logga in med samma
            telefonnummer som du använde när du bokade.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {displayPhone ? (
              <div className="rounded-xl bg-ivory/70 px-5 py-4">
                <dt className="text-xs font-bold uppercase tracking-[0.2em] text-green/60">
                  Telefon
                </dt>
                <dd className="mt-2 text-lg font-semibold text-green">{displayPhone}</dd>
              </div>
            ) : null}
            {session.profile.email ? (
              <div className="rounded-xl bg-ivory/70 px-5 py-4">
                <dt className="text-xs font-bold uppercase tracking-[0.2em] text-green/60">
                  E-post
                </dt>
                <dd className="mt-2 text-lg font-semibold text-green">
                  {session.profile.email}
                </dd>
              </div>
            ) : null}
          </dl>
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
                <article
                  key={booking.id}
                  className="rounded-xl border border-green/10 bg-white/80 p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                        {booking.bookingTypeLabel}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-green">
                        {serviceTitle(booking.serviceSlug)}
                      </h3>
                    </div>
                    <span className="rounded-full bg-ivory px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-green/70">
                      {booking.statusLabel}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-3 text-sm text-muted sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-green">Ort</dt>
                      <dd className="mt-1">
                        {booking.municipality} ({booking.postalCode})
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-green">Inskickad</dt>
                      <dd className="mt-1">
                        {new Date(booking.createdAt).toLocaleDateString("sv-SE")}
                      </dd>
                    </div>
                    {booking.frequencyLabel ? (
                      <div>
                        <dt className="font-semibold text-green">Frekvens</dt>
                        <dd className="mt-1">{booking.frequencyLabel}</dd>
                      </div>
                    ) : null}
                    {booking.preferredDate ? (
                      <div>
                        <dt className="font-semibold text-green">Önskat datum</dt>
                        <dd className="mt-1">{formatDate(booking.preferredDate)}</dd>
                      </div>
                    ) : null}
                    {booking.preferredTime ? (
                      <div>
                        <dt className="font-semibold text-green">Önskad tid</dt>
                        <dd className="mt-1">{booking.preferredTime}</dd>
                      </div>
                    ) : null}
                    {booking.streetAddress ? (
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-green">Adress</dt>
                        <dd className="mt-1">{booking.streetAddress}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {booking.upcomingVisits.length > 0 ? (
                    <div className="mt-5 border-t border-green/10 pt-5">
                      <h4 className="text-sm font-semibold text-green">
                        Kommande städbesök
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {booking.upcomingVisits.slice(0, 4).map((visit) => (
                          <li
                            key={visit.id}
                            className="flex items-center justify-between rounded-lg bg-ivory/70 px-4 py-3 text-sm"
                          >
                            <span className="font-medium text-green">
                              {formatDate(visit.visitDate)}
                            </span>
                            <span className="text-muted">{visit.visitTime}</span>
                          </li>
                        ))}
                      </ul>
                      {booking.upcomingVisits.length > 4 ? (
                        <p className="mt-2 text-xs text-muted">
                          +{booking.upcomingVisits.length - 4} fler besök planerade
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
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
              När du skickar en förfrågan via webben visas den här tills den blivit en bokning.
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
