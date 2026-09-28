import type { ReactNode } from "react";

type PageHeroProps = {
  children: ReactNode;
  imageSrc?: string | null;
  /** Optional mobile-only image; falls back to imageSrc when omitted. */
  mobileImageSrc?: string | null;
  imageClassName?: string;
  fallbackClassName?: string;
  /** Soft wash that keeps the photo visible (homepage mock). */
  tone?: "default" | "photo";
  contentClassName?: string;
  /** Overrides the default container-shell wrapper class. */
  shellClassName?: string;
};

function HeroGradients({ tone }: { tone: "default" | "photo" }) {
  if (tone === "photo") {
    return (
      <>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,245,239,0.42)_0%,rgba(248,245,239,0.18)_22%,rgba(248,245,239,0.32)_55%,rgba(248,245,239,0.82)_100%)] lg:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(248,245,239,0.9)_0%,rgba(248,245,239,0.72)_26%,rgba(248,245,239,0.28)_50%,rgba(248,245,239,0.06)_70%,transparent_86%)] lg:block" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,transparent_0%,transparent_68%,rgba(248,245,239,0.4)_88%,var(--background)_100%)] lg:block" />
      </>
    );
  }

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
  mobileImageSrc = null,
  imageClassName = "object-cover object-center",
  fallbackClassName = "bg-ivory",
  tone = "default",
  contentClassName = "flex min-h-[calc(100vh-5rem)] flex-col justify-center py-10",
  shellClassName = "container-shell",
}: PageHeroProps) {
  const desktopSrc = imageSrc;
  const mobileSrc = mobileImageSrc ?? imageSrc;
  const hasImage = Boolean(desktopSrc || mobileSrc);

  return (
    <section className="relative overflow-hidden">
      {hasImage ? (
        <>
          {mobileSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mobileSrc}
              alt=""
              className={`absolute inset-0 h-full w-full lg:hidden ${imageClassName}`}
              aria-hidden
            />
          ) : null}
          {desktopSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={desktopSrc}
              alt=""
              className={`absolute inset-0 hidden h-full w-full lg:block ${imageClassName}`}
              aria-hidden
            />
          ) : null}
          <HeroGradients tone={tone} />
        </>
      ) : (
        <div className={`absolute inset-0 ${fallbackClassName}`} />
      )}
      <div className={`relative z-10 ${shellClassName} ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
