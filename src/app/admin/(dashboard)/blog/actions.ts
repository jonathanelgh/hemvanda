"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  GenerateBlogPostRequest,
  GenerateBlogPostResponse,
} from "@/lib/ai/blog-generation";
import { requireTeamSession } from "@/lib/admin/auth";
import { slugify } from "@/lib/blog/slug";
import { services } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import {
  createBlogCategory,
  createBlogPost,
  deleteBlogCategory,
  deleteBlogPost,
  updateBlogCategory,
  updateBlogPost,
  type BlogPostInput,
  type BlogPostStatus,
} from "@/lib/db/blog";

type ActionResult = { ok: true } | { ok: false; error: string };

function parsePostInput(formData: FormData, authorId?: string | null): BlogPostInput {
  const status = String(formData.get("status") ?? "draft") as BlogPostStatus;

  if (status !== "draft" && status !== "published") {
    throw new Error("Ogiltig status.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!title || !slug) {
    throw new Error("Titel och slug krävs.");
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim();

  return {
    title,
    slug,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    content: String(formData.get("content") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
    categoryId: categoryId || null,
    status,
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
    seoDescription: String(formData.get("seoDescription") ?? "").trim() || null,
    authorId: authorId ?? null,
  };
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/categories");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function createBlogPostAction(
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireTeamSession();

  let id: string;

  try {
    const input = parsePostInput(formData, user.id);
    id = await createBlogPost(input);
    revalidateBlogPaths(input.slug);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte skapa inlägget.",
    };
  }

  redirect(`/admin/blog/${id}`);
}

export async function updateBlogPostAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireTeamSession();

  try {
    const input = parsePostInput(formData);
    await updateBlogPost(id, input);
    revalidateBlogPaths(input.slug);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte spara inlägget.",
    };
  }
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  await requireTeamSession();

  try {
    await deleteBlogPost(id);
    revalidateBlogPaths();
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte ta bort inlägget.",
    };
  }

  redirect("/admin/blog");
}

export async function createBlogCategoryAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireTeamSession();

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(name);
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name || !slug) {
    return { ok: false, error: "Namn och slug krävs." };
  }

  try {
    await createBlogCategory({ name, slug, description });
    revalidatePath("/admin/blog");
    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte skapa kategorin.",
    };
  }
}

export async function updateBlogCategoryAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireTeamSession();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name || !slug) {
    return { ok: false, error: "Namn och slug krävs." };
  }

  try {
    await updateBlogCategory(id, { name, slug, description });
    revalidatePath("/admin/blog");
    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte uppdatera kategorin.",
    };
  }
}

export async function deleteBlogCategoryAction(id: string): Promise<ActionResult> {
  await requireTeamSession();

  try {
    await deleteBlogCategory(id);
    revalidatePath("/admin/blog");
    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte ta bort kategorin.",
    };
  }
}

function revalidateGeneratedBlogPost(slug: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/blog/${slug}`);
}

export async function generateBlogPostWithAiAction(
  input: GenerateBlogPostRequest,
): Promise<GenerateBlogPostResponse> {
  await requireTeamSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, error: "Supabase är inte konfigurerat." };
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, error: "Du måste vara inloggad för att generera inlägg." };
  }

  const topic = input.topic?.trim();
  const generateTopic = Boolean(input.generateTopic);

  if (!topic && !generateTopic) {
    return { ok: false, error: "Ange ett ämne eller välj att låta AI föreslå ett." };
  }

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/functions/v1/generate-blog-post`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        generateTopic,
        serviceSlug: input.serviceSlug || undefined,
        status: input.status ?? "draft",
        categoryId: input.categoryId ?? null,
        services: (input.services ?? services).map((service) => ({
          slug: service.slug,
          title: service.title,
          description: service.description,
        })),
      }),
    });

    const payload = (await response.json()) as GenerateBlogPostResponse;

    if (!response.ok || !payload.ok) {
      return {
        ok: false,
        error: payload.ok ? "Kunde inte generera blogginlägg." : payload.error,
      };
    }

    revalidateGeneratedBlogPost(payload.slug);
    redirect(`/admin/blog/${payload.postId}`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte generera blogginlägg.",
    };
  }
}
