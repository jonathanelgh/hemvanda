import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND_NAME } from "@/lib/brand";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

type LegalDocumentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

export function LegalDocumentPage({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}: LegalDocumentPageProps) {
  return (
    <div className="min-h-screen bg-background text-green">
      <SiteHeader />
      <main>
        <section className="border-b border-green/10 bg-ivory/60 py-16 md:py-20">
          <div className="container-shell max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-gold">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-green md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-8 text-muted">{description}</p>
            <p className="mt-4 text-sm text-muted">Senast uppdaterad: {updatedAt}</p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container-shell max-w-3xl">
            <div className="space-y-12">
              {sections.map((section) => (
                <article key={section.title}>
                  <h2 className="font-display text-2xl text-green md:text-3xl">
                    {section.title}
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="mt-4 text-base leading-8 text-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.list ? (
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-8 text-muted">
                      {section.list.map((item) => (
                        <li key={item.slice(0, 48)}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="mt-16 rounded-xl border border-green/10 bg-card p-6 md:p-8">
              <p className="text-sm leading-7 text-muted">
                Har du frågor om {title.toLowerCase()}? Kontakta oss på{" "}
                <a
                  href="mailto:info@hemvanda.se"
                  className="font-semibold text-green transition hover:text-gold"
                >
                  info@hemvanda.se
                </a>
                .
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                {BRAND_NAME} · Stockholm med omnejd
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href="/villkor" className="text-green transition hover:text-gold">
                  Villkor
                </Link>
                <Link href="/integritet" className="text-green transition hover:text-gold">
                  Integritetspolicy
                </Link>
                <Link href="/om-oss" className="text-green transition hover:text-gold">
                  Om oss
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
