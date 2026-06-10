import Link from "next/link";
import { services } from "@/lib/services";
import { BrandLogo } from "./brand-logo";

const companyLinks = ["Om Hemvanda", "Trygghet", "Hållbarhet", "Karriär"];
const supportLinks = ["Kontakta oss", "FAQ", "Villkor", "Integritet"];

export function SiteFooter() {
  return (
    <footer className="bg-green text-white">
      <div className="container-shell grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="[&_span]:text-white [&_span:last-child]:text-gold">
            <BrandLogo />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/70">
            Hemvanda hjälper dig att förvandla hemmet med städ, snickeri,
            bygg, renovering, handyman, inredning och utvalda övriga tjänster.
            En kontakt, ett tryggt upplägg och ett hem som känns rätt.
          </p>
          <p className="mt-6 text-sm text-white/70">
            Stockholm med omnejd
            <br />
            info@hemvanda.se
            <br />
            <a href="tel:0701234567" className="transition hover:text-white">
              070 123 45 67
            </a>
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          <FooterColumn title="Våra tjänster">
            {services.map((service) => (
              <Link key={service.slug} href={`/tjanster/${service.slug}`}>
                {service.title}
              </Link>
            ))}
          </FooterColumn>
          <FooterColumn title="Hemvanda">
            {companyLinks.map((link) => (
              <a key={link} href="#">
                {link}
              </a>
            ))}
          </FooterColumn>
          <FooterColumn title="Hjälp">
            {supportLinks.map((link) => (
              <a key={link} href="#">
                {link}
              </a>
            ))}
          </FooterColumn>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <div className="container-shell flex flex-col gap-3 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Hemvanda. Alla rättigheter förbehållna.</span>
          <span>Förvandlar hem, skapar känsla.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-semibold text-gold">{title}</h3>
      <div className="mt-4 flex flex-col gap-3 text-sm text-white/70 [&_a]:transition [&_a:hover]:text-white">
        {children}
      </div>
    </div>
  );
}
