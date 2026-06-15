import { SettingsTabs } from "@/components/admin/settings-tabs";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdmin, requireTeamSession } from "@/lib/admin/auth";
import { WEB_BOOKING_SERVICE_SLUG } from "@/lib/booking";
import { EMPTY_WEEKLY_SCHEDULE } from "@/lib/booking-availability";
import { getWeeklyAvailabilitySchedule } from "@/lib/db/weekly-availability";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export default async function AdminSettingsPage() {
  const { profile, user } = await requireTeamSession();
  const adminView = isAdmin(profile);

  const schedule =
    adminView && isSupabaseAdminConfigured()
      ? await getWeeklyAvailabilitySchedule(WEB_BOOKING_SERVICE_SLUG).catch(
          () => EMPTY_WEEKLY_SCHEDULE,
        )
      : adminView
        ? EMPTY_WEEKLY_SCHEDULE
        : null;

  return (
    <AdminShell
      profile={profile}
      title="Inställningar"
    >
      <SettingsTabs
        profile={profile}
        userEmail={user.email}
        isAdmin={adminView}
        schedule={schedule}
      />
    </AdminShell>
  );
}
