import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND_NAME, BRAND_PHONE_DISPLAY, BRAND_PHONE_E164, BRAND_TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Om oss | ${BRAND_NAME}`,
  description:
    `${BRAND_NAME} samlar städ, hantverk och hemtjänster under ett tak. Läs om vår idé, vårt arbetssätt och varför vi tror på ett hem som känns rätt.`,
};

const pillars = [
  {
    icon: "users" as const,
    title: "Människor som bryr sig",
    text: "Vi jobbar med yrkesstolta team och tydliga rutiner. Du ska känna vem som kommer, vad som ingår och att någon faktiskt lyssnar.",
  },
  {
    icon: "shield" as const,
    title: "Trygghet i varje steg",
    text: "Kollektivavtal, försäkringar och tydliga avtal är grunden – inte ett tillägg. Vi vill att du ska känna dig lugn redan vid första kontakten.",
  },
  {
    icon: "heart" as const,
    title: "Hemmet i centrum",
    text: "Vi tänker inte bara uppdrag, utan helheten: hur hemmet används, vad som ska kännas enklare och vad som gör skillnad i vardagen.",
  },
  {
    icon: "leaf" as const,
    title: "Långsiktigt tänk",
    text: "Bra lösningar håller. Vi väljer material, metoder och samarbeten som står sig över tid – för ditt hem och för miljön.",
  },
];

const promises = [
  {
    label: "En kontakt",
    detail: "Oavsett om du bokar städ, snickeri eller renovering får du ett samlat upplägg – utan att jaga olika aktörer.",
  },
  {
    label: "Tydlig kommunikation",
    detail: "Du ska veta vad som händer, när det händer och vad det kostar. Inga överraskningar i sista minuten.",
  },
  {
    label: "Kvalitet som märks",
    detail: "Vi levererar noggrant arbete med respekt för ditt hem, din tid och dina önskemål.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-green">
      <SiteHeader />
      <main>
        <PageHero>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-gold drop-shadow-[0_1px_8px_rgba(248,245,239,0.85)]">
              Om {BRAND_NAME}
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[0.98] text-black drop-shadow-[0_1px_12px_rgba(248,245,239,0.85)] md:text-7xl">
              {BRAND_TAGLINE}
              <span className="block text-gold">– med omsorg i varje detalj.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-black/80 max-lg:text-black/90">
              Vi startade {BRAND_NAME} med en enkel idé: hemmet förtjänner mer än
              stressade beställningar och otydliga lösningar. Vi samlar det du
              behöver – från städ och hantverk till renovering – i ett tryggt
              sammanhang där kvalitet, känsla och tydlighet går hand i hand.
            </p>
          </div>
        </PageHero>

        <section className="py-24">
          <div className="container-shell grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <SectionHeading
                eyebrow="Vår berättelse"
                title="Ett hem ska kännas som ditt – inte som ett projektnummer."
                description={`${BRAND_NAME} föddes ur vardagsproblem vi själva känner igen: för många kontakter, otydliga offerter och lösningar som inte riktigt hänger ihop. Vi ville skapa något bättre – en partner som tar helheten på allvar.`}
              />
              <div className="mt-10 space-y-5 text-base leading-8 text-muted">
                <p>
                  Därför bygger vi tjänster runt hur människor faktiskt lever i sina
                  hem. Ibland handlar det om återkommande städning som ska fungera
                  smidigt vecka efter vecka. Ibland om en renovering som kräver
                  samordning, hantverkare och tydliga besked längs vägen.
                </p>
                <p>
                  Oavsett uppdrag är målet detsamma: att du ska känna att någon tar
                  ansvar, att arbetet blir rätt gjort och att hemmet får nytt liv –
                  på riktigt.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-green/10 bg-card p-8 shadow-[0_24px_80px_rgba(47,58,51,0.08)] md:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">
                Det vi tror på
              </p>
              <blockquote className="mt-6 font-display text-3xl leading-tight text-green md:text-4xl">
                &ldquo;Ett bra hem handlar inte bara om hur det ser ut – utan om hur
                det känns att vara där.&rdquo;
              </blockquote>
              <p className="mt-6 text-sm leading-7 text-muted">
                Den meningen genomsyrar allt vi gör: bemötande, planering, utförande
                och uppföljning. Vi vill att {BRAND_NAME} ska kännas personligt,
                professionellt och tryggt – varje gång.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-ivory py-24">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Vårt arbetssätt"
              title="Fyra pelare som håller hela upplägget samman."
              description="Vi kombinerar struktur med omtanke – så att du får både effektivitet och en upplevelse som känns mänsklig."
              centered
            />
            <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-xl border border-green/10 bg-card p-7 transition hover:border-gold/40"
                >
                  <Icon name={pillar.icon} className="h-8 w-8 text-gold" />
                  <h3 className="mt-6 text-lg font-semibold text-green">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container-shell grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="grid gap-4">
                {promises.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex gap-5 rounded-xl border border-green/10 bg-card p-6"
                  >
                    <span className="font-display text-4xl leading-none text-gold">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-green">{item.label}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionHeading
                eyebrow="Löftet till dig"
                title="Vi gör det enklare att få hjälp – och svårare att göra fel."
                description="När du vänder dig till oss ska det kännas som att någon tar över ansvaret, inte bara skickar vidare dig till nästa aktör."
              />
              <p className="mt-8 text-base leading-8 text-muted">
                Vi planerar, samordnar och följer upp så att du slipper onödig
                administration. Du får en tydlig väg framåt – oavsett om det gäller
                en enstaka storstäd, ett hantverksuppdrag eller ett större
                renoveringsprojekt.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-green py-24 text-white">
          <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
                Lokalt förankrade
              </p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
                Vi finns där du bor – och bygger långsiktiga relationer.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/72">
                {BRAND_NAME} växer tillsammans med våra kunder i Stockholm med omnejd.
                Vi lär känna områden, bostäder och behov – och blir bättre för varje
                uppdrag vi tar oss an. Det är så vi skapar förtroende som håller över
                tid.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-10">
              <dl className="space-y-6">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                    Verksamhetsområde
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold">Stockholm med omnejd</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                    Tjänster
                  </dt>
                  <dd className="mt-2 text-sm leading-7 text-white/75">
                    Städ, snickeri, bygg & renovering, handyman, inredning och utvalda
                    specialisttjänster – samlat under ett varumärke.
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                    Kontakt
                  </dt>
                  <dd className="mt-2 text-sm leading-7 text-white/75">
                    <a
                      href="mailto:info@hemvanda.se"
                      className="font-semibold text-white transition hover:text-gold"
                    >
                      info@hemvanda.se
                    </a>
                    <br />
                    <a
                      href={`tel:${BRAND_PHONE_E164}`}
                      className="font-semibold text-white transition hover:text-gold"
                    >
                      {BRAND_PHONE_DISPLAY}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container-shell">
            <div className="rounded-xl border border-green/10 bg-card px-8 py-12 text-center md:px-16 md:py-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
                Redo att börja?
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-green md:text-5xl">
                Låt oss hjälpa dig ta nästa steg hemma.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted">
                Berätta vad du behöver – så matchar vi rätt lösning, rätt team och
                rätt tid. Enkelt, tydligt och med omsorg från första klick.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/#boka"
                  className="inline-flex h-14 min-w-44 items-center justify-center rounded-full bg-green px-7 text-sm font-bold text-white transition hover:bg-ink"
                >
                  Boka hjälp
                </Link>
                <Link
                  href="/tjanster/stad"
                  className="inline-flex h-14 min-w-44 items-center justify-center rounded-full border border-green/15 px-7 text-sm font-bold text-green transition hover:border-gold hover:text-gold"
                >
                  Se våra tjänster
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
