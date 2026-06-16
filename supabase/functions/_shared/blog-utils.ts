import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function ensureUniqueSlug(admin: SupabaseClient, baseSlug: string) {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data } = await admin.from("blog_posts").select("slug").eq("slug", slug);

    if (!data?.length) {
      return slug;
    }

    const trimmed = baseSlug.slice(0, Math.max(1, 80 - String(suffix).length - 1));
    slug = `${trimmed}-${suffix}`;
    suffix += 1;
  }
}
