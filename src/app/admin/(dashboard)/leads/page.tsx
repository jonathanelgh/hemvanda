import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { listLeads } from "@/lib/admin/queries";

const bookingTypeLabels: Record<string, string> = {
  cleaning_expert: "Kontakta mig",
  service_inquiry: "Tjänsteförfrågan",
};

export default async function AdminLeadsPage() {
  const { profile } = await requireAdminSession();
  const leads = await listLeads();

  return (
    <AdminShell
      profile={profile}
      title="Leads"
      subtitle="Expertleads och förfrågningar som behöver uppföljning."
    >
      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-12 text-center text-sm text-muted">
          Inga leads ännu.
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    {bookingTypeLabels[lead.booking_type] ?? lead.booking_type}
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-green">
                    {lead.contact_name}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {lead.postal_code} {lead.municipality} · {lead.service_slug}
                  </p>
                </div>
                <div className="text-right text-sm text-muted">
                  <p>{lead.contact_phone}</p>
                  <p>{lead.contact_email}</p>
                </div>
              </div>
              {lead.message ? (
                <p className="mt-4 rounded-xl bg-ivory/70 px-4 py-3 text-sm leading-7 text-green">
                  {lead.message}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
