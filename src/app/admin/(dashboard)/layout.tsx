import { redirect } from "next/navigation";
import { requireTeamSession } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireTeamSession();

  if (!session.profile) {
    redirect("/admin/login");
  }

  return children;
}
