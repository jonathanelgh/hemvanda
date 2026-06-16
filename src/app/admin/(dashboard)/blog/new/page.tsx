import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { requireTeamSession } from "@/lib/admin/auth";
import { createBlogPostAction } from "@/app/admin/(dashboard)/blog/actions";
import { listBlogCategoriesAdmin } from "@/lib/db/blog";

export default async function AdminNewBlogPostPage() {
  const { profile } = await requireTeamSession();
  const categories = await listBlogCategoriesAdmin();

  return (
    <AdminShell profile={profile} title="Nytt blogginlägg">
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="text-sm font-semibold text-green/70 transition hover:text-gold"
        >
          ← Tillbaka till blogg
        </Link>
      </div>

      <BlogPostForm categories={categories} action={createBlogPostAction} />
    </AdminShell>
  );
}
