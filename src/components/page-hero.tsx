import type { ReactNode } from "react";

type PageHeroProps = {
  children: ReactNode;
  imageSrc?: string | null;
  imageClassName?: string;
  fallbackClassName?: string;
};

function HeroGradients() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,rgba(248,245,239,0.96)_10%,rgba(248,245,239,0.88)_38%,rgba(248,245,239,0.72)_58%,var(--background)_100%)] lg:hidden" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--background)_0%,rgba(248,245,239,0.94)_22%,rgba(248,245,239,0.55)_48%,rgba(248,245,239,0.15)_68%,transparent_82%)] lg:block" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,transparent_0%,transparent_62%,rgba(248,245,239,0.35)_82%,var(--background)_100%)] lg:block" />
      <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_18%_20%,rgba(201,164,106,0.12),transparent_42%)] lg:block" />
    </>
  );
}

export function PageHero({
  children,
  imageSrc = "/hemvanda-bg.webp",
  imageClassName = "object-cover object-center",
  fallbackClassName = "bg-ivory",
}: PageHeroProps) {
  const hasImage = Boolean(imageSrc);

  return (
    <section className="relative overflow-hidden">
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc!}
            alt=""
            className={`absolute inset-0 h-full w-full ${imageClassName}`}
            aria-hidden
          />
          <HeroGradients />
        </>
      ) : (
        <div className={`absolute inset-0 ${fallbackClassName}`} />
      )}
      <div className="relative z-10 container-shell flex min-h-[calc(100vh-5rem)] flex-col justify-center py-10">
        {children}
      </div>
    </section>
  );
}
