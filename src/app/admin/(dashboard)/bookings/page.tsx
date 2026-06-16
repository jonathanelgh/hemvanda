import { AdminBookingsView } from "@/components/admin/admin-bookings-view";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdmin, requireTeamSession } from "@/lib/admin/auth";
import { listAssignableStaff, listBookingsForTeam } from "@/lib/admin/queries";

export default async function AdminBookingsPage() {
  const { profile } = await requireTeamSession();
  const adminView = isAdmin(profile);
  const [bookings, staffMembers] = await Promise.all([
    listBookingsForTeam(profile, 50),
    adminView ? listAssignableStaff() : Promise.resolve([]),
  ]);

  return (
    <AdminShell
      profile={profile}
      title={adminView ? "Bokningar" : "Mina uppdrag"}
    >
      <AdminBookingsView
        bookings={bookings}
        staffMembers={staffMembers}
        canCreateBooking={adminView}
        emptyMessage={
          adminView
            ? "Inga bokningar att visa."
            : "Inga tilldelade uppdrag ännu."
        }
      />
    </AdminShell>
  );
}
