"use client";

import { useMemo, useState, useTransition } from "react";
import { BlogRichTextEditor } from "@/components/admin/blog-rich-text-editor";
import { CoverImageUpload } from "@/components/admin/cover-image-upload";
import { slugify } from "@/lib/blog/slug";
import type { BlogCategory, BlogPostWithCategory } from "@/lib/db/blog";

type BlogPostFormProps = {
  post?: BlogPostWithCategory | null;
  categories: BlogCategory[];
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  deleteAction?: () => Promise<{ ok: boolean; error?: string }>;
};

export function BlogPostForm({
  post,
  categories,
  action,
  deleteAction,
}: BlogPostFormProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const previewSlug = useMemo(() => {
    if (slugTouched) {
      return slug;
    }

    return slugify(title);
  }, [slug, slugTouched, title]);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("content", content);
    formData.set("slug", slugTouched ? slug : slugify(title));

    startTransition(async () => {
      const result = await action(formData);

      if (!result.ok) {
        setError(result.error ?? "Kunde inte spara inlägget.");
      }
    });
  }

  function handleDelete() {
    if (!deleteAction) {
      return;
    }

    if (!window.confirm("Ta bort blogginlägget permanent?")) {
      return;
    }

    setError(null);
    startDeleteTransition(async () => {
      const result = await deleteAction();

      if (!result.ok) {
        setError(result.error ?? "Kunde inte ta bort inlägget.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 rounded-2xl border border-green/10 bg-white p-6 shadow-sm lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-green">
          Titel
          <input
            name="title"
            required
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-green">
          URL-slug
          <input
            name="slugDisplay"
            required
            value={slugTouched ? slug : previewSlug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-green lg:col-span-2">
          Kort sammanfattning
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt ?? ""}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
            placeholder="Visas i listningar och sökresultat."
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-green">
          Kategori
          <select
            name="categoryId"
            defaultValue={post?.category_id ?? ""}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          >
            <option value="">Ingen kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-green">
          Status
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          >
            <option value="draft">Utkast</option>
            <option value="published">Publicerad</option>
          </select>
        </label>

        <div className="lg:col-span-2">
          <CoverImageUpload
            folder="blog-covers"
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            helperText="Ladda upp en bild som visas i blogglistan och när inlägget delas."
          />
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-green">Innehåll</p>
        <BlogRichTextEditor name="content" value={content} onChange={setContent} />
      </div>

      <div className="grid gap-6 rounded-2xl border border-green/10 bg-white p-6 shadow-sm lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-green">
          SEO-titel
          <input
            name="seoTitle"
            defaultValue={post?.seo_title ?? ""}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
            placeholder="Lämna tom för att använda titeln"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-green lg:col-span-2">
          SEO-beskrivning
          <textarea
            name="seoDescription"
            rows={3}
            defaultValue={post?.seo_description ?? ""}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
            placeholder="Lämna tom för att använda sammanfattningen"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending || isDeleting}
          className="rounded-full bg-green px-6 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
        >
          {isPending ? "Sparar…" : post ? "Spara ändringar" : "Skapa inlägg"}
        </button>

        {deleteAction ? (
          <button
            type="button"
            disabled={isPending || isDeleting}
            onClick={handleDelete}
            className="rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Tar bort…" : "Ta bort"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
