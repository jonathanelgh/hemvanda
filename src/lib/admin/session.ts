import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { TeamRole } from "@/lib/admin/auth";

export type TeamMembership = {
  role: TeamRole;
  jobTitle: string | null;
  isActive: boolean;
};

export async function getTeamMembership(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<TeamMembership | null> {
  const { data } = await supabase
    .from("team_members")
    .select("role, job_title, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    !data ||
    !data.is_active ||
    (data.role !== "admin" && data.role !== "staff")
  ) {
    return null;
  }

  return {
    role: data.role,
    jobTitle: data.job_title,
    isActive: data.is_active,
  };
}
