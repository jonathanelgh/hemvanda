"use server";

import { revalidatePath } from "next/cache";
import { getAdminActor } from "@/lib/admin/auth";
import { inviteTeamMember, setTeamMemberActive } from "@/lib/admin/team";

export async function inviteTeamMemberAction(formData: FormData) {
  const actor = await getAdminActor();

  if (!actor) {
    return { ok: false, error: "Endast administratörer kan bjuda in teammedlemmar." };
  }

  const role = formData.get("role");

  const result = await inviteTeamMember({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    role: role === "admin" ? "admin" : "staff",
    jobTitle: String(formData.get("jobTitle") ?? ""),
    invitedBy: actor.user.id,
  });

  if (result.ok) {
    revalidatePath("/admin/team");
  }

  return result;
}

export async function setTeamMemberActiveAction(
  teamMemberId: string,
  isActive: boolean,
) {
  const actor = await getAdminActor();

  if (!actor) {
    return { ok: false, error: "Endast administratörer kan hantera teammedlemmar." };
  }

  const result = await setTeamMemberActive(
    teamMemberId,
    isActive,
    actor.user.id,
  );

  if (result.ok) {
    revalidatePath("/admin/team");
  }

  return result;
}
