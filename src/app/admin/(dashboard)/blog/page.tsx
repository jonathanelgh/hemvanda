import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogAiGeneratePanel } from "@/components/admin/blog-ai-generate-panel";
import { requireTeamSession } from "@/lib/admin/auth";
import { listAllBlogPostsAdmin, listBlogCategoriesAdmin } from "@/lib/db/blog";

const statusLabels = {
  draft: "Utkast",
  published: "Publicerad",
} as const;

export default async function AdminBlogPage() {
  const { profile } = await requireTeamSession();
  const [posts, categories] = await Promise.all([
    listAllBlogPostsAdmin(),
    listBlogCategoriesAdmin(),
  ]);

  return (
    <AdminShell profile={profile} title="Blogg">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Skapa och publicera artiklar med kategorier, omslagsbild och SEO-fält.
        </p>
        <div className="flex flex-wrap gap-3">
          <BlogAiGeneratePanel categories={categories} />
          <Link
            href="/admin/blog/categories"
            className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
          >
            Kategorier
          </Link>
          <Link
            href="/admin/blog/new"
            className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink"
          >
            Nytt inlägg
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-12 text-center text-sm text-muted">
          Inga blogginlägg ännu.
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    {statusLabels[post.status]}
                    {post.category ? ` · ${post.category.name}` : ""}
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-green">
                    <Link href={`/admin/blog/${post.id}`} className="hover:text-gold">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted">/blog/{post.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.status === "published" ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="rounded-full border border-green/15 px-4 py-2 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
                    >
                      Visa på webben
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="rounded-full bg-green px-4 py-2 text-sm font-bold text-white transition hover:bg-ink"
                  >
                    Redigera
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
