import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShowcaseForm } from "@/components/admin/showcase-form";
import { requireTeamSession } from "@/lib/admin/auth";
import { createShowcaseAction } from "@/app/admin/(dashboard)/showcases/actions";

export default async function AdminNewShowcasePage() {
  const { profile } = await requireTeamSession();

  return (
    <AdminShell profile={profile} title="Ny referens">
      <div className="mb-6">
        <Link
          href="/admin/showcases"
          className="text-sm font-semibold text-green/70 transition hover:text-gold"
        >
          ← Tillbaka till referenser
        </Link>
      </div>

      <ShowcaseForm action={createShowcaseAction} />
    </AdminShell>
  );
}
