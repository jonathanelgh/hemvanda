import { AdminBookingsTable } from "@/components/admin/admin-bookings-table";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { isAdmin, requireTeamSession } from "@/lib/admin/auth";
import { getDashboardStats, listBookingsForTeam } from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const { profile } = await requireTeamSession();
  const [stats, bookings] = await Promise.all([
    getDashboardStats(profile),
    listBookingsForTeam(profile, 8),
  ]);

  return (
    <AdminShell
      profile={profile}
      title="Översikt"
      subtitle={
        isAdmin(profile)
          ? "CRM-översikt för bokningar, leads och team."
          : "Dina tilldelade uppdrag och kommande städningar."
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isAdmin(profile) ? (
          <>
            <AdminStatCard
              label="Bokningar"
              value={stats.totalBookings}
              hint="Totalt antal registrerade bokningar"
            />
            <AdminStatCard
              label="Leads"
              value={stats.openLeads}
              hint="Expertleads och tjänsteförfrågningar"
            />
            <AdminStatCard
              label="Aktiv personal"
              value={stats.activeStaff}
              hint="Teammedlemmar med staff-roll"
            />
            <AdminStatCard label="Tilldelade jobb" value={stats.assignedJobs} />
          </>
        ) : (
          <>
            <AdminStatCard
              label="Mina uppdrag"
              value={stats.assignedJobs}
              hint="Jobb tilldelade till dig"
            />
            <AdminStatCard label="Kommande" value={bookings.length} hint="Senaste tilldelningar" />
          </>
        )}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-green">
            {isAdmin(profile) ? "Senaste bokningar" : "Mina senaste uppdrag"}
          </h2>
        </div>
        <AdminBookingsTable
          bookings={bookings}
          emptyMessage={
            isAdmin(profile)
              ? "Inga bokningar har kommit in ännu."
              : "Du har inga tilldelade uppdrag ännu."
          }
        />
      </section>
    </AdminShell>
  );
}
