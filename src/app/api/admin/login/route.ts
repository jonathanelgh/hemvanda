import { NextResponse, type NextRequest } from "next/server";
import {
  authenticateAdminLoginWithClient,
  buildAdminLoginErrorUrl,
} from "@/lib/admin/login";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const { supabase, withCookies } = createRouteHandlerClient(request);
  const result = await authenticateAdminLoginWithClient(
    supabase,
    email,
    password,
    next,
  );

  const redirectPath = result.ok
    ? result.redirectTo
    : buildAdminLoginErrorUrl(result.error, next);

  return withCookies(
    NextResponse.redirect(new URL(redirectPath, request.url)),
  );
}
