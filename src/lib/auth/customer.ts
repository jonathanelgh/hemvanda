import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CustomerProfile = {
  id: string;
  phone: string | null;
  email: string | null;
  fullName: string | null;
};

export async function getCustomerSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: teamMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (teamMember) {
    return { user, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, phone, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { user, profile: null };
  }

  return {
    user,
    profile: {
      id: profile.id,
      phone: profile.phone ?? user.phone ?? null,
      email: profile.email,
      fullName: profile.full_name,
    } satisfies CustomerProfile,
  };
}

export async function redirectIfCustomerLoggedIn(destination = "/") {
  const session = await getCustomerSession();

  if (session.user && session.profile) {
    redirect(destination);
  }
}
