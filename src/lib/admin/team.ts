import type { TeamRole } from "@/lib/admin/auth";
import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export type TeamActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

export type InviteTeamMemberInput = {
  email: string;
  password?: string;
  fullName: string;
  role: TeamRole;
  jobTitle?: string;
  invitedBy: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findAuthUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
) {
  const normalized = normalizeEmail(email);

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();

  if (profile) {
    return profile.id;
  }

  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

    if (error || !data.users.length) {
      break;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalized,
    );

    if (match) {
      return match.id;
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function inviteTeamMember(
  input: InviteTeamMemberInput,
): Promise<TeamActionResult> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: "SUPABASE_SERVICE_ROLE_KEY saknas. Teamhantering är inte tillgänglig.",
    };
  }

  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const jobTitle = input.jobTitle?.trim() || null;
  const role = input.role;

  if (!email || !fullName) {
    return { ok: false, error: "E-post och namn krävs." };
  }

  if (role !== "admin" && role !== "staff") {
    return { ok: false, error: "Ogiltig roll." };
  }

  const admin = createAdminClient();
  const existingUserId = await findAuthUserIdByEmail(admin, email);

  if (existingUserId) {
    const { data: existingMembership } = await admin
      .from("team_members")
      .select("id, is_active")
      .eq("user_id", existingUserId)
      .maybeSingle();

    if (existingMembership?.is_active) {
      return { ok: false, error: "Användaren har redan aktiv teamåtkomst." };
    }

    if (existingMembership) {
      const { error } = await admin
        .from("team_members")
        .update({
          role,
          job_title: jobTitle,
          is_active: true,
          invited_by: input.invitedBy,
        })
        .eq("id", existingMembership.id);

      if (error) {
        return { ok: false, error: "Kunde inte återaktivera teammedlem." };
      }
    } else {
      const { error } = await admin.from("team_members").insert({
        user_id: existingUserId,
        role,
        job_title: jobTitle,
        invited_by: input.invitedBy,
      });

      if (error) {
        return { ok: false, error: "Kunde inte lägga till teammedlem." };
      }
    }

    await admin
      .from("profiles")
      .update({ full_name: fullName, email })
      .eq("id", existingUserId);

    return {
      ok: true,
      message: existingMembership
        ? "Teamåtkomst återaktiverad."
        : "Befintlig användare tillagd i teamet.",
    };
  }

  const password = input.password?.trim();

  if (!password || password.length < 8) {
    return {
      ok: false,
      error: "Lösenord krävs (minst 8 tecken) för nya konton.",
    };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return {
      ok: false,
      error: createError?.message || "Kunde inte skapa användarkonto.",
    };
  }

  const userId = created.user.id;

  const { error: membershipError } = await admin.from("team_members").insert({
    user_id: userId,
    role,
    job_title: jobTitle,
    invited_by: input.invitedBy,
  });

  if (membershipError) {
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, error: "Kunde inte ge teamåtkomst." };
  }

  await admin.from("profiles").update({ full_name: fullName, email }).eq("id", userId);

  return { ok: true, message: "Teammedlem inbjuden." };
}

export async function setTeamMemberActive(
  teamMemberId: string,
  isActive: boolean,
  actorUserId: string,
): Promise<TeamActionResult> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: "SUPABASE_SERVICE_ROLE_KEY saknas. Teamhantering är inte tillgänglig.",
    };
  }

  const admin = createAdminClient();

  const { data: member, error: fetchError } = await admin
    .from("team_members")
    .select("id, user_id, is_active")
    .eq("id", teamMemberId)
    .maybeSingle();

  if (fetchError || !member) {
    return { ok: false, error: "Teammedlem hittades inte." };
  }

  if (!isActive && member.user_id === actorUserId) {
    return { ok: false, error: "Du kan inte inaktivera ditt eget konto." };
  }

  if (member.is_active === isActive) {
    return {
      ok: true,
      message: isActive ? "Medlemmen är redan aktiv." : "Medlemmen är redan inaktiv.",
    };
  }

  const { error } = await admin
    .from("team_members")
    .update({ is_active: isActive })
    .eq("id", teamMemberId);

  if (error) {
    return { ok: false, error: "Kunde inte uppdatera status." };
  }

  return {
    ok: true,
    message: isActive ? "Teammedlem aktiverad." : "Teammedlem inaktiverad.",
  };
}
