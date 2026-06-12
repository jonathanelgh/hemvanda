import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingCta } from "@/components/booking-cta";
import { Icon } from "@/components/icons";
import { ServiceCard } from "@/components/service-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SectionHeading, ValuesSection } from "@/components/sections";
import { getService, services } from "@/lib/services";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return {};
  }

  return {
    title: service.seo.title,
    description: service.seo.description,
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  const related = services.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-green">
      <SiteHeader />
      <main>
        <section
          className={`relative overflow-hidden py-20 ${service.heroImage ? "" : "bg-ivory"}`}
        >
          {service.heroImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.heroImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
                aria-hidden
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,rgba(248,245,239,0.96)_10%,rgba(248,245,239,0.88)_38%,rgba(248,245,239,0.72)_58%,var(--background)_100%)] lg:hidden" />
              <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--background)_0%,rgba(248,245,239,0.94)_22%,rgba(248,245,239,0.55)_48%,rgba(248,245,239,0.15)_68%,transparent_82%)] lg:block" />
              <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,transparent_0%,transparent_62%,rgba(248,245,239,0.35)_82%,var(--background)_100%)] lg:block" />
              <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_18%_20%,rgba(201,164,106,0.12),transparent_42%)] lg:block" />
            </>
          ) : null}
          <div className="relative z-10 container-shell grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-[0.34em] text-gold ${service.heroImage ? "drop-shadow-[0_1px_8px_rgba(248,245,239,0.85)]" : ""}`}
              >
                {service.eyebrow}
              </p>
              <h1
                className={`mt-5 font-display text-6xl leading-none md:text-8xl ${service.heroImage ? "text-black drop-shadow-[0_1px_12px_rgba(248,245,239,0.85)]" : "text-green"}`}
              >
                {service.title}
              </h1>
              <p
                className={`mt-7 max-w-2xl text-lg leading-8 ${service.heroImage ? "text-black/80 max-lg:text-black/90" : "text-muted"}`}
              >
                {service.hero}
              </p>
            </div>
            <div className="rounded-xl border border-green/10 bg-card p-6 md:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green text-white">
                  <Icon name={service.icon} className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                    Boka {service.title.toLowerCase()}
                  </p>
                  <p className="mt-1 text-sm text-muted">Starta med postnummer</p>
                </div>
              </div>
              <BookingCta compact defaultService={service.slug} formId="boka" />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              eyebrow="Vad ingår?"
              title={service.summary}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {service.includes.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-green/10 bg-card p-6"
                >
                  <span className="text-lg text-gold">—</span>
                  <p className="mt-4 text-sm leading-7 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {service.subServices ? (
          <section className="bg-ivory py-24">
            <div className="container-shell">
              <SectionHeading
                eyebrow="Tjänster inom området"
                title="Specialister vi kan erbjuda."
                description="Övriga tjänster samlar de kompletterande yrkesrollerna som ofta behövs runt ett hemprojekt."
                centered
              />
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {service.subServices.map((item) => (
                  <div
                    key={item}
                    id={item.toLowerCase().replaceAll(" ", "-")}
                    className="rounded-xl border border-green/10 bg-card p-7 text-center"
                  >
                    <p className="font-display text-3xl text-green">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-card py-24">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Process"
              title="Ett tydligt upplägg från första kontakt."
              centered
            />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {service.steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-xl border border-green/10 bg-background p-7"
                >
                  <span className="font-display text-5xl text-gold">
                    0{index + 1}
                  </span>
                  <p className="mt-8 text-base font-semibold leading-7 text-green">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ValuesSection />

        <section className="py-24">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionHeading
              eyebrow="Frågor och svar"
              title={`Vanliga frågor om ${service.title.toLowerCase()}.`}
              description="Här finns den första FAQ-strukturen. Den kan enkelt byggas ut när priser, områden och bokningsregler är klara."
            />
            <div className="space-y-4">
              {service.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border border-green/10 bg-card p-6"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold text-green">
                    {faq.question}
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ivory py-24">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Fler tjänster"
              title="Kombinera fler delar av hemresan."
              centered
            />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <ServiceCard key={item.slug} service={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container-shell rounded-xl bg-green p-8 text-white md:p-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
                  Nästa steg
                </p>
                <h2 className="mt-4 font-display text-5xl leading-tight">
                  Boka {service.title.toLowerCase()} med Hemvanda.
                </h2>
              </div>
              <BookingCta
                compact
                defaultService={service.slug}
                formId="boka-footer"
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
