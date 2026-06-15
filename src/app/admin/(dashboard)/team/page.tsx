import { AdminShell } from "@/components/admin/admin-shell";
import { InviteTeamMemberForm } from "@/components/admin/invite-team-member-form";
import { TeamMemberCard } from "@/components/admin/team-member-card";
import { requireAdminSession } from "@/lib/admin/auth";
import { listTeamMembers } from "@/lib/admin/queries";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export default async function AdminTeamPage() {
  const { profile, user } = await requireAdminSession();
  const members = await listTeamMembers();
  const adminConfigured = isSupabaseAdminConfigured();

  return (
    <AdminShell
      profile={profile}
      title="Team"
    >
      {!adminConfigured ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-800">
          Lägg till <code className="rounded bg-white px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          i <code className="rounded bg-white px-1.5 py-0.5 text-xs">.env.local</code>{" "}
          för att kunna bjuda in och hantera teammedlemmar härifrån.
        </div>
      ) : (
        <div className="mb-8">
          <InviteTeamMemberForm />
        </div>
      )}

      <p className="mb-6 text-sm text-muted">
        Tilldela jobb till personal via tabellen{" "}
        <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">job_assignments</code>.
      </p>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-12 text-center text-sm text-muted">
          Inga teammedlemmar hittades.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              currentUserId={user.id}
              canManage={adminConfigured}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
