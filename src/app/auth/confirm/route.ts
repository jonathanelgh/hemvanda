import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { resolveSafeRedirectPath } from "@/lib/auth/login-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const defaultNext = type === "recovery" ? "/nytt-losenord" : "/mitt-konto";
  const next = resolveSafeRedirectPath(searchParams.get("next"), defaultNext);
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const expiredPath =
    type === "recovery" || next === "/nytt-losenord"
      ? `/glomt-losenord?error=link_expired`
      : `/logga-in?error=link_expired&next=${encodeURIComponent(next)}`;

  return NextResponse.redirect(`${origin}${expiredPath}`);
}
