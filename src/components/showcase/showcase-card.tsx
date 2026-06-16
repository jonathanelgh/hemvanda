import Link from "next/link";
import type { Showcase } from "@/lib/db/showcases";
import { getService } from "@/lib/services";

export function ShowcaseCard({ showcase }: { showcase: Showcase }) {
  const service = getService(showcase.service_slug);
  const cover = showcase.cover_image_url ?? showcase.image_urls[0] ?? null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-green/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/referenser/${showcase.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={showcase.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-green/10 to-gold/10 px-6 text-center text-sm font-semibold text-green/60">
              {showcase.title}
            </div>
          )}
        </div>
        <div className="p-6">
          {service ? (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {service.title}
            </p>
          ) : null}
          <h2 className="mt-3 font-display text-2xl text-green transition group-hover:text-gold">
            {showcase.title}
          </h2>
          {showcase.summary ? (
            <p className="mt-3 text-sm leading-7 text-muted">{showcase.summary}</p>
          ) : null}
          <span className="mt-5 inline-flex text-sm font-semibold text-green transition group-hover:text-gold">
            Se projektet →
          </span>
        </div>
      </Link>
    </article>
  );
}

export function ShowcaseGallery({ imageUrls, title }: { imageUrls: string[]; title: string }) {
  if (imageUrls.length === 0) {
    return null;
  }

  if (imageUrls.length === 1) {
    return (
      <div className="overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrls[0]} alt={title} className="aspect-[16/10] w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {imageUrls.map((url, index) => (
        <div key={url + index} className="overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`${title} – bild ${index + 1}`}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
