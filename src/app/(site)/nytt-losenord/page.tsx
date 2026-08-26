import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `Nytt lösenord | ${BRAND_NAME}`,
  description: `Välj ett nytt lösenord för Mitt ${BRAND_NAME}.`,
};

export default async function NewPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/glomt-losenord?error=link_expired");
  }

  const { data: teamMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const redirectAfterSave = teamMember ? "/admin" : "/mitt-konto";

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
              Nästan klart.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted">
              Välj ett lösenord du kommer ihåg. Sedan kan du logga in med e-post
              och lösenord när du vill.
            </p>
          </section>

          <section className="rounded-xl border border-green/10 bg-card p-6 shadow-[0_24px_80px_rgba(47,58,51,0.14)] md:p-10">
            <ResetPasswordForm redirectTo={redirectAfterSave} />
          </section>
        </div>
      </div>
    </main>
  );
}
