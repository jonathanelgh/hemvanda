import { AdminBookingsTable } from "@/components/admin/admin-bookings-table";
import { AdminDashboardSection } from "@/components/admin/admin-dashboard-section";
import { AdminLeadsPanel } from "@/components/admin/admin-leads-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { isAdmin, requireTeamSession } from "@/lib/admin/auth";
import {
  getDashboardStats,
  listActiveBookings,
  listTodaysJobs,
  listUnhandledLeads,
} from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const { profile } = await requireTeamSession();
  const adminView = isAdmin(profile);

  const [stats, activeBookings, todaysJobs, unhandledLeads] = await Promise.all([
    getDashboardStats(profile),
    listActiveBookings(profile, 8),
    listTodaysJobs(profile, 8),
    adminView ? listUnhandledLeads(6) : Promise.resolve([]),
  ]);

  return (
    <AdminShell
      profile={profile}
      title="Översikt"
    >
      <div
        className={`grid gap-4 md:grid-cols-2 ${adminView ? "xl:grid-cols-4" : ""}`}
      >
        <AdminStatCard
          label="Aktiva bokningar"
          value={stats.activeBookings}
          hint="Pågående bokningar som inte är avslutade"
        />
        <AdminStatCard
          label="Jobb idag"
          value={stats.todaysJobs}
          hint="Schemalagda städningar för idag"
        />
        {adminView ? (
          <>
            <AdminStatCard
              label="Obehandlade leads"
              value={stats.unhandledLeads}
              hint="Förfrågningar som väntar på uppföljning"
              tone={stats.unhandledLeads > 0 ? "urgent" : "default"}
            />
            <AdminStatCard
              label="Aktiv personal"
              value={stats.activeStaff}
              hint="Teammedlemmar med staff-roll"
            />
          </>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <AdminDashboardSection
          title="Aktiva bokningar"
          description="Bokningar som är inskickade, kontaktade eller bekräftade."
          href="/admin/bookings"
        >
          <AdminBookingsTable
            bookings={activeBookings}
            emptyMessage="Inga aktiva bokningar just nu."
          />
        </AdminDashboardSection>

        <AdminDashboardSection
          title="Jobb idag"
          description="Uppdrag med planerad städning idag."
          href="/admin/schedule"
        >
          <AdminBookingsTable
            bookings={todaysJobs}
            emptyMessage="Inga jobb schemalagda för idag."
          />
        </AdminDashboardSection>
      </div>

      {adminView ? (
        <div className="mt-6">
          <AdminDashboardSection
            title="Obehandlade leads"
            description="Expertleads och tjänsteförfrågningar som ännu inte hanterats."
            href="/admin/leads"
          >
            <AdminLeadsPanel leads={unhandledLeads} />
          </AdminDashboardSection>
        </div>
      ) : null}
    </AdminShell>
  );
}
