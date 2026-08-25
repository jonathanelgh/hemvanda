import Link from "next/link";
import {
  BRAND_PHONE_DISPLAY,
  BRAND_PHONE_E164,
} from "@/lib/brand";
import { getNavServices } from "@/lib/services";
import { BrandLogo } from "./brand-logo";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const primaryServices = getNavServices();

  return (
    <header className="sticky top-0 z-50 border-b border-green/10 bg-background/90 backdrop-blur-xl">
      <div className="flex h-9 items-center justify-center bg-green px-4 text-white sm:px-6 lg:px-8">
        <a
          href={`tel:${BRAND_PHONE_E164}`}
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide transition hover:text-gold"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-gold"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>
            Ring oss{" "}
            <span className="font-bold">{BRAND_PHONE_DISPLAY}</span>
          </span>
        </a>
      </div>
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
          <Link href="/om-oss" className="transition hover:text-gold">
            Om oss
          </Link>
          <Link href="/blog" className="transition hover:text-gold">
            Blogg
          </Link>
          <Link href="/referenser" className="transition hover:text-gold">
            Referenser
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
