import { BRAND_NAME } from "@/lib/brand";

const errorMessages: Record<string, string> = {
  missing_fields: "E-post och lösenord krävs.",
  invalid_credentials: "Fel e-post eller lösenord.",
  no_access:
    "Kontot har inte åtkomst till admin. Kontakta en administratör för att bli tillagd i teamet.",
  unknown: "Inloggningen misslyckades. Försök igen.",
};

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/admin") ? params.next : "/admin";
  const errorMessage = params.error ? errorMessages[params.error] : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(201,164,106,0.18),transparent_35%),linear-gradient(135deg,#f8f5ef,#e7e1d6)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-green/10 bg-card p-8 shadow-[0_24px_80px_rgba(47,58,51,0.12)]">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
          {BRAND_NAME} CRM
        </p>
        <h1 className="mt-3 font-display text-4xl text-green">Logga in</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          För administratörer och personal. Kundinloggning sker separat via
          telefon.
        </p>

        <form action="/api/admin/login" method="post" className="mt-8 space-y-5">
          <input type="hidden" name="next" value={nextPath} />

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
              E-post
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-green/15 bg-white px-4 text-green outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-green/60">
              Lösenord
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-green/15 bg-white px-4 text-green outline-none"
            />
          </label>

          {errorMessage ? (
            <p className="text-sm text-red-700">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            className="h-12 w-full rounded-full bg-green text-sm font-bold text-white transition hover:bg-ink"
          >
            Logga in
          </button>
        </form>
      </div>
    </div>
  );
}
