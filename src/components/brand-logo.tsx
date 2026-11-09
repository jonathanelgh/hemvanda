import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <img
        src="/hemvanda-logo.webp"
        alt=""
        width={44}
        height={44}
        className="h-11 w-11"
      />
      <span>
        <span className="block font-display text-3xl leading-none tracking-tight text-green">
          HemVända
        </span>
        <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-gold">
          Vi ger hem nytt liv
        </span>
      </span>
    </Link>
  );
}
