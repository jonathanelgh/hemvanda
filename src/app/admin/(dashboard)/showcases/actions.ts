"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTeamSession } from "@/lib/admin/auth";
import { slugify } from "@/lib/blog/slug";
import {
  createShowcase,
  deleteShowcase,
  isValidShowcaseServiceSlug,
  updateShowcase,
  type ShowcaseInput,
  type ShowcaseStatus,
} from "@/lib/db/showcases";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseImageUrls(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseShowcaseInput(formData: FormData): ShowcaseInput {
  const status = String(formData.get("status") ?? "draft") as ShowcaseStatus;

  if (status !== "draft" && status !== "published") {
    throw new Error("Ogiltig status.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const serviceSlug = String(formData.get("serviceSlug") ?? "").trim();

  if (!title || !slug) {
    throw new Error("Titel och slug krävs.");
  }

  if (!isValidShowcaseServiceSlug(serviceSlug)) {
    throw new Error("Välj en giltig tjänst.");
  }

  return {
    title,
    slug,
    summary: String(formData.get("summary") ?? "").trim() || null,
    content: String(formData.get("content") ?? ""),
    serviceSlug,
    imageUrls: parseImageUrls(String(formData.get("imageUrls") ?? "")),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
    status,
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
    seoDescription: String(formData.get("seoDescription") ?? "").trim() || null,
  };
}

function revalidateShowcasePaths(slug?: string) {
  revalidatePath("/referenser");
  revalidatePath("/admin/showcases");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(`/referenser/${slug}`);
  }
}

export async function createShowcaseAction(formData: FormData): Promise<ActionResult> {
  await requireTeamSession();

  let id: string;

  try {
    const input = parseShowcaseInput(formData);
    id = await createShowcase(input);
    revalidateShowcasePaths(input.slug);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte skapa referensen.",
    };
  }

  redirect(`/admin/showcases/${id}`);
}

export async function updateShowcaseAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireTeamSession();

  try {
    const input = parseShowcaseInput(formData);
    await updateShowcase(id, input);
    revalidateShowcasePaths(input.slug);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte spara referensen.",
    };
  }
}

export async function deleteShowcaseAction(id: string): Promise<ActionResult> {
  await requireTeamSession();

  try {
    await deleteShowcase(id);
    revalidateShowcasePaths();
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Kunde inte ta bort referensen.",
    };
  }

  redirect("/admin/showcases");
}

export async function slugifyShowcaseTitleAction(title: string) {
  await requireTeamSession();
  return slugify(title);
}
