import type { Metadata } from "next";
import Link from "next/link";
import { BookingSummary } from "@/components/booking/booking-summary";
import { CleaningBookingFlow } from "@/components/booking/cleaning-booking-flow";
import { InquiryBookingForm } from "@/components/booking/inquiry-booking-form";
import { ServiceFaq } from "@/components/booking/service-faq";
import { BookingHeader } from "@/components/booking-header";
import { SiteFooter } from "@/components/site-footer";
import { BRAND_NAME } from "@/lib/brand";
import {
  parseBookingSearchParams,
  resolveBookingContext,
  serviceDisplayName,
} from "@/lib/booking";

export const metadata: Metadata = {
  title: `Boka | ${BRAND_NAME}`,
  description:
    `Boka hemstädning direkt online eller skicka en förfrågan för övriga ${BRAND_NAME}-tjänster.`,
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookingPage({ searchParams }: Props) {
  const params = parseBookingSearchParams(await searchParams);
  const context = resolveBookingContext(params);

  return (
    <div className="min-h-screen bg-background text-green">
      <BookingHeader />
      <main className="py-12 md:py-16">
        {!context.isComplete || !context.service ? (
          <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <section>
              <h1 className="font-display text-5xl leading-tight text-green md:text-6xl">
                Börja med postnummer och tjänst.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted">
                För att boka behöver vi veta var du bor och vilken tjänst du
                vill ha hjälp med. Gå tillbaka till startsidan och välj tjänst
                i bokningsflödet.
              </p>
              <Link
                href="/#boka"
                className="mt-8 inline-flex h-14 items-center rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink"
              >
                Välj tjänst
              </Link>
            </section>
            <section>
              <div className="rounded-xl border border-dashed border-green/20 bg-card p-6 text-sm leading-7 text-muted md:p-8">
                När du har valt postnummer och tjänst visas rätt bokningsformulär
                här. Hemstädning bokas direkt online, övriga tjänster skickas som
                förfrågan till oss.
              </div>
            </section>
          </div>
        ) : context.bookingMode === "web" ? (
          <div className="container-shell max-w-3xl">
            <CleaningBookingFlow
              tjanst={context.service.slug}
              postnummer={context.postnummer}
              kommun={context.kommun}
              plats={context.plats}
            />
          </div>
        ) : (
          <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <section>
              <h1 className="font-display text-5xl leading-tight text-green md:text-6xl">
                Boka {serviceDisplayName(context.service).toLowerCase()}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted">
                Beskriv vad du behöver hjälp med så återkommer vi med förslag,
                offert eller nästa steg.
              </p>
              <ServiceFaq service={context.service} compact />
              <div className="mt-8 lg:hidden">
                <BookingSummary
                  service={context.service}
                  postnummer={context.postnummer}
                  kommun={context.kommun}
                />
              </div>
            </section>
            <section>
              <div className="space-y-6">
                <div className="hidden lg:block">
                  <BookingSummary
                    service={context.service}
                    postnummer={context.postnummer}
                    kommun={context.kommun}
                  />
                </div>
                <InquiryBookingForm
                  tjanst={context.service.slug}
                  postnummer={context.postnummer}
                  kommun={context.kommun}
                />
              </div>
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
