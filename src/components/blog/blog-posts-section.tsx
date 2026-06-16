import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { SectionHeading } from "@/components/sections";
import { listPublishedBlogPosts } from "@/lib/db/blog";

type BlogPostsSectionProps = {
  limit?: number;
};

export async function BlogPostsSection({ limit = 4 }: BlogPostsSectionProps) {
  const posts = await listPublishedBlogPosts(limit);

  return (
    <section className="border-t border-green/10 bg-white py-24">
      <div className="container-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Blogg"
            title="Tips och inspiration för hemmet"
            description="Guider om städ, hantverk och smarta lösningar i Stockholm med omnejd."
          />
          <Link
            href="/blog"
            className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
          >
            Alla artiklar →
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-5 min-[900px]:grid-cols-2 min-[1200px]:grid-cols-4">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} compact />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-green/15 bg-background px-6 py-14 text-center">
            <p className="font-display text-2xl text-green">Nya guider kommer snart</p>
            <p className="mt-3 text-sm text-muted">
              Vi publicerar artiklar om städ, hantverk och hemtjänster här.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink"
            >
              Till bloggen
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
