import Link from "next/link";
import type { BlogPostWithCategory } from "@/lib/db/blog";
import { blogPostExcerpt, formatBlogDate } from "@/components/blog/blog-prose";

export function BlogCard({ post }: { post: BlogPostWithCategory }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-green/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-ivory">
          {post.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-green/10 to-gold/10 px-6 text-center text-sm font-semibold text-green/60">
              {post.title}
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {post.category ? (
              <span>{post.category.name}</span>
            ) : (
              <span>Blogg</span>
            )}
            {post.published_at ? (
              <span className="text-green/40">{formatBlogDate(post.published_at)}</span>
            ) : null}
          </div>
          <h2 className="mt-3 font-display text-2xl text-green transition group-hover:text-gold">
            {post.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {blogPostExcerpt(post)}
          </p>
          <span className="mt-5 inline-flex text-sm font-semibold text-green transition group-hover:text-gold">
            Läs mer →
          </span>
        </div>
      </Link>
    </article>
  );
}
