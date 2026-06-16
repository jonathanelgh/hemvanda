import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/blog-card";
import { SectionHeading } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listPublishedBlogPostsByCategory } from "@/lib/db/blog";
import { BRAND_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

type BlogCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await listPublishedBlogPostsByCategory(slug);

  if (!category) {
    return buildPageMetadata({
      title: "Kategori hittades inte",
      path: `/blog/kategori/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${category.name} – Blogg`,
    description:
      category.description?.trim() ||
      `Artiklar inom ${category.name} från ${BRAND_NAME}.`,
    path: `/blog/kategori/${category.slug}`,
  });
}

export default async function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const { slug } = await params;
  const { category, posts } = await listPublishedBlogPostsByCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-green/10 bg-card py-16 sm:py-20">
          <div className="container-shell">
            <Link
              href="/blog"
              className="text-sm font-semibold text-green/70 transition hover:text-gold"
            >
              ← Alla artiklar
            </Link>
            <SectionHeading
              eyebrow="Kategori"
              title={category.name}
              description={
                category.description ??
                `Alla publicerade artiklar inom ${category.name}.`
              }
            />
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container-shell">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-16 text-center text-sm text-muted">
                Inga artiklar i den här kategorin ännu.
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
