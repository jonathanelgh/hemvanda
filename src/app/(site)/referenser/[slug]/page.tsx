import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogProse } from "@/components/blog/blog-prose";
import { ShowcaseGallery } from "@/components/showcase/showcase-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedShowcaseBySlug } from "@/lib/db/showcases";
import { buildPageMetadata } from "@/lib/seo";
import { getService } from "@/lib/services";

type ShowcaseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ShowcaseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const showcase = await getPublishedShowcaseBySlug(slug);

  if (!showcase) {
    return buildPageMetadata({
      title: "Referens hittades inte",
      path: `/referenser/${slug}`,
      noIndex: true,
    });
  }

  const description =
    showcase.seo_description?.trim() ||
    showcase.summary?.trim() ||
    `${showcase.title} – tidigare jobb från HemVända`;

  return buildPageMetadata({
    title: showcase.seo_title?.trim() || showcase.title,
    description,
    path: `/referenser/${showcase.slug}`,
    image: showcase.cover_image_url ?? showcase.image_urls[0] ?? null,
  });
}

export default async function ShowcaseDetailPage({ params }: ShowcaseDetailPageProps) {
  const { slug } = await params;
  const showcase = await getPublishedShowcaseBySlug(slug);

  if (!showcase) {
    notFound();
  }

  const service = getService(showcase.service_slug);

  return (
    <>
      <SiteHeader />
      <main>
        <article>
          <header className="border-b border-green/10 bg-card py-14 sm:py-20">
            <div className="container-shell max-w-4xl">
              <Link
                href="/referenser"
                className="text-sm font-semibold text-green/70 transition hover:text-gold"
              >
                ← Alla referenser
              </Link>
              {service ? (
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  <Link
                    href={`/tjanster/${service.slug}`}
                    className="transition hover:text-green"
                  >
                    {service.title}
                  </Link>
                </p>
              ) : null}
              <h1 className="mt-4 font-display text-4xl text-green sm:text-5xl">
                {showcase.title}
              </h1>
              {showcase.summary ? (
                <p className="mt-6 text-lg leading-8 text-green/80">{showcase.summary}</p>
              ) : null}
            </div>
          </header>

          <div className="container-shell max-w-5xl space-y-12 py-12 sm:py-16">
            <ShowcaseGallery imageUrls={showcase.image_urls} title={showcase.title} />

            {showcase.content ? (
              <div className="max-w-3xl">
                <h2 className="font-display text-3xl text-green">Vad vi gjorde</h2>
                <div className="mt-6">
                  <BlogProse html={showcase.content} />
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
