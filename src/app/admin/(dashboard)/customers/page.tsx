import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { listCustomers } from "@/lib/admin/queries";

export default async function AdminCustomersPage() {
  const { profile } = await requireAdminSession();
  const customers = await listCustomers();

  return (
    <AdminShell
      profile={profile}
      title="Kunder"
      subtitle="Kontakter som kommit in via bokningar och förfrågningar."
    >
      {customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-12 text-center text-sm text-muted">
          Inga kunder ännu.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-green/10 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-green/10 bg-ivory/60 text-xs uppercase tracking-[0.18em] text-muted">
              <tr>
                <th className="px-5 py-4 font-semibold">Namn</th>
                <th className="px-5 py-4 font-semibold">E-post</th>
                <th className="px-5 py-4 font-semibold">Telefon</th>
                <th className="px-5 py-4 font-semibold">Ort</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.contact_email}
                  className="border-b border-green/5 last:border-0"
                >
                  <td className="px-5 py-4 font-semibold text-green">
                    {customer.contact_name}
                  </td>
                  <td className="px-5 py-4 text-muted">{customer.contact_email}</td>
                  <td className="px-5 py-4 text-muted">{customer.contact_phone}</td>
                  <td className="px-5 py-4 text-muted">
                    {customer.postal_code} {customer.municipality}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
