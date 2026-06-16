"use server";

import { getTeamSession } from "@/lib/admin/auth";
import {
  buildCmsMediaPath,
  CMS_MEDIA_BUCKET,
  getCmsMediaPublicUrl,
  validateCmsImageFile,
  type CmsMediaFolder,
} from "@/lib/storage/cms-media";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

const allowedFolders: CmsMediaFolder[] = [
  "blog-covers",
  "showcase-covers",
  "showcase-gallery",
];

export async function uploadCmsImageAction(formData: FormData): Promise<UploadResult> {
  const session = await getTeamSession();

  if (!session.user || !session.profile) {
    return { ok: false, error: "Du måste vara inloggad för att ladda upp bilder." };
  }

  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: "Uppladdning är inte konfigurerad (saknar service role-nyckel)." };
  }

  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "") as CmsMediaFolder;

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Välj en bild att ladda upp." };
  }

  if (!allowedFolders.includes(folder)) {
    return { ok: false, error: "Ogiltig uppladdningsmapp." };
  }

  const validationError = validateCmsImageFile(file);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    const path = buildCmsMediaPath(folder, file.name);
    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage.from(CMS_MEDIA_BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("CMS media upload failed:", error.message);
      return { ok: false, error: "Kunde inte ladda upp bilden." };
    }

    return {
      ok: true,
      url: getCmsMediaPublicUrl(path),
      path,
    };
  } catch (error) {
    console.error("CMS media upload error:", error);
    return { ok: false, error: "Kunde inte ladda upp bilden." };
  }
}
