import type { MetadataRoute } from "next";
import { listBlogCategorySlugs, listPublishedBlogSlugs } from "@/lib/db/blog";
import { listPublishedShowcaseSlugs } from "@/lib/db/showcases";
import { absoluteUrl } from "@/lib/seo";
import { services } from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/blog",
    "/referenser",
    "/om-oss",
    "/villkor",
    "/integritet",
    "/logga-in",
    ...services.map((service) => `/tjanster/${service.slug}`),
  ];

  let blogPosts: { slug: string; updated_at: string }[] = [];
  let categories: { slug: string }[] = [];
  let showcases: { slug: string; updated_at: string }[] = [];

  try {
    [blogPosts, categories, showcases] = await Promise.all([
      listPublishedBlogSlugs(),
      listBlogCategorySlugs(),
      listPublishedShowcaseSlugs(),
    ]);
  } catch {
    // Sitemap should still render if CMS tables are unavailable.
  }

  const now = new Date();

  return [
    ...staticPaths.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/blog/kategori/${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...showcases.map((showcase) => ({
      url: absoluteUrl(`/referenser/${showcase.slug}`),
      lastModified: new Date(showcase.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
