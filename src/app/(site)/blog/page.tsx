import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listBlogCategories, listPublishedBlogPosts } from "@/lib/db/blog";
import { BRAND_NAME } from "@/lib/brand";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blogg",
  description:
    `Tips, inspiration och guider om städ, hantverk och hemtjänster från ${BRAND_NAME}.`,
  path: "/blog",
});

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    listPublishedBlogPosts(),
    listBlogCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${BRAND_NAME} blogg`,
          url: absoluteUrl("/blog"),
          inLanguage: "sv-SE",
        }}
      />
      <SiteHeader />
      <main>
        <PageHero>
          <div className="max-w-4xl">
            <SectionHeading
              eyebrow="Blogg"
              title="Guider, tips och inspiration för hemmet"
              description="Läs mer om städ, hantverk och smarta lösningar som gör vardagen enklare."
            />
            {categories.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/blog"
                  className="rounded-full bg-green px-4 py-2 text-sm font-semibold text-white"
                >
                  Alla
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog/kategori/${category.slug}`}
                    className="rounded-full border border-green/15 bg-white/80 px-4 py-2 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </PageHero>

        <section className="py-16 sm:py-20">
          <div className="container-shell">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-16 text-center">
                <p className="font-display text-2xl text-green">Inga artiklar ännu</p>
                <p className="mt-3 text-sm text-muted">
                  Kom tillbaka snart – vi publicerar nya guider här.
                </p>
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
