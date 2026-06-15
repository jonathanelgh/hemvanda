import Link from "next/link";

type BookingAccountSuccessNoteProps = {
  email?: string;
};

export function BookingAccountSuccessNote({ email }: BookingAccountSuccessNoteProps) {
  const normalizedEmail = email?.trim() ?? "";
  const loginHref = normalizedEmail
    ? `/logga-in?email=${encodeURIComponent(normalizedEmail)}&next=/mitt-konto`
    : "/logga-in?next=/mitt-konto";

  return (
    <div className="mt-6 rounded-xl border border-green/10 bg-ivory/70 p-5">
      <p className="text-sm font-semibold text-green">Ditt kundkonto är skapat</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Vi har skapat ett konto med din e-postadress. Logga in med en
        inloggningslänk för att se dina bokningar och uppgifter.
      </p>
      <Link
        href={loginHref}
        className="mt-4 inline-flex h-12 items-center rounded-full bg-green px-6 text-sm font-bold text-white transition hover:bg-ink"
      >
        Logga in på Mitt HemVända
      </Link>
    </div>
  );
}
