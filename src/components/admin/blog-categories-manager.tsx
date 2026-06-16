"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { slugify } from "@/lib/blog/slug";
import type { BlogCategory } from "@/lib/db/blog";

type BlogCategoriesManagerProps = {
  categories: BlogCategory[];
  createAction: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  updateAction: (
    id: string,
    formData: FormData,
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteAction: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

export function BlogCategoriesManager({
  categories,
  createAction,
  updateAction,
  deleteAction,
}: BlogCategoriesManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createSlugTouched, setCreateSlugTouched] = useState(false);

  useEffect(() => {
    if (!createOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCreateOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [createOpen]);

  function runAction(
    action: () => Promise<{ ok: boolean; error?: string }>,
    onSuccess?: () => void,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }

      onSuccess?.();
      router.refresh();
    });
  }

  function openCreateModal() {
    setError(null);
    setCreateName("");
    setCreateSlug("");
    setCreateSlugTouched(false);
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (isPending) {
      return;
    }

    setCreateOpen(false);
  }

  function handleCreateSubmit(formData: FormData) {
    const slug = createSlugTouched ? createSlug : slugify(createName);
    formData.set("slug", slug);

    runAction(async () => createAction(formData), () => {
      setCreateOpen(false);
    });
  }

  const previewSlug = createSlugTouched ? createSlug : slugify(createName);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/blog"
            className="text-sm font-semibold text-green/70 transition hover:text-gold"
          >
            ← Tillbaka till blogg
          </Link>
          <p className="mt-3 text-sm text-muted">
            Hantera kategorier som visas på bloggen och i filter.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink"
        >
          Ny kategori
        </button>
      </div>

      {error && !createOpen ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green/15 bg-white px-6 py-12 text-center text-sm text-muted">
          Inga kategorier ännu. Skapa din första kategori.
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              disabled={isPending}
              onUpdate={(formData) =>
                runAction(async () => updateAction(category.id, formData))
              }
              onDelete={() => {
                if (!window.confirm(`Ta bort kategorin "${category.name}"?`)) {
                  return;
                }

                runAction(async () => deleteAction(category.id));
              }}
            />
          ))}
        </div>
      )}

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Stäng"
            className="absolute inset-0 bg-green/40 backdrop-blur-sm"
            onClick={closeCreateModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-category-title"
            className="relative w-full max-w-lg rounded-2xl border border-green/10 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  Ny kategori
                </p>
                <h2
                  id="create-category-title"
                  className="mt-1 font-display text-2xl text-green"
                >
                  Skapa kategori
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green/15 text-lg text-green transition hover:border-gold hover:text-gold"
                aria-label="Stäng"
              >
                ×
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form action={handleCreateSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-green">
                Namn
                <input
                  name="name"
                  required
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
                  placeholder="Städtips"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-green">
                URL-slug
                <input
                  value={previewSlug}
                  onChange={(event) => {
                    setCreateSlugTouched(true);
                    setCreateSlug(slugify(event.target.value));
                  }}
                  className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
                  placeholder="stadtips"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-green">
                Beskrivning (valfritt)
                <textarea
                  name="description"
                  rows={3}
                  className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
                  placeholder="Kort beskrivning av kategorin"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isPending}
                  className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
                >
                  {isPending ? "Skapar…" : "Skapa kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CategoryRow({
  category,
  disabled,
  onUpdate,
  onDelete,
}: {
  category: BlogCategory;
  disabled: boolean;
  onUpdate: (formData: FormData) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [description, setDescription] = useState(category.description ?? "");

  return (
    <article className="rounded-2xl border border-green/10 bg-white p-5 shadow-sm">
      <form action={onUpdate} className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-green">
            Namn
            <input
              name="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-green">
            URL-slug
            <input
              name="slug"
              required
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-green">
          Beskrivning
          <textarea
            name="description"
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-xl border border-green/10 px-4 py-3 font-normal text-green"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/blog/kategori/${category.slug}`}
            className="text-sm font-semibold text-green/70 transition hover:text-gold"
          >
            /blog/kategori/{category.slug}
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={disabled}
              className="rounded-full border border-green/15 px-4 py-2 text-sm font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
            >
              Spara
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={onDelete}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              Ta bort
            </button>
          </div>
        </div>
      </form>
    </article>
  );
}
