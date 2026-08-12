import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callOpenAiJson, generateCoverImage } from "../_shared/openai.ts";
import { corsHeaders, ensureUniqueSlug, jsonResponse, sanitizeArticleContent, slugify } from "../_shared/blog-utils.ts";

type ServiceContext = {
  slug: string;
  title: string;
  description: string;
};

type GenerateRequest = {
  topic?: string;
  generateTopic?: boolean;
  serviceSlug?: string;
  status?: "draft" | "published";
  categoryId?: string | null;
  services?: ServiceContext[];
};

type TopicSuggestion = {
  topic: string;
  rationale: string;
};

type GeneratedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  coverImagePrompt: string;
};

const STOCKHOLM_AREA =
  "Stockholm, Södermalm, Vasastan, Östermalm, Kungsholmen, Bromma, Nacka, Täby, Solna, Sundbyberg och närliggande områden";

function buildServicesText(services: ServiceContext[]) {
  if (!services.length) {
    return "Städ, måleri/bygg/renovering, handyman, inredning samt övriga tjänster (rörmokare, elektriker, besiktningsman).";
  }

  return services.map((service) => `- ${service.title} (${service.slug}): ${service.description}`).join("\n");
}

function buildExistingTopicsText(titles: string[]) {
  if (!titles.length) {
    return "Inga befintliga artiklar ännu.";
  }

  return titles.map((title) => `- ${title}`).join("\n");
}

async function suggestTopic(
  existingTitles: string[],
  services: ServiceContext[],
  serviceSlug?: string,
) {
  const focusedService = serviceSlug
    ? services.find((service) => service.slug === serviceSlug)
    : null;

  const result = await callOpenAiJson<TopicSuggestion>([
    {
      role: "system",
      content:
        "Du är en svensk SEO-strateg för HemVända, ett hem- och hantverksföretag i Stockholm. Svara alltid med giltig JSON.",
    },
    {
      role: "user",
      content: `Föreslå ETT nytt bloggämne som inte överlappar befintliga artiklar.

Befintliga artiklar:
${buildExistingTopicsText(existingTitles)}

Tjänster:
${buildServicesText(services)}

Geografiskt fokus: ${STOCKHOLM_AREA}

${focusedService ? `Prioritera tjänsten: ${focusedService.title}` : "Välj en tjänst som passar ämnet."}

Krav:
- Svenska
- Lokalt SEO-fokus mot Stockholm
- Inte samma vinkel som befintliga artiklar
- Ska fungera som en informativ landningssida som leder till bokning
- Undvik generiska rubriker som bara upprepar tjänstens namn

Returnera JSON:
{
  "topic": "string",
  "rationale": "string"
}`,
    },
  ]);

  if (!result.topic?.trim()) {
    throw new Error("AI kunde inte föreslå ett ämne.");
  }

  return result.topic.trim();
}

