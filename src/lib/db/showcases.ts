import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { getService } from "@/lib/services";

export type Showcase = Tables<"showcases">;
export type ShowcaseStatus = Database["public"]["Enums"]["showcase_status"];

export type ShowcaseInput = {
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  serviceSlug: string;
  imageUrls: string[];
  coverImageUrl?: string | null;
  status: ShowcaseStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

function withPublishedAt(status: ShowcaseStatus, existingPublishedAt?: string | null) {
  if (status === "published") {
    return existingPublishedAt ?? new Date().toISOString();
  }

  return null;
}

function resolveCoverImage(coverImageUrl: string | null | undefined, imageUrls: string[]) {
  return coverImageUrl?.trim() || imageUrls[0] || null;
}

function toInsertRow(input: ShowcaseInput): TablesInsert<"showcases"> {
  const imageUrls = input.imageUrls.filter(Boolean);

  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary ?? null,
    content: input.content,
    service_slug: input.serviceSlug,
    image_urls: imageUrls,
    cover_image_url: resolveCoverImage(input.coverImageUrl, imageUrls),
    status: input.status,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
    published_at: withPublishedAt(input.status),
  };
}

function toUpdateRow(
  input: ShowcaseInput,
  existingPublishedAt?: string | null,
): TablesUpdate<"showcases"> {
  const imageUrls = input.imageUrls.filter(Boolean);

  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary ?? null,
    content: input.content,
    service_slug: input.serviceSlug,
    image_urls: imageUrls,
    cover_image_url: resolveCoverImage(input.coverImageUrl, imageUrls),
    status: input.status,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
    published_at: withPublishedAt(input.status, existingPublishedAt),
  };
}

export function isValidShowcaseServiceSlug(serviceSlug: string) {
  return Boolean(getService(serviceSlug));
}

export async function listPublishedShowcases(serviceSlug?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("showcases")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (serviceSlug) {
    query = query.eq("service_slug", serviceSlug);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getPublishedShowcaseBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("showcases")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function listAllShowcasesAdmin() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("showcases")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getShowcaseAdmin(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("showcases")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createShowcase(input: ShowcaseInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("showcases")
    .insert(toInsertRow(input))
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function updateShowcase(id: string, input: ShowcaseInput) {
  const supabase = createAdminClient();
  const existing = await getShowcaseAdmin(id);

  if (!existing) {
    throw new Error("Referensen hittades inte.");
  }

  const { error } = await supabase
    .from("showcases")
    .update(toUpdateRow(input, existing.published_at))
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteShowcase(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("showcases").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function listPublishedShowcaseSlugs() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("showcases")
    .select("slug, updated_at")
    .eq("status", "published");

  if (error) {
    throw error;
  }

  return data ?? [];
}
