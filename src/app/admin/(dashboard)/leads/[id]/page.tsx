import Link from "next/link";
import { notFound } from "next/navigation";
import { ConvertLeadPanel } from "@/components/admin/convert-lead-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { getLeadById } from "@/lib/admin/convert-lead";
import { requireTeamSession } from "@/lib/admin/auth";
import { getCleaningFrequencyLabel } from "@/lib/booking-schedule";
import { services } from "@/lib/services";

const leadTypeLabels: Record<string, string> = {
  cleaning_expert: "Kontakta mig (städ)",
  service_inquiry: "Tjänsteförfrågan",
};

function serviceTitle(slug: string) {
  return services.find((service) => service.slug === slug)?.title ?? slug;
}

type AdminLeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminLeadDetailPage({ params }: AdminLeadDetailPageProps) {
  const { profile } = await requireTeamSession();
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <AdminShell
      profile={profile}
      title={lead.contactName}
    >
      <div className="mb-6">
        <Link
          href="/admin/leads"
          className="text-sm font-semibold text-gold transition hover:text-green"
        >
          ← Tillbaka till leads
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            {leadTypeLabels[lead.leadType] ?? lead.leadType}
          </p>
          <h2 className="mt-2 font-display text-3xl text-green">{lead.contactName}</h2>
          <p className="mt-2 text-sm text-muted">
            {lead.postalCode} {lead.municipality} · {serviceTitle(lead.serviceSlug)}
          </p>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-green">Telefon</dt>
              <dd className="mt-1 text-muted">{lead.contactPhone}</dd>
            </div>
            <div>
              <dt className="font-semibold text-green">E-post</dt>
              <dd className="mt-1 text-muted">{lead.contactEmail}</dd>
            </div>
            {lead.streetAddress ? (
              <div className="sm:col-span-2">
                <dt className="font-semibold text-green">Adress</dt>
                <dd className="mt-1 text-muted">{lead.streetAddress}</dd>
              </div>
            ) : null}
            {lead.cleaningDetails ? (
              <>
                <div>
                  <dt className="font-semibold text-green">Yta</dt>
                  <dd className="mt-1 text-muted">{lead.cleaningDetails.squareMeters} kvm</dd>
                </div>
                <div>
                  <dt className="font-semibold text-green">Frekvens</dt>
                  <dd className="mt-1 text-muted">
                    {getCleaningFrequencyLabel(lead.cleaningDetails.frequency)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-green">Husdjur</dt>
                  <dd className="mt-1 text-muted">
                    {lead.cleaningDetails.hasPets ? "Ja" : "Nej"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-green">Veckodag</dt>
                  <dd className="mt-1 text-muted">{lead.cleaningDetails.weekdayPreference}</dd>
                </div>
              </>
            ) : null}
            {lead.serviceDetails ? (
              <div>
                <dt className="font-semibold text-green">Tidsram</dt>
                <dd className="mt-1 text-muted">{lead.serviceDetails.timeframe}</dd>
              </div>
            ) : null}
          </dl>

          {lead.message ? (
            <div className="mt-6 rounded-xl bg-ivory/70 px-4 py-3 text-sm leading-7 text-green">
              {lead.message}
            </div>
          ) : null}
        </section>

        <ConvertLeadPanel lead={lead} />
      </div>
    </AdminShell>
  );
}
