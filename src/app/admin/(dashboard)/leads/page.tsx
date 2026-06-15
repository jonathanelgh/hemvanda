import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireTeamSession } from "@/lib/admin/auth";
import { listLeads } from "@/lib/admin/queries";
import { getCleaningFrequencyLabel } from "@/lib/booking-schedule";
import { services } from "@/lib/services";

const leadTypeLabels: Record<string, string> = {
  cleaning_expert: "Kontakta mig",
  service_inquiry: "Tjänsteförfrågan",
};

const leadStatusLabels: Record<string, string> = {
  submitted: "Inskickad",
  contacted: "Kontaktad",
  converted: "Omvandlad",
  cancelled: "Avbruten",
};

function serviceTitle(slug: string) {
  return services.find((service) => service.slug === slug)?.title ?? slug;
}

export default async function AdminLeadsPage() {
  const { profile } = await requireTeamSession();
  const leads = await listLeads();

  return (
    <AdminShell
      profile={profile}
      title="Leads"
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
                    {leadTypeLabels[lead.lead_type] ?? lead.lead_type}
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-green">
                    <Link href={`/admin/leads/${lead.id}`} className="hover:text-gold">
                      {lead.contact_name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {lead.postal_code} {lead.municipality} · {serviceTitle(lead.service_slug)}
                  </p>
                  {lead.frequency ? (
                    <p className="mt-1 text-sm text-muted">
                      Frekvens: {getCleaningFrequencyLabel(lead.frequency)}
                    </p>
                  ) : null}
                  {lead.timeframe ? (
                    <p className="mt-1 text-sm text-muted">Tidsram: {lead.timeframe}</p>
                  ) : null}
                </div>
                <div className="text-right text-sm">
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-green">
                    {leadStatusLabels[lead.status] ?? lead.status}
                  </span>
                  <p className="mt-3 text-muted">{lead.contact_phone}</p>
                  <p className="text-muted">{lead.contact_email}</p>
                </div>
              </div>
              {lead.message ? (
                <p className="mt-4 rounded-xl bg-ivory/70 px-4 py-3 text-sm leading-7 text-green">
                  {lead.message}
                </p>
              ) : null}
              <div className="mt-4">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="text-sm font-semibold text-gold transition hover:text-green"
                >
                  Hantera lead →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
