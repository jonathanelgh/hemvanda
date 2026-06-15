import type { Metadata } from "next";
import Link from "next/link";
import { EmailLoginForm } from "@/components/auth/email-login-form";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/brand";
import { redirectIfCustomerLoggedIn } from "@/lib/auth/customer";
import { resolveSafeRedirectPath } from "@/lib/auth/login-redirect";

export const metadata: Metadata = {
  title: `Logga in | ${BRAND_NAME}`,
  description:
    `Logga in på Mitt ${BRAND_NAME} med e-post och en säker inloggningslänk.`,
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    email?: string;
    error?: string;
  }>;
};

function loginErrorMessage(error?: string) {
  if (error === "link_expired") {
    return "Inloggningslänken har gått ut eller redan använts. Begär en ny länk nedan.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = resolveSafeRedirectPath(params.next);
  const authError = loginErrorMessage(params.error);

  await redirectIfCustomerLoggedIn(redirectTo);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(201,164,106,0.22),transparent_32%),linear-gradient(135deg,#f8f5ef,#e7e1d6)] px-4 py-8 text-green">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold transition hover:border-gold hover:text-gold"
          >
            Till startsidan
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-gold">
              Mitt {BRAND_NAME}
            </p>
            <h1 className="mt-5 max-w-2xl font-display text-6xl leading-none md:text-8xl">
              Logga in med e-post.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted">
              Använd samma e-postadress som vid bokning. Vi skickar en säker
              inloggningslänk så att du snabbt kommer åt dina bokningar och
              uppgifter.
            </p>
          </section>

          <section className="rounded-xl border border-green/10 bg-card p-6 shadow-[0_24px_80px_rgba(47,58,51,0.14)] md:p-10">
            {authError ? (
              <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {authError}
              </p>
            ) : null}
            <EmailLoginForm
              redirectTo={redirectTo}
              initialEmail={params.email}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
