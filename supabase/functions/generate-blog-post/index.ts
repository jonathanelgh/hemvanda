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
  mode?: "article" | "fill-topics" | "publish-topic";
  topic?: string;
  generateTopic?: boolean;
  serviceSlug?: string;
  status?: "draft" | "published";
  categoryId?: string | null;
  services?: ServiceContext[];
  topicId?: string;
  count?: number;
};

const HEMVANDA_SERVICES: ServiceContext[] = [
  {
    slug: "stad",
    title: "Städ",
    description: "Hemstäd, storstäd, flyttstäd och fönsterputs i Stockholm.",
  },
  {
    slug: "snickeri-bygg-renovering",
    title: "Måleri, bygg och renovering",
    description: "Måleri, byggprojekt och avgränsade renoveringar.",
  },
  {
    slug: "handyman",
    title: "Handyman",
    description: "Montering, upphängning, småfix och enklare reparationer.",
  },
  {
    slug: "inredning",
    title: "Inredning",
    description: "Inredning och styling för vardag, fotografering eller försäljning.",
  },
];

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
  "Stockholm och Stockholms områden: Södermalm, Vasastan, Östermalm, Kungsholmen, Norrmalm, Gamla stan, Hammarby sjöstad, Liljeholmen, Årsta, Enskede, Hägersten, Bromma, Farsta, Skärholmen, Hässelby, Vällingby, Kista, Solna, Sundbyberg, Nacka, Lidingö, Täby, Danderyd, Sollentuna, Järfälla, Huddinge, Tyresö, Haninge, Botkyrka, Ekerö och närliggande orter";

const SEO_FOCUS = `Varje artikel är en lokal SEO-text för EN av HemVändas tjänster i ETT område i Stockholm eller Stockholms län.
Tjänsterna är hemstäd, storstäd, flyttstäd, fönsterputs, måleri, bygg, renovering, handyman och inredning/styling.
Rubrik, sökfras och text ska kunna hittas av någon som googlar tjänsten tillsammans med området, till exempel "hemstäd Vasastan", "flyttstäd Nacka" eller "fönsterputs Bromma".
Skriv inte allmänna hemtips, nyheter eller artiklar som saknar både en bokningsbar tjänst och ett område i Stockholm.`;

