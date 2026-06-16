import Link from "next/link";
import type { BlogPostWithCategory } from "@/lib/db/blog";
import { blogPostExcerpt, formatBlogDate } from "@/components/blog/blog-prose";

type BlogCardProps = {
  post: BlogPostWithCategory;
  compact?: boolean;
};

export function BlogCard({ post, compact = false }: BlogCardProps) {
  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-green/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <div className={`relative overflow-hidden bg-ivory ${compact ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
          {post.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-green/10 to-gold/10 px-4 text-center text-sm font-semibold text-green/60">
              {post.title}
            </div>
          )}
        </div>
        <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-6"}`}>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            {post.category ? (
              <span>{post.category.name}</span>
            ) : (
              <span>Blogg</span>
            )}
            {post.published_at ? (
              <span className="text-green/40">{formatBlogDate(post.published_at)}</span>
            ) : null}
          </div>
          <h2
            className={`mt-2 font-display text-green transition group-hover:text-gold ${
              compact ? "line-clamp-2 text-lg leading-snug" : "text-2xl"
            }`}
          >
            {post.title}
          </h2>
          <p className={`mt-2 text-muted ${compact ? "line-clamp-3 text-xs leading-6" : "text-sm leading-7"}`}>
            {blogPostExcerpt(post, compact ? 100 : 160)}
          </p>
          <span className={`mt-auto inline-flex font-semibold text-green transition group-hover:text-gold ${compact ? "pt-3 text-xs" : "mt-5 text-sm"}`}>
            Läs mer →
          </span>
        </div>
      </Link>
    </article>
  );
}
