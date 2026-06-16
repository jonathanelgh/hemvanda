import type { Metadata } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://hemvanda.se";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/stad-hero-img.webp`;

export const DEFAULT_DESCRIPTION =
  `${BRAND_NAME} hjälper dig med städ, snickeri, bygg, renovering, handyman, inredning och utvalda övriga tjänster i Stockholm med omnejd.`;

type PageMetadataInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const resolvedImage = image ?? DEFAULT_OG_IMAGE;
  const pageTitle = title.includes(BRAND_NAME)
    ? title
    : `${title} | ${BRAND_NAME}`;

  return {
    title: {
      absolute: pageTitle,
    },
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: BRAND_NAME,
      locale: "sv_SE",
      type,
      ...(resolvedImage
        ? {
            images: [
              {
                url: resolvedImage,
                width: 1200,
                height: 630,
                alt: pageTitle,
              },
            ],
          }
        : {}),
      ...(type === "article" && publishedTime
        ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime }
        : {}),
    },
    twitter: {
      card: resolvedImage ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    slogan: BRAND_TAGLINE,
    email: "info@hemvanda.se",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Stockholm",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
    inLanguage: "sv-SE",
  };
}

type BlogPostingJsonLdInput = {
  title: string;
  description: string;
  slug: string;
  coverImageUrl?: string | null;
  publishedAt: string;
  updatedAt: string;
  categoryName?: string | null;
};

export function blogPostingJsonLd({
  title,
  description,
  slug,
  coverImageUrl,
  publishedAt,
  updatedAt,
  categoryName,
}: BlogPostingJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt,
    inLanguage: "sv-SE",
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
    url: absoluteUrl(`/blog/${slug}`),
    author: {
      "@type": "Organization",
      name: BRAND_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: SITE_URL,
    },
    ...(coverImageUrl
      ? {
          image: [coverImageUrl],
        }
      : {}),
    ...(categoryName
      ? {
          articleSection: categoryName,
        }
      : {}),
  };
}
