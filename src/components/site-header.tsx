import Link from "next/link";
import { services } from "@/lib/services";
import { BrandLogo } from "./brand-logo";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const otherServices = services.find(
    (service) => service.slug === "ovriga-tjanster",
  );
  const primaryServices = services.filter(
    (service) => service.slug !== "ovriga-tjanster",
  );

  return (
    <header className="sticky top-0 z-50 border-b border-green/10 bg-background/90 backdrop-blur-xl">
      <div className="flex h-20 w-full items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-green/80 lg:flex">
          {primaryServices.map((service) => (
            <Link
              key={service.slug}
              href={`/tjanster/${service.slug}`}
              className="transition hover:text-gold"
            >
              {service.title}
            </Link>
          ))}
          {otherServices ? (
            <div className="group relative">
              <Link
                href={`/tjanster/${otherServices.slug}`}
                className="inline-flex items-center gap-2 py-7 transition hover:text-gold"
              >
                {otherServices.title}
                <span className="text-[0.65rem]" aria-hidden="true">
                  ▾
                </span>
              </Link>
              <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 rounded-lg border border-green/10 bg-card p-3 opacity-0 shadow-[0_24px_70px_rgba(47,58,51,0.16)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <Link
                  href={`/tjanster/${otherServices.slug}`}
                  className="block rounded-md px-4 py-3 text-green transition hover:bg-ivory hover:text-gold"
                >
                  Alla övriga tjänster
                </Link>
                {otherServices.subServices?.map((item) => (
                  <Link
                    key={item}
                    href={`/tjanster/${otherServices.slug}#${item
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                    className="block rounded-md px-4 py-3 text-green/75 transition hover:bg-ivory hover:text-gold"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <Link href="/om-oss" className="transition hover:text-gold">
            Om oss
          </Link>
          <a href="/#sa-fungerar-det" className="transition hover:text-gold">
            Så fungerar det
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/logga-in"
            className="hidden rounded-full border border-green/15 px-5 py-3 text-sm font-semibold text-green/80 transition hover:border-gold hover:text-gold lg:inline-flex"
          >
            Logga in
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
