import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireTeamSession } from "@/lib/admin/auth";
import { listAllShowcasesAdmin } from "@/lib/db/showcases";
import { getService } from "@/lib/services";

const statusLabels = {
  draft: "Utkast",
  published: "Publicerad",
} as const;

export default async function AdminShowcasesPage() {
  const { profile } = await requireTeamSession();
  const showcases = await listAllShowcasesAdmin();

  return (
    <AdminShell profile={profile} title="Referenser">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Visa tidigare jobb med bilder, beskrivning och koppling till tjänst.
        </p>
        <Link
          href="/admin/showcases/new"
          className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink"
        >
          Ny referens
        </Link>
      </div>

      {showcases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-12 text-center text-sm text-muted">
          Inga referenser ännu.
        </div>
      ) : (
        <div className="grid gap-4">
          {showcases.map((showcase) => {
            const service = getService(showcase.service_slug);

            return (
              <article
                key={showcase.id}
                className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                      {statusLabels[showcase.status]}
                      {service ? ` · ${service.title}` : ""}
                    </p>
                    <h2 className="mt-2 font-display text-2xl text-green">
                      <Link
                        href={`/admin/showcases/${showcase.id}`}
                        className="hover:text-gold"
                      >
                        {showcase.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-muted">/referenser/{showcase.slug}</p>
                    {showcase.summary ? (
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                        {showcase.summary}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {showcase.status === "published" ? (
                      <Link
                        href={`/referenser/${showcase.slug}`}
                        className="rounded-full border border-green/15 px-4 py-2 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
                      >
                        Visa på webben
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/showcases/${showcase.id}`}
                      className="rounded-full bg-green px-4 py-2 text-sm font-bold text-white transition hover:bg-ink"
                    >
                      Redigera
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
