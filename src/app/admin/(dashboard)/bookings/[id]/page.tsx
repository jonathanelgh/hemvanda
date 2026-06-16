import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBookingDetailPanel } from "@/components/admin/admin-booking-detail-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdmin, requireTeamSession } from "@/lib/admin/auth";
import { getBookingByIdForTeam, listAssignableStaff } from "@/lib/admin/queries";

type AdminBookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBookingDetailPage({ params }: AdminBookingDetailPageProps) {
  const { profile } = await requireTeamSession();
  const { id } = await params;
  const [booking, staffMembers] = await Promise.all([
    getBookingByIdForTeam(profile, id),
    isAdmin(profile) ? listAssignableStaff() : Promise.resolve([]),
  ]);

  if (!booking) {
    notFound();
  }

  return (
    <AdminShell profile={profile} title={booking.contactName}>
      <div className="mb-6">
        <Link
          href="/admin/bookings"
          className="text-sm font-semibold text-green/70 transition hover:text-gold"
        >
          ← Tillbaka till bokningar
        </Link>
      </div>

      <AdminBookingDetailPanel
        booking={booking}
        staffMembers={staffMembers}
        canAssignStaff={isAdmin(profile)}
      />
    </AdminShell>
  );
}
