import { ScheduleWeekView } from "@/components/admin/schedule-week-view";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdmin, requireTeamSession } from "@/lib/admin/auth";
import { listAssignableStaff, listScheduleVisits } from "@/lib/admin/queries";
import { resolveWeekStartKey } from "@/lib/admin/schedule";

type SchedulePageProps = {
  searchParams: Promise<{
    week?: string;
  }>;
};

export default async function AdminSchedulePage({ searchParams }: SchedulePageProps) {
  const { profile } = await requireTeamSession();
  const params = await searchParams;
  const weekStartKey = resolveWeekStartKey(params.week);
  const adminView = isAdmin(profile);

  const [visits, staffMembers] = await Promise.all([
    listScheduleVisits(profile, weekStartKey),
    adminView ? listAssignableStaff() : Promise.resolve([]),
  ]);

  return (
    <AdminShell
      profile={profile}
      title="Schema"
    >
      <ScheduleWeekView
        weekStartKey={weekStartKey}
        visits={visits}
        staffMembers={staffMembers}
        canAssignStaff={adminView}
        canCreateBooking={adminView}
      />
    </AdminShell>
  );
}
