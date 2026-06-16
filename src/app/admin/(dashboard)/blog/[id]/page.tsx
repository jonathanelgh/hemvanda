import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { requireTeamSession } from "@/lib/admin/auth";
import {
  deleteBlogPostAction,
  updateBlogPostAction,
} from "@/app/admin/(dashboard)/blog/actions";
import { getBlogPostAdmin, listBlogCategoriesAdmin } from "@/lib/db/blog";

type AdminEditBlogPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditBlogPostPage({
  params,
}: AdminEditBlogPostPageProps) {
  const { id } = await params;
  const { profile } = await requireTeamSession();
  const [post, categories] = await Promise.all([
    getBlogPostAdmin(id),
    listBlogCategoriesAdmin(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <AdminShell profile={profile} title="Redigera blogginlägg">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/blog"
          className="text-sm font-semibold text-green/70 transition hover:text-gold"
        >
          ← Tillbaka till blogg
        </Link>
        {post.status === "published" ? (
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-semibold text-green transition hover:text-gold"
          >
            Visa på webben →
          </Link>
        ) : null}
      </div>

      <BlogPostForm
        post={post}
        categories={categories}
        action={updateBlogPostAction.bind(null, id)}
        deleteAction={deleteBlogPostAction.bind(null, id)}
      />
    </AdminShell>
  );
}
