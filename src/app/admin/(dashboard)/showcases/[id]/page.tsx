import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShowcaseForm } from "@/components/admin/showcase-form";
import { requireTeamSession } from "@/lib/admin/auth";
import {
  deleteShowcaseAction,
  updateShowcaseAction,
} from "@/app/admin/(dashboard)/showcases/actions";
import { getShowcaseAdmin } from "@/lib/db/showcases";

type AdminEditShowcasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditShowcasePage({
  params,
}: AdminEditShowcasePageProps) {
  const { id } = await params;
  const { profile } = await requireTeamSession();
  const showcase = await getShowcaseAdmin(id);

  if (!showcase) {
    notFound();
  }

  return (
    <AdminShell profile={profile} title="Redigera referens">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/showcases"
          className="text-sm font-semibold text-green/70 transition hover:text-gold"
        >
          ← Tillbaka till referenser
        </Link>
        {showcase.status === "published" ? (
          <Link
            href={`/referenser/${showcase.slug}`}
            className="text-sm font-semibold text-green transition hover:text-gold"
          >
            Visa på webben →
          </Link>
        ) : null}
      </div>

      <ShowcaseForm
        showcase={showcase}
        action={updateShowcaseAction.bind(null, id)}
        deleteAction={deleteShowcaseAction.bind(null, id)}
      />
    </AdminShell>
  );
}
