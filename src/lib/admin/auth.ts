import { redirect } from "next/navigation";
import { getTeamMembership } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";

export type TeamRole = "admin" | "staff";

export type TeamProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: TeamRole;
  jobTitle: string | null;
  isActive: boolean;
};

export async function getTeamSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const membership = await getTeamMembership(supabase, user.id);

  if (!membership) {
    return { user, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { user, profile: null };
  }

  return {
    user,
    profile: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      phone: profile.phone,
      role: membership.role,
      jobTitle: membership.jobTitle,
      isActive: membership.isActive,
    } satisfies TeamProfile,
  };
}

export async function requireTeamSession() {
  const session = await getTeamSession();

  if (!session.user) {
    redirect("/admin/login");
  }

  if (!session.profile) {
    redirect("/admin/login?error=no_access");
  }

  return session as {
    user: NonNullable<typeof session.user>;
    profile: TeamProfile;
  };
}

export async function requireAdminSession() {
  const session = await requireTeamSession();

  if (session.profile.role !== "admin") {
    redirect("/admin");
  }

  return session;
}

export function isAdmin(profile: TeamProfile) {
  return profile.role === "admin";
}

export async function getAdminActor() {
  const session = await getTeamSession();

  if (!session.user || !session.profile || session.profile.role !== "admin") {
    return null;
  }

  return {
    user: session.user,
    profile: session.profile,
  };
}
