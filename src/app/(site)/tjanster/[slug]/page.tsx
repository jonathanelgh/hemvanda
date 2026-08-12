import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingCta } from "@/components/booking-cta";
import { BlogPostsSection } from "@/components/blog/blog-posts-section";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { ServiceCard } from "@/components/service-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SectionHeading, ValuesSection } from "@/components/sections";
import { BRAND_NAME } from "@/lib/brand";
import { getService, services } from "@/lib/services";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export const revalidate = 60;

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
        <PageHero
          imageSrc={service.heroImage ?? "/hemvanda-bg.webp"}
          imageClassName="object-cover object-center"
        >
          <div className="grid w-full items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-gold drop-shadow-[0_1px_8px_rgba(248,245,239,0.85)]">
                {service.eyebrow}
              </p>
              <h1 className="mt-5 font-display text-6xl leading-none text-black drop-shadow-[0_1px_12px_rgba(248,245,239,0.85)] md:text-8xl">
                {service.title}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-black/80 max-lg:text-black/90">
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
        </PageHero>

        <section className="py-24">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              eyebrow="Vad ingår?"
              title={service.summaryTitle}
              description={service.summary}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {service.includes.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-green/10 bg-card p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-background text-green">
                    <Icon name={item.icon} className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted">{item.label}</p>
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
              description={`Svar på det vi oftast får höra om ${service.title.toLowerCase()} – från pris och bokning till hur vi arbetar.`}
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

        <BlogPostsSection />

        <section className="py-24">
          <div className="container-shell rounded-xl bg-green p-8 text-white md:p-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
                  Nästa steg
                </p>
                <h2 className="mt-4 font-display text-5xl leading-tight">
                  Boka {service.title.toLowerCase()} med {BRAND_NAME}.
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
