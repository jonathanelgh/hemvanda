import type { Metadata } from "next";
import Link from "next/link";
import { type EmailOtpType } from "@supabase/supabase-js";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/brand";
import { resolveSafeRedirectPath } from "@/lib/auth/login-redirect";

export const metadata: Metadata = {
  title: `Bekräfta inloggning | ${BRAND_NAME}`,
  description: `Slutför inloggningen till Mitt ${BRAND_NAME}.`,
  robots: { index: false, follow: false },
};

type BekraftaPageProps = {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
};

const ALLOWED_TYPES = new Set<EmailOtpType>([
  "magiclink",
  "email",
  "recovery",
  "signup",
  "invite",
  "email_change",
]);

export default async function AuthBekraftaPage({ searchParams }: BekraftaPageProps) {
  const params = await searchParams;
  const tokenHash = params.token_hash?.trim() ?? "";
  const type = (params.type ?? "") as EmailOtpType;
  const isRecovery = type === "recovery";
  const next = resolveSafeRedirectPath(
    params.next,
    isRecovery ? "/nytt-losenord" : "/mitt-konto",
  );

  const hasValidParams = Boolean(tokenHash) && ALLOWED_TYPES.has(type);
  const confirmHref = hasValidParams
    ? `/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}&next=${encodeURIComponent(next)}`
    : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(201,164,106,0.22),transparent_32%),linear-gradient(135deg,#f8f5ef,#e7e1d6)] px-4 py-8 text-green">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/logga-in"
            className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold transition hover:border-gold hover:text-gold"
          >
            Tillbaka
          </Link>
        </div>

        <section className="my-auto rounded-xl border border-green/10 bg-card p-8 shadow-[0_24px_80px_rgba(47,58,51,0.14)] md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-gold">
            Mitt {BRAND_NAME}
          </p>
          <h1 className="mt-5 font-display text-5xl leading-none md:text-6xl">
            {isRecovery ? "Bekräfta återställning" : "Slutför inloggning"}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            {hasValidParams
              ? isRecovery
                ? "Klicka på knappen nedan för att öppna sidan där du väljer nytt lösenord."
                : "Klicka på knappen nedan för att logga in. Det här steget skyddar mot att e-postfilter förbrukar länken i förväg."
              : "Länken saknar giltiga uppgifter. Begär en ny inloggningslänk från inloggningssidan."}
          </p>

          {confirmHref ? (
            <Link
              href={confirmHref}
              className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-gold px-8 text-sm font-bold text-green transition hover:brightness-105"
            >
              {isRecovery ? "Fortsätt till nytt lösenord" : "Logga in nu"}
            </Link>
          ) : (
            <Link
              href="/logga-in"
              className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-gold px-8 text-sm font-bold text-green transition hover:brightness-105"
            >
              Begär ny länk
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
