"use client";

import { useMemo, useState, useTransition } from "react";
import { BlogRichTextEditor } from "@/components/admin/blog-rich-text-editor";
import { CoverImageUpload, GalleryImageUpload } from "@/components/admin/cover-image-upload";
import { slugify } from "@/lib/blog/slug";
import type { Showcase } from "@/lib/db/showcases";
import { services } from "@/lib/services";

type ShowcaseFormProps = {
  showcase?: Showcase | null;
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  deleteAction?: () => Promise<{ ok: boolean; error?: string }>;
};

export function ShowcaseForm({ showcase, action, deleteAction }: ShowcaseFormProps) {
  const [title, setTitle] = useState(showcase?.title ?? "");
  const [slug, setSlug] = useState(showcase?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(showcase?.slug));
  const [content, setContent] = useState(showcase?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(showcase?.cover_image_url ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(showcase?.image_urls ?? []);
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
    formData.set("coverImageUrl", coverImageUrl);
    formData.set("imageUrls", imageUrls.join("\n"));

    startTransition(async () => {
      const result = await action(formData);

      if (!result.ok) {
        setError(result.error ?? "Kunde inte spara referensen.");
      }
    });
  }

  function handleDelete() {
    if (!deleteAction) {
      return;
    }

    if (!window.confirm("Ta bort referensen permanent?")) {
      return;
    }

    setError(null);
    startDeleteTransition(async () => {
      const result = await deleteAction();

      if (!result.ok) {
        setError(result.error ?? "Kunde inte ta bort referensen.");
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
            name="summary"
            rows={3}
            defaultValue={showcase?.summary ?? ""}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
            placeholder="Visas i listningen och som ingress på sidan."
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-green">
          Tjänst
          <select
            name="serviceSlug"
            required
            defaultValue={showcase?.service_slug ?? services[0]?.slug}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          >
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-green">
          Status
          <select
            name="status"
            defaultValue={showcase?.status ?? "draft"}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          >
            <option value="draft">Utkast</option>
            <option value="published">Publicerad</option>
          </select>
        </label>

        <div className="lg:col-span-2">
          <CoverImageUpload
            folder="showcase-covers"
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            helperText="Ladda upp en omslagsbild för referensen. Lämna tom för att använda första galleribilden."
          />
        </div>

        <div className="lg:col-span-2">
          <GalleryImageUpload
            folder="showcase-gallery"
            values={imageUrls}
            onChange={setImageUrls}
            label="Galleribilder"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-green">Vad vi gjorde</p>
        <BlogRichTextEditor
          name="content"
          value={content}
          onChange={setContent}
          placeholder="Beskriv uppdraget, lösningen och resultatet…"
        />
      </div>

      <div className="grid gap-6 rounded-2xl border border-green/10 bg-white p-6 shadow-sm lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-green">
          SEO-titel
          <input
            name="seoTitle"
            defaultValue={showcase?.seo_title ?? ""}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-green lg:col-span-2">
          SEO-beskrivning
          <textarea
            name="seoDescription"
            rows={3}
            defaultValue={showcase?.seo_description ?? ""}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending || isDeleting}
          className="rounded-full bg-green px-6 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
        >
          {isPending ? "Sparar…" : showcase ? "Spara ändringar" : "Skapa referens"}
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
