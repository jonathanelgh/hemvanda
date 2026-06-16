import type { BlogPostWithCategory } from "@/lib/db/blog";

export function BlogProse({ html }: { html: string }) {
  return (
    <div
      className="blog-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function formatBlogDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function blogPostExcerpt(post: BlogPostWithCategory, maxLength = 160) {
  const source = post.excerpt?.trim() || post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  if (source.length <= maxLength) {
    return source;
  }

  return `${source.slice(0, maxLength).trim()}…`;
}
