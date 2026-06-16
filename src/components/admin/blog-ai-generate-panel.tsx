"use client";

import { useState, useTransition } from "react";
import { generateBlogPostWithAiAction } from "@/app/admin/(dashboard)/blog/actions";
import type { BlogCategory } from "@/lib/db/blog";
import { services } from "@/lib/services";

type BlogAiGeneratePanelProps = {
  categories: BlogCategory[];
};

export function BlogAiGeneratePanel({ categories }: BlogAiGeneratePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [generateTopic, setGenerateTopic] = useState(false);
  const [serviceSlug, setServiceSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await generateBlogPostWithAiAction({
        topic: topic.trim() || undefined,
        generateTopic,
        serviceSlug: serviceSlug || undefined,
        categoryId: categoryId || null,
        status,
        services: services.map((service) => ({
          slug: service.slug,
          title: service.title,
          description: service.description,
        })),
      });

      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-gold/40 bg-white px-5 py-3 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
      >
        Generera med AI
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-gold/25 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">AI-blogg</p>
          <h2 className="mt-1 font-display text-2xl text-green">Generera SEO-artikel</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Skapar ett utkast med text, SEO-fält och omslagsbild. AI kontrollerar befintliga ämnen så att
            inlägget inte duplicerar tidigare artiklar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full border border-green/15 px-4 py-2 text-sm font-semibold text-green transition hover:border-gold hover:text-gold"
        >
          Stäng
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-green">Ämne</span>
          <input
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            disabled={generateTopic || isPending}
            placeholder="T.ex. Hemstädning i Vasastan – så förbereder du hemmet"
            className="rounded-xl border border-green/10 bg-ivory/30 px-4 py-3 text-sm text-green outline-none transition focus:border-gold disabled:opacity-60"
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-green">
          <input
            type="checkbox"
            checked={generateTopic}
            onChange={(event) => setGenerateTopic(event.target.checked)}
            disabled={isPending}
            className="h-4 w-4 rounded border-green/20"
          />
          Låt AI föreslå ett nytt ämne (kontrollerar befintliga artiklar)
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-green">Tjänstfokus</span>
            <select
              value={serviceSlug}
              onChange={(event) => setServiceSlug(event.target.value)}
              disabled={isPending}
              className="rounded-xl border border-green/10 bg-ivory/30 px-4 py-3 text-sm text-green outline-none transition focus:border-gold disabled:opacity-60"
            >
              <option value="">Allmänt / valfritt</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-green">Kategori</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={isPending}
              className="rounded-xl border border-green/10 bg-ivory/30 px-4 py-3 text-sm text-green outline-none transition focus:border-gold disabled:opacity-60"
            >
              <option value="">Ingen kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-green">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "draft" | "published")}
              disabled={isPending}
              className="rounded-xl border border-green/10 bg-ivory/30 px-4 py-3 text-sm text-green outline-none transition focus:border-gold disabled:opacity-60"
            >
              <option value="draft">Spara som utkast</option>
              <option value="published">Publicera direkt</option>
            </select>
          </label>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending || (!topic.trim() && !generateTopic)}
            className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
          >
            {isPending ? "Genererar artikel och omslagsbild…" : "Generera blogginlägg"}
          </button>
        </div>
      </form>
    </div>
  );
}
