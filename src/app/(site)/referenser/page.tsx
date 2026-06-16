import type { Metadata } from "next";
import Link from "next/link";
import { ShowcaseCard } from "@/components/showcase/showcase-card";
import { SectionHeading } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listPublishedShowcases } from "@/lib/db/showcases";
import { buildPageMetadata } from "@/lib/seo";
import { services } from "@/lib/services";

type ReferenserPageProps = {
  searchParams: Promise<{ tjanst?: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Referenser",
  description:
    "Se tidigare jobb och projekt från HemVända – städ, hantverk, renovering och mer.",
  path: "/referenser",
});

export default async function ReferenserPage({ searchParams }: ReferenserPageProps) {
  const { tjanst } = await searchParams;
  const serviceSlug = tjanst?.trim() || undefined;
  const showcases = await listPublishedShowcases(serviceSlug);
  const activeService = serviceSlug
    ? services.find((service) => service.slug === serviceSlug)
    : null;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-green/10 bg-card py-16 sm:py-20">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Referenser"
              title="Tidigare jobb vi är stolta över"
              description="Utforska exempel på vad vi gjort – från städ och renovering till handyman och inredning."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/referenser"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !serviceSlug
                    ? "bg-green text-white"
                    : "border border-green/15 text-green hover:border-gold hover:text-gold"
                }`}
              >
                Alla
              </Link>
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/referenser?tjanst=${service.slug}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    serviceSlug === service.slug
                      ? "bg-green text-white"
                      : "border border-green/15 text-green hover:border-gold hover:text-gold"
                  }`}
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container-shell">
            {activeService ? (
              <p className="mb-8 text-sm text-muted">
                Visar referenser inom{" "}
                <span className="font-semibold text-green">{activeService.title}</span>
              </p>
            ) : null}

            {showcases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-16 text-center">
                <p className="font-display text-2xl text-green">Inga referenser ännu</p>
                <p className="mt-3 text-sm text-muted">
                  Vi publicerar snart exempel på tidigare jobb här.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {showcases.map((showcase) => (
                  <ShowcaseCard key={showcase.id} showcase={showcase} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
