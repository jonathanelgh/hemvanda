import Link from "next/link";

export function BookingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-green/10 bg-background/90 backdrop-blur-xl">
      <div className="flex h-20 w-full items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/#boka"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green transition hover:text-gold"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Tillbaka
        </Link>
      </div>
    </header>
  );
}
