import Link from "next/link";
import { BookingCta } from "@/components/booking-cta";
import { ServiceCard } from "@/components/service-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SectionHeading, StepsSection, ValuesSection } from "@/components/sections";
import { BRAND_NAME } from "@/lib/brand";
import { services } from "@/lib/services";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-green">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hemvanda-bg.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_22%] lg:object-center"
            aria-hidden
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,rgba(248,245,239,0.96)_10%,rgba(248,245,239,0.88)_38%,rgba(248,245,239,0.72)_58%,var(--background)_100%)] lg:hidden" />
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--background)_0%,rgba(248,245,239,0.94)_22%,rgba(248,245,239,0.55)_48%,rgba(248,245,239,0.15)_68%,transparent_82%)] lg:block" />
          <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,transparent_0%,transparent_62%,rgba(248,245,239,0.35)_82%,var(--background)_100%)] lg:block" />
          <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_18%_20%,rgba(201,164,106,0.12),transparent_42%)] lg:block" />
          <div className="relative z-10 container-shell grid min-h-[calc(100vh-5rem)] items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="text-center lg:text-left">
              <h1 className="mx-auto max-w-4xl font-display text-6xl leading-[0.95] tracking-tight text-black drop-shadow-[0_1px_12px_rgba(248,245,239,0.85)] md:text-8xl lg:mx-0">
                Vi ger hem nytt liv.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/80 max-lg:text-black/90 lg:mx-0">
                {BRAND_NAME} samlar städ, snickeri, bygg, renovering, handyman och
                inredning i ett tryggt upplägg. När hemmet behöver mer kan vi
                även hjälpa med rörmokare, elektriker, besiktningsman och flytt.
              </p>
            </div>
            <div className="flex w-full items-center">
              <BookingCta compact formId="boka" />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Våra tjänster"
              title="Allt ditt hem behöver på ett ställe."
              description="Boka en huvudtjänst eller gå via Övriga tjänster när du behöver rörmokare, elektriker, besiktningsman eller flytt."
              centered
            />
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </div>
        </section>

        <ValuesSection />
        <StepsSection />

        <section className="bg-ivory py-24">
          <div className="container-shell grid items-center gap-12 lg:grid-cols-2">
            <div className="rounded-xl bg-green p-8 text-white md:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
                Mitt {BRAND_NAME}
              </p>
              <h2 className="mt-5 font-display text-5xl leading-tight">
                E-posten blir nyckeln till dina bokningar.
              </h2>
              <p className="mt-6 text-base leading-8 text-white/72">
                Logga in med en säker länk till din e-post. Se bokningar,
                uppdatera instruktioner och följ dina uppdrag.
              </p>
              <Link
                href="/logga-in"
                className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-green transition hover:bg-sand"
              >
                Logga in
              </Link>
            </div>
            <div>
              <SectionHeading
                eyebrow={`Varför ${BRAND_NAME}`}
                title="En kontakt för allt som får hemmet att kännas rätt."
                description={`${BRAND_NAME} gör det enkelt att boka trygg hjälp hemma. Vi bygger flödet runt tjänst, plats och behov – från städ och snickeri till bygg, renovering, handyman, inredning och utvalda specialisttjänster.`}
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {["Personlig plan", "Tydlig kommunikation", "Trygga uppdrag", "Premium känsla"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-green/10 bg-card p-5 text-sm font-semibold text-green"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container-shell rounded-xl bg-card p-8 text-center shadow-[0_24px_80px_rgba(47,58,51,0.1)] md:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
              Redo att börja?
            </p>
            <h2 className="mx-auto mt-5 max-w-3xl font-display text-5xl leading-tight text-green md:text-6xl">
              Berätta vad ditt hem behöver.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted">
              Välj postnummer och tjänst så är grunden för bokningsflödet på
              plats.
            </p>
            <div className="mx-auto mt-8 max-w-4xl text-left">
              <BookingCta compact formId="boka-footer" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
