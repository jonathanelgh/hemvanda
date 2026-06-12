import { AdminShell } from "@/components/admin/admin-shell";
import { requireTeamSession } from "@/lib/admin/auth";

export default async function AdminSettingsPage() {
  const { profile, user } = await requireTeamSession();

  return (
    <AdminShell profile={profile} title="Inställningar" subtitle="Ditt konto i CRM:et.">
      <div className="max-w-2xl rounded-2xl border border-green/10 bg-white p-6 shadow-sm">
        <dl className="space-y-5 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Namn
            </dt>
            <dd className="mt-1 font-semibold text-green">
              {profile.fullName || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              E-post
            </dt>
            <dd className="mt-1 font-semibold text-green">{profile.email || user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Roll
            </dt>
            <dd className="mt-1 font-semibold capitalize text-green">
              {profile.role === "admin" ? "Administratör" : "Personal"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Jobbtitel
            </dt>
            <dd className="mt-1 font-semibold text-green">
              {profile.jobTitle || "—"}
            </dd>
          </div>
        </dl>
      </div>
    </AdminShell>
  );
}
