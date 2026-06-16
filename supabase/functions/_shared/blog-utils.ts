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

const metaHeadingPattern =
  /^(inledning|introduktion|bakgrund|huvuddel|sammanfattning|slutsats|avslutning(\s+och\s+cta)?|cta|call\s*to\s*action|n[aä]sta\s+steg)$/i;

export function sanitizeArticleContent(html: string) {
  return html.replace(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi, (match, _level, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();

    if (metaHeadingPattern.test(text) || /\bcta\b/i.test(text)) {
      return "";
    }

    return match;
  });
}
