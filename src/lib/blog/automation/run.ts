import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  activeSlotsForSettings,
  getLocalClock,
  isPublishIntervalOpen,
  isSlotOpen,
  normalizePublishTimes,
} from "@/lib/blog/automation/schedule";

type Db = SupabaseClient<Database>;
type Settings = Database["public"]["Tables"]["blog_automation_settings"]["Row"];

type GenerateResponse = {
  ok: boolean;
  error?: string;
  generated?: number;
  postId?: string;
  title?: string;
  slug?: string;
  topicId?: string;
  topic?: string;
};

function revalidatePublishedPost(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function callGenerateBlog(body: Record<string, unknown>): Promise<GenerateResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role saknas.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-blog-post`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as GenerateResponse;
  if (!response.ok || !payload.ok) {
    return {
      ok: false,
      error: payload.error || "Kunde inte köra blogg-AI.",
      topicId: payload.topicId,
    };
  }

  return payload;
}

export async function getBlogAutomationSettings(db: Db = createAdminClient()) {
  const { data, error } = await db.from("blog_automation_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Inställningar för automatisk blogg saknas.");
  return data;
}

export async function getBlogAutomationOverview(db: Db = createAdminClient()) {
  const settings = await getBlogAutomationSettings(db);
  const [{ count: queued }, { count: published }, { count: failed }, { data: topics }, { data: recentRuns }] =
    await Promise.all([
      db.from("blog_topics").select("id", { count: "exact", head: true }).eq("status", "queued"),
      db.from("blog_topics").select("id", { count: "exact", head: true }).eq("status", "published"),
      db.from("blog_topics").select("id", { count: "exact", head: true }).eq("status", "failed"),
      db
        .from("blog_topics")
        .select("id, title, status, error, created_at")
        .in("status", ["queued", "failed", "writing"])
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(12),
      db
        .from("blog_automation_runs")
        .select("id, slot_date, slot_time, status, error, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  return {
    settings,
    counts: {
      queued: queued || 0,
      published: published || 0,
      failed: failed || 0,
    },
    topics: topics || [],
    recentRuns: recentRuns || [],
  };
}

async function ensureTopicBuffer(db: Db, batchSize: number) {
  const { count, error } = await db
    .from("blog_topics")
    .select("id", { count: "exact", head: true })
    .eq("status", "queued");

  if (error) throw new Error(error.message);
  if ((count || 0) > 0) {
    return { generated: 0, queued: count || 0 };
  }

  const filled = await callGenerateBlog({ mode: "fill-topics", count: batchSize });
  if (!filled.ok) {
    throw new Error(filled.error || "Kunde inte fylla på ämnen.");
  }

  return { generated: filled.generated || 0, queued: filled.generated || 0 };
}

async function publishNextTopic(topicId?: string) {
  return callGenerateBlog({
    mode: "publish-topic",
    topicId,
  });
}

export async function refillTopicsNow(options?: { db?: Db; count?: number }) {
  const db = options?.db || createAdminClient();
  const settings = await getBlogAutomationSettings(db);
  const filled = await callGenerateBlog({
    mode: "fill-topics",
    count: options?.count || settings.topic_batch_size || 12,
  });
  if (!filled.ok) {
    throw new Error(filled.error || "Kunde inte fylla på ämnen.");
  }
  return { generated: filled.generated || 0 };
}

export async function processBlogAutomationTick(options?: { force?: boolean; db?: Db }) {
  const db = options?.db || createAdminClient();
  const settings: Settings = await getBlogAutomationSettings(db);

  if (!settings.enabled && !options?.force) {
    return { ok: true as const, skipped: true as const, reason: "disabled" };
  }

  const buffer = await ensureTopicBuffer(db, settings.topic_batch_size || 12);
  const clock = getLocalClock(settings.timezone || "Europe/Stockholm");
  const intervalDays = settings.interval_days || 3;

  if (!options?.force) {
    const { data: lastPublished } = await db
      .from("blog_automation_runs")
      .select("slot_date")
      .eq("status", "published")
      .order("slot_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      !isPublishIntervalOpen({
        intervalDays,
        lastPublishedDate: lastPublished?.slot_date ?? null,
        today: clock.date,
      })
    ) {
      await db
        .from("blog_automation_settings")
        .update({
          last_run_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      return {
        ok: true as const,
        skipped: true as const,
        reason: "interval",
        intervalDays,
        buffer,
        clock,
      };
    }
  }

  const slots = activeSlotsForSettings({
    postsPerDay: settings.posts_per_day,
    publishTimes: normalizePublishTimes(settings.publish_times),
  });
  const dueSlots = options?.force ? [clock.hhmm] : slots.filter((slot) => isSlotOpen(slot, clock));

  if (dueSlots.length === 0) {
    await db
      .from("blog_automation_settings")
      .update({
        last_run_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    return { ok: true as const, skipped: true as const, reason: "no_open_slot", buffer, clock, slots };
  }

  const results: Array<Record<string, unknown>> = [];

  for (const slot of dueSlots) {
    const slotKey = options?.force ? `force-${Date.now()}` : slot;

    if (!options?.force) {
      const { data: existing } = await db
        .from("blog_automation_runs")
        .select("id, status")
        .eq("slot_date", clock.date)
        .eq("slot_time", slot)
        .maybeSingle();

      if (existing) {
        results.push({ slot, skipped: true, reason: "already_ran" });
        continue;
      }
    }

    const { data: run, error: runError } = await db
      .from("blog_automation_runs")
      .insert({
        slot_date: clock.date,
        slot_time: slotKey,
        status: "started",
      })
      .select("id")
      .single();

    if (runError || !run) {
      results.push({ slot, error: runError?.message || "Kunde inte starta körningen." });
      continue;
    }

    const published = await publishNextTopic();
    if (!published.ok) {
      await db
        .from("blog_automation_runs")
        .update({
          status: "failed",
          error: published.error,
          topic_id: published.topicId ?? null,
        })
        .eq("id", run.id);
      results.push({ slot, error: published.error });
      continue;
    }

    await db
      .from("blog_automation_runs")
      .update({
        status: "published",
        topic_id: published.topicId ?? null,
        blog_post_id: published.postId ?? null,
        error: null,
      })
      .eq("id", run.id);

    revalidatePublishedPost(published.slug);
    results.push({
      slot,
      published: true,
      post: { id: published.postId, title: published.title, slug: published.slug },
      topicId: published.topicId,
    });
  }

  const failed = results.find((result) => result.error);
  await db
    .from("blog_automation_settings")
    .update({
      last_run_at: new Date().toISOString(),
      last_error: failed ? String(failed.error) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  return { ok: true as const, buffer, clock, slots, results };
}
