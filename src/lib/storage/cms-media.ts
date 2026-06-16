export const CMS_MEDIA_BUCKET = "cms-media";

export type CmsMediaFolder =
  | "blog-covers"
  | "showcase-covers"
  | "showcase-gallery";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const maxFileSizeBytes = 5 * 1024 * 1024;

export function getCmsMediaPublicUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL saknas.");
  }

  return `${baseUrl}/storage/v1/object/public/${CMS_MEDIA_BUCKET}/${path}`;
}

export function validateCmsImageFile(file: File) {
  if (!allowedMimeTypes.has(file.type)) {
    return "Ogiltig filtyp. Använd JPG, PNG, WebP eller GIF.";
  }

  if (file.size > maxFileSizeBytes) {
    return "Filen får vara max 5 MB.";
  }

  return null;
}

export function buildCmsMediaPath(folder: CmsMediaFolder, fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
    ? extension
    : "jpg";

  return `${folder}/${crypto.randomUUID()}.${safeExtension}`;
}
