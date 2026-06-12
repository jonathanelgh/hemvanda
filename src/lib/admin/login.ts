import type { SupabaseClient } from "@supabase/supabase-js";
import { getTeamMembership } from "@/lib/admin/session";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type AdminLoginResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function authenticateAdminLoginWithClient(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string,
  next = "/admin",
): Promise<AdminLoginResult> {
  const normalizedEmail = email.trim();
  const safeNext = next.startsWith("/admin") ? next : "/admin";

  if (!normalizedEmail || !password) {
    return { ok: false, error: "E-post och lösenord krävs." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (signInError) {
    return { ok: false, error: "Fel e-post eller lösenord." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Inloggningen misslyckades. Försök igen." };
  }

  const membership = await getTeamMembership(supabase, user.id);

  if (!membership) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error:
        "Kontot har inte åtkomst till admin. Kontakta en administratör för att bli tillagd i teamet.",
    };
  }

  return { ok: true, redirectTo: safeNext };
}

export async function authenticateAdminLogin(
  email: string,
  password: string,
  next = "/admin",
): Promise<AdminLoginResult> {
  const supabase = await createClient();
  return authenticateAdminLoginWithClient(supabase, email, password, next);
}

export function getAdminLoginErrorCode(error: string) {
  if (error === "E-post och lösenord krävs.") {
    return "missing_fields";
  }

  if (error === "Fel e-post eller lösenord.") {
    return "invalid_credentials";
  }

  if (error.includes("åtkomst till admin")) {
    return "no_access";
  }

  return "unknown";
}

export function buildAdminLoginErrorUrl(error: string, next: string) {
  const safeNext = next.startsWith("/admin") ? next : "/admin";
  const params = new URLSearchParams({
    error: getAdminLoginErrorCode(error),
    next: safeNext,
  });

  return `/admin/login?${params.toString()}`;
}
