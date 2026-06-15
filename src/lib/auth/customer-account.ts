import { randomBytes } from "crypto";
import { normalizePhoneToE164 } from "@/lib/phone";
import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export type EnsureCustomerAccountInput = {
  name: string;
  phone: string;
  email: string;
  address?: string;
  postalCode?: string;
  municipality?: string;
};

export type EnsureCustomerAccountResult = {
  userId: string;
  created: boolean;
};

function generateRandomPassword() {
  return randomBytes(32).toString("base64url");
}

function isDuplicateAuthError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already") ||
    normalized.includes("registered") ||
    normalized.includes("exists")
  );
}

async function listAuthUsers() {
  const admin = createAdminClient();
  const users = [];

  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (data.users.length < 200) {
      break;
    }
  }

  return users;
}

async function findAuthUserIdByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const users = await listAuthUsers();
  const match = users.find((user) => user.email?.toLowerCase() === normalized);

  return match?.id ?? null;
}

async function isActiveTeamMember(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("team_members")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  return Boolean(data);
}

async function ensureProfileRow(
  userId: string,
  input: { name: string; email: string; phone: string | null },
) {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  const profile = {
    full_name: input.name,
    email: input.email,
    phone: input.phone,
  };

  if (existing) {
    await admin.from("profiles").update(profile).eq("id", userId);
    return;
  }

  await admin.from("profiles").insert({
    id: userId,
    ...profile,
  });
}

async function syncCustomerProfile(
  userId: string,
  input: EnsureCustomerAccountInput,
  phoneE164: string | null,
) {
  const admin = createAdminClient();
  const name = input.name.trim();
  const email = input.email.trim();

  await admin.auth.admin.updateUserById(userId, {
    email,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  await ensureProfileRow(userId, { name, email, phone: phoneE164 });

  const address = input.address?.trim();
  const postalCode = input.postalCode?.trim();
  const municipality = input.municipality?.trim();

  if (!address || !postalCode || !municipality) {
    return;
  }

  const { data: existing } = await admin
    .from("customer_addresses")
    .select("id")
    .eq("profile_id", userId)
    .eq("postal_code", postalCode)
    .eq("street_address", address)
    .maybeSingle();

  if (existing) {
    return;
  }

  await admin.from("customer_addresses").insert({
    profile_id: userId,
    street_address: address,
    postal_code: postalCode,
    municipality,
    label: "Hem",
    is_primary: true,
  });
}

export async function ensureCustomerAccount(
  input: EnsureCustomerAccountInput,
): Promise<EnsureCustomerAccountResult | null> {
  if (!isSupabaseAdminConfigured()) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY missing; skipping customer account creation.",
    );
    return null;
  }

  const email = input.email.trim();
  if (!email) {
    console.warn("ensureCustomerAccount: missing email.");
    return null;
  }

  const phoneE164 = normalizePhoneToE164(input.phone) || null;
  const admin = createAdminClient();
  let userId = await findAuthUserIdByEmail(email);
  let created = false;

  if (!userId) {
    const { data: createdUser, error } = await admin.auth.admin.createUser({
      email,
      password: generateRandomPassword(),
      email_confirm: true,
      user_metadata: { full_name: input.name.trim() },
    });

    if (error) {
      if (isDuplicateAuthError(error.message)) {
        userId = await findAuthUserIdByEmail(email);
      }

      if (!userId) {
        console.error("ensureCustomerAccount createUser failed:", error.message);
        return null;
      }
    } else if (createdUser.user) {
      userId = createdUser.user.id;
      created = true;
    }
  }

  if (!userId) {
    console.error("ensureCustomerAccount: could not resolve customer user id.");
    return null;
  }

  if (await isActiveTeamMember(userId)) {
    console.warn(
      "ensureCustomerAccount: email belongs to an active staff account, skipping customer link.",
    );
    return null;
  }

  try {
    await syncCustomerProfile(userId, input, phoneE164);
  } catch (error) {
    console.error(
      "ensureCustomerAccount syncCustomerProfile failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }

  return { userId, created };
}
