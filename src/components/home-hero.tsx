import Link from "next/link";
import { BookingCta } from "@/components/booking-cta";
import { Icon, type IconName } from "@/components/icons";
import { PageHero } from "@/components/page-hero";

const HERO_SERVICES: { label: string; href: string; icon: IconName }[] = [
  { label: "Städ", href: "/tjanster/stad", icon: "broom" },
  {
    label: "Måleri",
    href: "/tjanster/snickeri-bygg-renovering",
    icon: "roller",
  },
  {
    label: "Bygg",
    href: "/tjanster/snickeri-bygg-renovering",
    icon: "hammer",
  },
  {
    label: "Renovering",
    href: "/tjanster/snickeri-bygg-renovering",
    icon: "home",
  },
  { label: "Inredning", href: "/tjanster/inredning", icon: "chair" },
];

export function HomeHero() {
  return (
    <PageHero
      imageSrc="/bg-desktop.webp"
      mobileImageSrc="/bg-mobile.jpg"
      imageClassName="object-cover object-[center_22%] lg:object-center"
      tone="photo"
      contentClassName="flex min-h-[calc(100svh-5.5rem)] flex-col pt-12 pb-6 sm:pt-14 sm:pb-8 lg:min-h-[calc(100vh-5rem)] lg:justify-center lg:py-16"
    >
      <div className="grid w-full flex-1 grid-rows-[auto_1fr] gap-6 sm:gap-8 lg:flex-none lg:grid-cols-[1.15fr_0.85fr] lg:grid-rows-1 lg:items-center lg:gap-14 xl:gap-20">
        <div className="flex w-[80%] max-w-[80%] flex-col justify-start text-left lg:w-full lg:max-w-2xl">
          <h1 className="font-display text-[3.15rem] leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            Förvandlar
            <br />
            hem,{" "}
            <span className="text-gold">skapar känsla</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-ink/80 sm:mt-6 sm:text-lg sm:leading-8 lg:max-w-lg">
            All hjälp ditt hem behöver – samlad på ett ställe.
          </p>

          <ul className="mt-6 flex items-start justify-start gap-5 sm:mt-9 sm:gap-7 lg:gap-8">
            {HERO_SERVICES.map((service) => (
              <li key={service.label} className="shrink-0">
                <Link
                  href={service.href}
                  className="group flex flex-col items-center gap-1.5 text-center text-ink transition hover:text-gold sm:gap-2"
                >
                  <span className="flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11">
                    <Icon
                      name={service.icon}
                      className="h-6 w-6 stroke-[1.5] sm:h-8 sm:w-8"
                    />
                  </span>
                  <span className="text-[10px] font-medium tracking-wide sm:text-xs">
                    {service.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full justify-self-stretch self-end lg:ml-auto lg:max-w-md lg:self-auto xl:max-w-lg">
          <BookingCta compact variant="hero" formId="boka" />
        </div>
      </div>
    </PageHero>
  );
}
