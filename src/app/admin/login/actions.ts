"use server";

import { redirect } from "next/navigation";
import {
  authenticateAdminLogin,
  buildAdminLoginErrorUrl,
} from "@/lib/admin/login";

export async function adminLoginAction(formData: FormData) {
  const next = String(formData.get("next") ?? "/admin");
  const result = await authenticateAdminLogin(
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? ""),
    next,
  );

  if (result.ok) {
    redirect(result.redirectTo);
  }

  redirect(buildAdminLoginErrorUrl(result.error, next));
}
