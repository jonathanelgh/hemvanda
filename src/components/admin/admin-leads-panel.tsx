import Link from "next/link";
import type { DashboardLead } from "@/lib/admin/queries";

const leadTypeLabels: Record<string, string> = {
  cleaning_expert: "Kontakta mig",
  service_inquiry: "Tjänsteförfrågan",
};

function formatLeadTime(createdAt: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Stockholm",
  }).format(new Date(createdAt));
}

type AdminLeadsPanelProps = {
  leads: DashboardLead[];
  emptyMessage?: string;
};

export function AdminLeadsPanel({
  leads,
  emptyMessage = "Inga obehandlade leads just nu.",
}: AdminLeadsPanelProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-green/15 bg-ivory/40 px-5 py-10 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <article
          key={lead.id}
          className="rounded-xl border border-green/10 bg-ivory/30 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                {leadTypeLabels[lead.lead_type] ?? lead.lead_type}
              </p>
              <h3 className="mt-1 font-semibold text-green">
                <Link href={`/admin/leads/${lead.id}`} className="hover:text-gold">
                  {lead.contact_name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted">
                {lead.postal_code} {lead.municipality} · {lead.service_slug}
              </p>
            </div>
            <div className="text-right text-sm text-muted">
              <p>{lead.contact_phone}</p>
              <p className="truncate">{lead.contact_email}</p>
              <p className="mt-1 text-xs">{formatLeadTime(lead.created_at)}</p>
            </div>
          </div>
          {lead.message ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-green/80">
              {lead.message}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
