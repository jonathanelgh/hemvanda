import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span className="relative flex h-11 w-11 items-end justify-center rounded-full border border-gold/50 text-green transition-colors group-hover:bg-ivory">
        <span className="absolute top-2 h-5 w-5 rotate-45 border-l border-t border-current" />
        <span className="font-display text-2xl leading-none">H</span>
      </span>
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
