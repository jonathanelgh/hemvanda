import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type BlogCategory = Tables<"blog_categories">;
export type BlogPost = Tables<"blog_posts">;
export type BlogPostStatus = Database["public"]["Enums"]["blog_post_status"];

export type BlogPostWithCategory = BlogPost & {
  category: BlogCategory | null;
};

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  categoryId?: string | null;
  status: BlogPostStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  authorId?: string | null;
};

function withPublishedAt(status: BlogPostStatus, existingPublishedAt?: string | null) {
  if (status === "published") {
    return existingPublishedAt ?? new Date().toISOString();
  }

  return null;
}

function toInsertRow(input: BlogPostInput): TablesInsert<"blog_posts"> {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? null,
    content: input.content,
    cover_image_url: input.coverImageUrl ?? null,
    category_id: input.categoryId ?? null,
    status: input.status,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
    author_id: input.authorId ?? null,
    published_at: withPublishedAt(input.status),
  };
}

function toUpdateRow(
  input: BlogPostInput,
  existingPublishedAt?: string | null,
): TablesUpdate<"blog_posts"> {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? null,
    content: input.content,
    cover_image_url: input.coverImageUrl ?? null,
    category_id: input.categoryId ?? null,
    status: input.status,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
    published_at: withPublishedAt(input.status, existingPublishedAt),
  };
}

export async function listPublishedBlogPosts(limit?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("blog_posts")
    .select("*, category:blog_categories(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as BlogPostWithCategory[];
}

export async function listPublishedBlogPostsByCategory(categorySlug: string) {
  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (categoryError) {
    throw categoryError;
  }

  if (!category) {
    return { category: null, posts: [] as BlogPostWithCategory[] };
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_categories(*)")
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return {
    category,
    posts: (data ?? []) as BlogPostWithCategory[],
  };
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_categories(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BlogPostWithCategory | null) ?? null;
}

export async function listBlogCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listAllBlogPostsAdmin() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_categories(*)")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as BlogPostWithCategory[];
}

export async function getBlogPostAdmin(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_categories(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as BlogPostWithCategory | null) ?? null;
}

export async function listBlogCategoriesAdmin() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createBlogPost(input: BlogPostInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(toInsertRow(input))
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function updateBlogPost(id: string, input: BlogPostInput) {
  const supabase = createAdminClient();
  const existing = await getBlogPostAdmin(id);

  if (!existing) {
    throw new Error("Inlägget hittades inte.");
  }

  const { error } = await supabase
    .from("blog_posts")
    .update(toUpdateRow(input, existing.published_at))
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteBlogPost(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function createBlogCategory(input: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("blog_categories")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function updateBlogCategory(
  id: string,
  input: { name: string; slug: string; description?: string | null },
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("blog_categories")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteBlogCategory(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("blog_categories").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function listPublishedBlogSlugs() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listBlogCategorySlugs() {
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("blog_categories").select("slug");

  if (error) {
    throw error;
  }

  return data ?? [];
}
