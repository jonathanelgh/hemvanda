import { AdminBookingsTable } from "@/components/admin/admin-bookings-table";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdmin, requireTeamSession } from "@/lib/admin/auth";
import { listBookingsForTeam } from "@/lib/admin/queries";

export default async function AdminBookingsPage() {
  const { profile } = await requireTeamSession();
  const bookings = await listBookingsForTeam(profile, 50);

  return (
    <AdminShell
      profile={profile}
      title={isAdmin(profile) ? "Bokningar" : "Mina uppdrag"}
    >
      <AdminBookingsTable
        bookings={bookings}
        emptyMessage={
          isAdmin(profile)
            ? "Inga bokningar att visa."
            : "Inga tilldelade uppdrag ännu."
        }
      />
    </AdminShell>
  );
}
