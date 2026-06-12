import type { DashboardBooking } from "@/lib/admin/queries";

const bookingTypeLabels: Record<string, string> = {
  cleaning_direct: "Direktbokning",
  cleaning_expert: "Expertlead",
  service_inquiry: "Förfrågan",
};

const statusLabels: Record<string, string> = {
  submitted: "Inskickad",
  contacted: "Kontaktad",
  confirmed: "Bekräftad",
  cancelled: "Avbokad",
  completed: "Slutförd",
};

type AdminBookingsTableProps = {
  bookings: DashboardBooking[];
  emptyMessage?: string;
};

export function AdminBookingsTable({
  bookings,
  emptyMessage = "Inga bokningar att visa ännu.",
}: AdminBookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-green/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-green/10 bg-ivory/60 text-xs uppercase tracking-[0.18em] text-muted">
            <tr>
              <th className="px-5 py-4 font-semibold">Kund</th>
              <th className="px-5 py-4 font-semibold">Typ</th>
              <th className="px-5 py-4 font-semibold">Ort</th>
              <th className="px-5 py-4 font-semibold">Tid</th>
              <th className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-green/5 last:border-0">
                <td className="px-5 py-4 font-semibold text-green">
                  {booking.contactName}
                </td>
                <td className="px-5 py-4 text-muted">
                  {bookingTypeLabels[booking.bookingType] ?? booking.bookingType}
                </td>
                <td className="px-5 py-4 text-muted">
                  {booking.postalCode} {booking.municipality}
                </td>
                <td className="px-5 py-4 text-muted">
                  {booking.preferredDate
                    ? `${booking.preferredDate}${booking.preferredTime ? ` ${booking.preferredTime}` : ""}`
                    : "—"}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-green">
                    {statusLabels[booking.status] ?? booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
