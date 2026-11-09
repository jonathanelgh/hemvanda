"use client";

import { useState, useTransition } from "react";
import {
  runBlogAutomationAction,
  saveBlogAutomationSettingsAction,
} from "@/app/admin/(dashboard)/blog/actions";
import { normalizePublishTimes } from "@/lib/blog/automation/schedule";

type BlogAutomationPanelProps = {
  settings: {
    enabled: boolean;
    intervalDays: number;
    publishTime: string;
    topicBatchSize: number;
    lastRunAt: string | null;
    lastError: string | null;
  };
  counts: {
    queued: number;
    published: number;
    failed: number;
  };
  topics: Array<{
    id: string;
    title: string;
    status: string;
    error: string | null;
  }>;
};

const statusLabels: Record<string, string> = {
  queued: "I kö",
  writing: "Skrivs",
  failed: "Misslyckades",
};

export function BlogAutomationPanel({ settings, counts, topics }: BlogAutomationPanelProps) {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [intervalDays, setIntervalDays] = useState(settings.intervalDays);
  const [publishTime, setPublishTime] = useState(
    normalizePublishTimes([settings.publishTime])[0] ?? "09:00",
  );
  const [topicBatchSize, setTopicBatchSize] = useState(settings.topicBatchSize);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(task: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) {
        setError(result.error || "Något gick fel.");
        return;
      }
      setMessage(result.message || "Sparat.");
    });
  }

  return (
    <section className="mb-6 rounded-2xl border border-gold/25 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Autopublicering</p>
          <h2 className="mt-1 font-display text-2xl text-green">AI-blogg på schema</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Ett inlägg publiceras åt gången, med det antal dagar du anger emellan. Artiklarna är SEO-texter
            om HemVändas tjänster i Stockholm och Stockholms områden.
          </p>
        </div>
        <p className="text-sm text-muted">
          {counts.queued} i kö · {counts.published} publicerade · {counts.failed} misslyckade
        </p>
      </div>

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          run(() =>
            saveBlogAutomationSettingsAction({
              enabled,
              intervalDays,
              publishTime,
              topicBatchSize,
            }),
          );
        }}
      >
        <label className="flex items-center gap-3 text-sm font-semibold text-green">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            disabled={isPending}
            className="h-4 w-4 rounded border-green/20"
          />
          Publicera automatiskt
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-green">Dagar mellan inlägg</span>
            <input
              type="number"
              min={1}
              max={30}
              value={intervalDays}
              onChange={(event) => setIntervalDays(Number(event.target.value))}
              disabled={isPending}
              className="rounded-xl border border-green/10 bg-ivory/30 px-4 py-3 text-sm text-green outline-none transition focus:border-gold"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-green">Ämnen per påfyllning</span>
            <input
              type="number"
              min={4}
              max={40}
              value={topicBatchSize}
              onChange={(event) => setTopicBatchSize(Number(event.target.value))}
              disabled={isPending}
              className="rounded-xl border border-green/10 bg-ivory/30 px-4 py-3 text-sm text-green outline-none transition focus:border-gold"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-green">Publiceras kl.</span>
            <input
              type="time"
              value={publishTime}
              onChange={(event) => setPublishTime(event.target.value)}
              disabled={isPending}
              className="rounded-xl border border-green/10 bg-ivory/30 px-3 py-3 text-sm text-green outline-none transition focus:border-gold"
            />
          </label>
        </div>

        {settings.lastRunAt ? (
          <p className="text-xs text-muted">
            Senaste körning: {new Date(settings.lastRunAt).toLocaleString("sv-SE")}
          </p>
        ) : null}
        {settings.lastError ? <p className="text-sm text-red-700">{settings.lastError}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {message ? <p className="text-sm text-green">{message}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
          >
            {isPending ? "Jobbar…" : "Spara schema"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(async () => {
                const result = await runBlogAutomationAction("refill_topics");
                return result.ok
                  ? { ok: true, message: `${result.generated ?? 0} nya ämnen lades i kön.` }
                  : result;
              })
            }
            className="rounded-full border border-green/15 px-5 py-3 text-sm font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
          >
            Fyll på ämnen
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(async () => {
                const result = await runBlogAutomationAction("publish_now");
                return result.ok
                  ? { ok: true, message: "Ett inlägg publicerades, eller så fanns ingen öppen lucka." }
                  : result;
              })
            }
            className="rounded-full border border-gold/40 px-5 py-3 text-sm font-semibold text-green transition hover:border-gold hover:text-gold disabled:opacity-60"
          >
            Publicera ett nu
          </button>
        </div>
      </form>

      {topics.length > 0 ? (
        <ul className="mt-5 grid gap-2">
          {topics.map((topic) => (
            <li key={topic.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="text-green">{topic.title}</span>
              <span className="text-xs text-muted">
                {statusLabels[topic.status] || topic.status}
                {topic.error ? ` · ${topic.error}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