async function generateArticle(topic: string, services: ServiceContext[], serviceSlug?: string) {
  const focusedService = serviceSlug
    ? services.find((service) => service.slug === serviceSlug)
    : null;

  return callOpenAiJson<GeneratedArticle>([
    {
      role: "system",
      content:
        "Du är en svensk copywriter och SEO-specialist för HemVända. Skriv färdiga bloggartiklar som HTML för TipTap – aldrig dispositioner, steg-rubriker eller interna anteckningar. Svara med giltig JSON.",
    },
    {
      role: "user",
      content: `Skriv en SEO-optimerad bloggartikel på svenska.

Ämne: ${topic}
Varumärke: HemVända
Geografiskt fokus: ${STOCKHOLM_AREA}
${focusedService ? `Huvudtjänst att koppla till: ${focusedService.title}` : ""}

Tjänster att kunna nämna naturligt:
${buildServicesText(services)}

Krav på innehåll:
- 900-1300 ord
- HTML utan <html>, <body> eller <h1>
- Använd <h2>, <h3>, <p>, <ul>, <li>, <strong>
- Inkludera lokala referenser till Stockholm och närliggande områden
- Avsluta med 1–2 vanliga stycken (<p>) som naturligt uppmuntrar läsaren att boka via HemVända
- Skriv för människor, inte keyword stuffing
- Undvik påhittade priser, garantier eller erbjudanden
- ALDRIG rubriker som beskriver artikelns struktur eller skrivprocess, t.ex. "Inledning", "Avslutning och CTA", "Sammanfattning", "CTA" eller "Call to action"
- Alla rubriker ska vara informativa och läsbara för besökaren, inte interna planeringsetiketter

SEO:
- seoTitle max 60 tecken
- seoDescription max 155 tecken
- slug på svenska, URL-vänlig (ascii, bindestreck)

coverImagePrompt:
- Engelska
- Fotorealistisk omslagsbild för blogg
- Skandinavisk interiör / hem / hantverk beroende på ämne
- Varm, premium, naturligt ljus
- Ingen text i bilden, inga logotyper

Returnera JSON:
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "seoTitle": "string",
  "seoDescription": "string",
  "coverImagePrompt": "string"
}`,
    },
  ]);
}

function getPublicMediaUrl(supabaseUrl: string, path: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/cms-media/${path}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse({ ok: false, error: "Supabase environment saknas." }, 500);
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ ok: false, error: "Ingen autentisering." }, 401);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ ok: false, error: "Ogiltig session." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: membership, error: membershipError } = await admin
      .from("team_members")
      .select("role, is_active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      membershipError ||
      !membership?.is_active ||
      (membership.role !== "admin" && membership.role !== "staff")
    ) {
      return jsonResponse({ ok: false, error: "Du har inte behörighet." }, 403);
    }

    const body = (await req.json()) as GenerateRequest;
    const services = body.services ?? [];
    const status = body.status === "published" ? "published" : "draft";

    const { data: existingPosts, error: postsError } = await admin
      .from("blog_posts")
      .select("title, slug")
      .order("created_at", { ascending: false });

    if (postsError) {
      throw postsError;
    }

    const existingTitles = (existingPosts ?? []).map((post) => post.title);

    let topic = body.topic?.trim() ?? "";

    if (!topic && body.generateTopic) {
      topic = await suggestTopic(existingTitles, services, body.serviceSlug);
    }

    if (!topic) {
      return jsonResponse(
        { ok: false, error: "Ange ett ämne eller välj att generera ett ämne med AI." },
        400,
      );
    }

    const article = await generateArticle(topic, services, body.serviceSlug);

    const baseSlug = slugify(article.slug || article.title || topic);
    const slug = await ensureUniqueSlug(admin, baseSlug);

    const image = await generateCoverImage(article.coverImagePrompt);
    const imagePath = `blog-covers/${crypto.randomUUID()}.${image.extension}`;

    const { error: uploadError } = await admin.storage.from("cms-media").upload(imagePath, image.bytes, {
      contentType: image.contentType,
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const coverImageUrl = getPublicMediaUrl(supabaseUrl, imagePath);

    const { data: insertedPost, error: insertError } = await admin
      .from("blog_posts")
      .insert({
        title: article.title.trim(),
        slug,
        excerpt: article.excerpt.trim(),
        content: sanitizeArticleContent(article.content.trim()),
        cover_image_url: coverImageUrl,
        category_id: body.categoryId ?? null,
        status,
        seo_title: article.seoTitle.trim(),
        seo_description: article.seoDescription.trim(),
        author_id: user.id,
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .select("id, title, slug")
      .single();

    if (insertError) {
      throw insertError;
    }

    return jsonResponse({
      ok: true,
      postId: insertedPost.id,
      title: insertedPost.title,
      slug: insertedPost.slug,
      topic,
    });
  } catch (error) {
    console.error("generate-blog-post error:", error);

    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Kunde inte generera blogginlägg.",
      },
      500,
    );
  }
});
