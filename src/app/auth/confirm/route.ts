import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { resolveSafeRedirectPath } from "@/lib/auth/login-redirect";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function createConfirmClient(request: NextRequest, pendingCookies: PendingCookie[]) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.splice(
            0,
            pendingCookies.length,
            ...cookiesToSet.map(({ name, value, options }) => ({
              name,
              value,
              options,
            })),
          );
        },
      },
    },
  );
}

function redirectWithSession(url: string, pendingCookies: PendingCookie[]) {
  const response = NextResponse.redirect(url);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const defaultNext = type === "recovery" ? "/nytt-losenord" : "/mitt-konto";
  const next = resolveSafeRedirectPath(searchParams.get("next"), defaultNext);

  const pendingCookies: PendingCookie[] = [];
  const supabase = createConfirmClient(request, pendingCookies);

  let authenticated = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      authenticated = true;
    } else {
      console.error("auth/confirm exchangeCodeForSession failed:", error.message);
    }
  }

  if (!authenticated && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      authenticated = true;
    } else {
      console.error("auth/confirm verifyOtp failed:", error.message, { type });
    }
  }

  if (authenticated) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && next === "/mitt-konto") {
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (teamMember) {
        await supabase.auth.signOut();
        return redirectWithSession(
          `${origin}/logga-in?error=team_account&next=${encodeURIComponent(next)}`,
          pendingCookies,
        );
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut();
        return redirectWithSession(
          `${origin}/logga-in?error=no_profile&next=${encodeURIComponent(next)}`,
          pendingCookies,
        );
      }
    }

    return redirectWithSession(`${origin}${next}`, pendingCookies);
  }

  const expiredPath =
    type === "recovery" || next === "/nytt-losenord"
      ? `/glomt-losenord?error=link_expired`
      : `/logga-in?error=link_expired&next=${encodeURIComponent(next)}`;

  return NextResponse.redirect(`${origin}${expiredPath}`);
}
