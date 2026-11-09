import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND_NAME } from "@/lib/brand";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Vanliga frågor",
  description: `Svar på vanliga frågor om städ, hantverk och bokning hos ${BRAND_NAME}.`,
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-green">
      <SiteHeader />
      <main>
        <PageHero>
          <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">
            FAQ
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] text-green md:text-7xl">
            Vanliga frågor
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted md:text-lg">
            Svar på det vi oftast får höra. Hittar du inte det du söker är du
            välkommen att höra av dig till{" "}
            <a
              href="mailto:info@hemvanda.se"
              className="font-semibold text-green underline decoration-gold underline-offset-4"
            >
              info@hemvanda.se
            </a>
            .
          </p>
        </PageHero>

        <section className="container-shell py-16 md:py-20">
          <div className="space-y-14">
            {services.map((service) => (
              <div key={service.slug}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="font-display text-3xl text-green md:text-4xl">
                    {service.title}
                  </h2>
                  <Link
                    href={`/tjanster/${service.slug}`}
                    className="text-sm font-semibold text-green underline decoration-gold underline-offset-4"
                  >
                    Läs mer om {service.title.toLowerCase()}
                  </Link>
                </div>
                <div className="mt-6 space-y-3">
                  {service.faqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="group rounded-xl border border-green/10 bg-card p-5 md:p-6"
                    >
                      <summary className="cursor-pointer list-none text-base font-semibold text-green [&::-webkit-details-marker]:hidden">
                        {faq.question}
                      </summary>
                      <p className="mt-4 text-sm leading-7 text-muted">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
