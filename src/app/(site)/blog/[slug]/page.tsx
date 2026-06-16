import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogProse, formatBlogDate } from "@/components/blog/blog-prose";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedBlogPostBySlug } from "@/lib/db/blog";
import { BRAND_NAME } from "@/lib/brand";
import { blogPostingJsonLd, buildPageMetadata } from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return buildPageMetadata({
      title: "Artikel hittades inte",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const description =
    post.seo_description?.trim() ||
    post.excerpt?.trim() ||
    `${post.title} – ${BRAND_NAME} blogg`;

  return buildPageMetadata({
    title: post.seo_title?.trim() || post.title,
    description,
    path: `/blog/${post.slug}`,
    image: post.cover_image_url,
    type: "article",
    publishedTime: post.published_at ?? post.created_at,
    modifiedTime: post.updated_at,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const description =
    post.seo_description?.trim() ||
    post.excerpt?.trim() ||
    post.title;

  return (
    <>
      <JsonLd
        data={blogPostingJsonLd({
          title: post.title,
          description,
          slug: post.slug,
          coverImageUrl: post.cover_image_url,
          publishedAt: post.published_at ?? post.created_at,
          updatedAt: post.updated_at,
          categoryName: post.category?.name,
        })}
      />
      <SiteHeader />
      <main>
        <article>
          <header className="border-b border-green/10 bg-card py-14 sm:py-20">
            <div className="container-shell max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                <Link href="/blog" className="transition hover:text-green">
                  Blogg
                </Link>
                {post.category ? (
                  <>
                    <span className="text-green/30">/</span>
                    <Link
                      href={`/blog/kategori/${post.category.slug}`}
                      className="transition hover:text-green"
                    >
                      {post.category.name}
                    </Link>
                  </>
                ) : null}
              </div>
              <h1 className="mt-5 font-display text-4xl text-green sm:text-5xl">
                {post.title}
              </h1>
              {post.published_at ? (
                <p className="mt-4 text-sm text-muted">
                  Publicerad {formatBlogDate(post.published_at)}
                </p>
              ) : null}
              {post.excerpt ? (
                <p className="mt-6 text-lg leading-8 text-green/80">{post.excerpt}</p>
              ) : null}
            </div>
          </header>

          {post.cover_image_url ? (
            <div className="container-shell max-w-5xl py-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="aspect-[16/9] w-full rounded-3xl object-cover shadow-sm"
              />
            </div>
          ) : null}

          <div className="container-shell max-w-3xl py-12 sm:py-16">
            <BlogProse html={post.content} />
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
