"use client";

import { useRef, useState, useTransition } from "react";
import { uploadCmsImageAction } from "@/app/admin/(dashboard)/media/actions";
import type { CmsMediaFolder } from "@/lib/storage/cms-media";

type CoverImageUploadProps = {
  name?: string;
  folder: CmsMediaFolder;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
};

export function CoverImageUpload({
  name = "coverImageUrl",
  folder,
  value,
  onChange,
  label = "Omslagsbild",
  helperText,
}: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

    startUploadTransition(async () => {
      const result = await uploadCmsImageAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onChange(result.url);
    });

    event.target.value = "";
  }

  return (
    <div className="grid gap-2">
      <div>
        <p className="text-sm font-semibold text-green">{label}</p>
        {helperText ? <p className="mt-0.5 text-xs text-muted">{helperText}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative shrink-0 overflow-hidden rounded-lg border border-green/10 bg-ivory/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Omslagsbild" className="size-20 object-cover" />
          </div>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-green/15 bg-ivory/40 text-[10px] leading-tight text-muted disabled:opacity-60"
          >
            Ingen bild
          </button>
        )}

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-green/15 px-3 py-1.5 text-xs font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
          >
            {isUploading ? "Laddar upp…" : value ? "Byt bild" : "Ladda upp"}
          </button>
          {value ? (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => onChange("")}
              className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              Ta bort
            </button>
          ) : null}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      <input type="hidden" name={name} value={value} readOnly />

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

type GalleryImageUploadProps = {
  name?: string;
  folder: CmsMediaFolder;
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
};

export function GalleryImageUpload({
  name = "imageUrls",
  folder,
  values,
  onChange,
  label = "Bilder",
}: GalleryImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setError(null);

    startUploadTransition(async () => {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folder", folder);

        const result = await uploadCmsImageAction(formData);

        if (!result.ok) {
          setError(result.error);
          break;
        }

        uploadedUrls.push(result.url);
      }

      if (uploadedUrls.length > 0) {
        onChange([...values, ...uploadedUrls]);
      }
    });

    event.target.value = "";
  }

  function removeImage(url: string) {
    onChange(values.filter((value) => value !== url));
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-green">{label}</p>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-green/15 px-3 py-1.5 text-xs font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
        >
          {isUploading ? "Laddar upp…" : "Ladda upp bilder"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFilesChange}
      />
      <input type="hidden" name={name} value={values.join("\n")} readOnly />

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {values.length === 0 ? (
        <p className="text-xs text-muted">Inga bilder uppladdade ännu.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((url) => (
            <div
              key={url}
              className="group relative size-16 overflow-hidden rounded-md border border-green/10 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Referensbild" className="size-full object-cover" />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => removeImage(url)}
                aria-label="Ta bort bild"
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-60"
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