function buildServicesText(services: ServiceContext[]) {
  if (!services.length) {
    return "Städ, måleri/bygg/renovering, handyman och inredning.";
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

${SEO_FOCUS}

Krav:
- Svenska
- Rubriken ska innehålla både tjänsten och området
- Inte samma tjänst och område som en befintlig artikel
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
Områden vi skriver om: ${STOCKHOLM_AREA}
${focusedService ? `Huvudtjänst: ${focusedService.title}. Artikeln ska handla om den tjänsten, inte om andra tjänster.` : "Välj den tjänst som ämnet gäller och håll dig till den."}

Tjänster:
${buildServicesText(services)}

${SEO_FOCUS}

Krav på innehåll:
- 900-1300 ord
- HTML utan <html>, <body> eller <h1>
- Använd <h2>, <h3>, <p>, <ul>, <li>, <strong>
- Nämn tjänsten och området i titel, ingress och minst två rubriker
- Nämn närliggande stadsdelar eller orter bara när det hjälper den som söker i just det området
- Skriv inte om andra städer än Stockholm med omnejd
- Avsluta med 1–2 vanliga stycken (<p>) som naturligt uppmuntrar läsaren att boka just den tjänsten hos HemVända i området
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

function topicSimilarityKey(title: string) {
  return slugify(title).slice(0, 160);
}

async function fillTopicQueue(
  admin: ReturnType<typeof createClient>,
  count: number,
) {
  const target = Math.max(4, Math.min(count || 12, 40));
  const services = HEMVANDA_SERVICES;

  const [{ data: categories }, { data: existingTopics }, { data: existingPosts }] = await Promise.all([
    admin.from("blog_categories").select("id, name, slug"),
    admin.from("blog_topics").select("title, similarity_key").order("created_at", { ascending: false }).limit(200),
    admin.from("blog_posts").select("title, slug").order("created_at", { ascending: false }).limit(100),
  ]);

  const categoryRows = categories ?? [];
  const existingKeys = new Set<string>();
  const avoid: string[] = [];

  for (const topic of existingTopics ?? []) {
    existingKeys.add(topic.similarity_key);
    avoid.push(topic.title);
  }

  for (const post of existingPosts ?? []) {
    existingKeys.add(topicSimilarityKey(post.title));
    existingKeys.add(post.slug);
    avoid.push(post.title);
  }

  const categoryList = categoryRows.length
    ? categoryRows.map((category) => category.name).join(", ")
    : "ingen fast kategori";

  const result = await callOpenAiJson<{ topics?: Array<Record<string, unknown>> }>([
    {
      role: "system",
      content:
        "Du är en svensk SEO-strateg för HemVända, ett hem- och hantverksföretag i Stockholm. Svara alltid med giltig JSON.",
    },
    {
      role: "user",
      content: `Föreslå exakt ${target} nya bloggämnen som inte överlappar befintliga artiklar.

Befintliga ämnen:
${avoid.length ? avoid.map((title) => `- ${title}`).join("\n") : "- Inga ännu."}

Tjänster:
${buildServicesText(services)}

Kategorier att välja bland: ${categoryList}
Tillåtna serviceSlug: ${services.map((service) => service.slug).join(", ")}
Geografiskt fokus: ${STOCKHOLM_AREA}

${SEO_FOCUS}

Krav:
- Svenska
- Fördela ämnena jämnt mellan tjänsterna
- Variera områdena så att inte alla hamnar i innerstan
- Rubriken ska innehålla tjänsten och området
- targetKeyword ska vara en sökfras med tjänst och område
- Inte samma tjänst och område som befintliga ämnen
- Informativt, utan säljpitch i rubriken
- Inga tankstreck i rubriker

Returnera JSON:
{
  "topics": [
    {
      "title": "string",
      "angle": "string",
      "category": "string eller tom",
      "serviceSlug": "string",
      "targetKeyword": "string",
      "keywords": ["string"]
    }
  ]
}`,
    },
  ]);

  const rows = [];

  for (const [index, item] of (result.topics ?? []).entries()) {
    const title = String(item.title ?? "").replace(/[—–]/g, "-").trim();
    const key = topicSimilarityKey(title);
    if (!title || !key || existingKeys.has(key)) continue;
    existingKeys.add(key);

    const categoryName = String(item.category ?? "").trim().toLowerCase();
    const category = categoryRows.find(
      (row) => row.name.trim().toLowerCase() === categoryName || row.slug === categoryName,
    );
    const serviceSlug = services.some((service) => service.slug === item.serviceSlug)
      ? String(item.serviceSlug)
      : null;
    const keywords = Array.isArray(item.keywords)
      ? item.keywords.map((keyword) => String(keyword).trim()).filter(Boolean).slice(0, 8)
      : [];

    rows.push({
      title,
      angle: String(item.angle ?? "").trim(),
      category_id: category?.id ?? null,
      service_slug: serviceSlug,
      target_keyword: String(item.targetKeyword ?? title).trim().slice(0, 120),
      keywords,
      similarity_key: key,
      status: "queued",
      priority: target - index,
      source: "ai",
    });
  }

  if (rows.length === 0) {
    throw new Error("AI returnerade inga nya ämnen.");
  }

  const { error } = await admin.from("blog_topics").insert(rows);
  if (error) throw error;

  return rows.length;
}

async function publishQueuedTopic(
  admin: ReturnType<typeof createClient>,
  supabaseUrl: string,
  input: { topicId?: string; authorId?: string | null },
) {
  let query = admin.from("blog_topics").select("*").in("status", ["queued", "failed"]);

  if (input.topicId) {
    query = query.eq("id", input.topicId);
  } else {
    query = query.eq("status", "queued").order("priority", { ascending: false }).order("created_at", { ascending: true });
  }

  const { data: topic, error: topicError } = await query.limit(1).maybeSingle();
  if (topicError) throw topicError;
  if (!topic) {
    return { ok: false as const, error: "Inga ämnen i kön." };
  }

  const { data: claimed, error: claimError } = await admin
    .from("blog_topics")
    .update({ status: "writing", error: null, updated_at: new Date().toISOString() })
    .eq("id", topic.id)
    .in("status", ["queued", "failed"])
    .select("*")
    .maybeSingle();

  if (claimError) throw claimError;
  if (!claimed) {
    return { ok: false as const, error: "Ämnet hann tas av en annan körning." };
  }

  try {
    const article = await generateArticle(
      `${claimed.title}${claimed.angle ? `. ${claimed.angle}` : ""}`,
      HEMVANDA_SERVICES,
      claimed.service_slug ?? undefined,
    );
    const slug = await ensureUniqueSlug(admin, slugify(article.slug || article.title || claimed.title));

    let coverImageUrl: string | null = null;
    try {
      const image = await generateCoverImage(article.coverImagePrompt);
      const imagePath = `blog-covers/${crypto.randomUUID()}.${image.extension}`;
      const { error: uploadError } = await admin.storage.from("cms-media").upload(imagePath, image.bytes, {
        contentType: image.contentType,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      coverImageUrl = getPublicMediaUrl(supabaseUrl, imagePath);
    } catch (coverError) {
      console.error("generate-blog-post cover failed:", coverError);
    }

    const { data: insertedPost, error: insertError } = await admin
      .from("blog_posts")
      .insert({
        title: article.title.trim(),
        slug,
        excerpt: article.excerpt.trim(),
        content: sanitizeArticleContent(article.content.trim()),
        cover_image_url: coverImageUrl,
        category_id: claimed.category_id,
        status: "published",
        seo_title: article.seoTitle.trim(),
        seo_description: article.seoDescription.trim(),
        author_id: input.authorId ?? null,
        published_at: new Date().toISOString(),
      })
      .select("id, title, slug")
      .single();

    if (insertError) throw insertError;

    await admin
      .from("blog_topics")
      .update({
        status: "published",
        blog_post_id: insertedPost.id,
        error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", claimed.id);

    return {
      ok: true as const,
      postId: insertedPost.id,
      title: insertedPost.title,
      slug: insertedPost.slug,
      topicId: claimed.id,
      topic: claimed.title,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte publicera ämnet.";
    await admin
      .from("blog_topics")
      .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
      .eq("id", claimed.id);
    return { ok: false as const, error: message, topicId: claimed.id };
  }
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

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const isInternal = token === serviceRoleKey;
    const admin = createClient(supabaseUrl, serviceRoleKey);
    let authorId: string | null = null;

    if (!isInternal) {
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

      authorId = user.id;
    }

    const body = (await req.json()) as GenerateRequest;

    if (body.mode === "fill-topics") {
      const generated = await fillTopicQueue(admin, body.count ?? 12);
      return jsonResponse({ ok: true, generated });
    }

    if (body.mode === "publish-topic") {
      const published = await publishQueuedTopic(admin, supabaseUrl, {
        topicId: body.topicId,
        authorId,
      });
      return jsonResponse(published, published.ok ? 200 : 400);
    }
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
        author_id: authorId,
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
