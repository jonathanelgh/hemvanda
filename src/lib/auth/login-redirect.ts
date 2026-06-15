export function resolveSafeRedirectPath(next?: string | null, fallback = "/mitt-konto") {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return fallback;
}

export function buildAuthConfirmUrl(redirectTo: string) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return `${origin}/auth/confirm?next=${encodeURIComponent(redirectTo)}`;
}
